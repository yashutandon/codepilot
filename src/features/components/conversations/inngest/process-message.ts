import { inngest } from "@/inngest/client";
import { Id } from "../../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../../convex/constants";
import { createAgent, createNetwork } from "@inngest/agent-kit";
import {
    getInngestCodingModelCandidates,
    getInngestTitleModelCandidates,
} from "@/lib/ai-models";
import { createReadFilesTool } from "./tools/read-files";
import { createListFilesTool } from "./tools/list-files";
import { createUpdateFilesTool } from "./tools/update-files";
import { createCreateFilesTool } from "./tools/create-files";
import { createCreateFolderTool } from "./tools/create-folders";
import { createRenameFileTool } from "./tools/rename-file";
import { createScrapeUrlsTool } from "./tools/scrape-urls";
import { createDeleteFilesTool } from "./tools/delete-files";

interface MessageEvent{
    messageId:Id<"messages">,
    conversationId:Id<"conversations">,
    projectId:Id<"projects">
    message:string;
}

export const processMessage= inngest.createFunction(
    {
        id:"process-message",
        retries: 0,
        cancelOn:[
            {
                event:"message/cancel",
                if:"event.data.messageId == async.data.messageId"
            }
        ],
        onFailure: async ({event,step})=>{
            const {messageId}=event.data.event.data as MessageEvent;
            const internalKey=process.env.CONVEX_INTERNAL_KEY
            if(internalKey){
                await step.run("update-message-on-failure",async () =>{
                    await convex.mutation(api.system.updateMessageContent,{
                        internalKey,
                        messageId,
                        content:"⚠️ An error occurred while processing this request. Please try sending your message again."
                    })
                })
            }
        }
    },
    {
        event:"message/sent"
    },
    async ({event,step})=>{
        const {messageId,conversationId,projectId,message}=event.data as MessageEvent;
        const internalKey=process.env.CONVEX_INTERNAL_KEY;

        if(!internalKey){
            throw new NonRetriableError("CONVEX_INTERNAL_KEY is not configured")
        }
        await step.sleep("wait-for-db-sync","1s")
        const conversation=await step.run("get-conversation",async()=>{
                return await convex.query(api.system.getConversationById,{
                    internalKey,
                    conversationId
                })
        });

        if(!conversation){
            throw new NonRetriableError("Converstion not found")
        }

        const recentMessages=await step.run("get-recent-messages",async () =>{
            return await convex.query(api.system.getRecentMessages,{
                internalKey,
                conversationId,
                limit:10
            })
        })

        
        let systemPrompt=CODING_AGENT_SYSTEM_PROMPT;
        const contextMessages=recentMessages.filter((msg)=>msg._id!==messageId && msg.content.trim()!== "")

        if(contextMessages.length>0){
            const historyText=contextMessages.map((msg)=>`${msg.role.toUpperCase()}:${msg.content}`).join("\n\n");
            systemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`;
        }

        const shouldGenerateTitle=conversation.title===DEFAULT_CONVERSATION_TITLE;

        if(shouldGenerateTitle){
            const titleCandidates = getInngestTitleModelCandidates();
            const titlePrompt = message.length > 300 ? message.slice(0, 300) + "..." : message;
            let generatedTitle = "";

            for (const candidate of titleCandidates) {
                try {
                    const titleAgent = createAgent({
                        name: "title-generator",
                        system: TITLE_GENERATOR_SYSTEM_PROMPT,
                        model: candidate.getModel(),
                    });
                    const { output } = await titleAgent.run(titlePrompt, { step });
                    const textMessage = output.find((m) => m.type === "text" && m.role === "assistant");

                    if (textMessage?.type === "text") {
                        const title = typeof textMessage.content === "string"
                            ? textMessage.content.trim()
                            : textMessage.content.map((c) => c.text).join("").trim();

                        if (title) {
                            generatedTitle = title;
                            console.log(`[Title Generator] ✅ Generated title with ${candidate.name}: "${title}"`);
                            break;
                        }
                    }
                } catch (titleErr: any) {
                    console.warn(`[Title Generator] ⚠️ Candidate ${candidate.name} failed:`, titleErr?.message || titleErr);
                }
            }

            if (generatedTitle) {
                await step.run("update-conversation-title", async () => {
                    await convex.mutation(api.system.updateConversationTitle, {
                        internalKey,
                        conversationId,
                        title: generatedTitle,
                    });
                    try {
                        await convex.mutation(api.system.updateProjectName, {
                            internalKey,
                            projectId,
                            name: generatedTitle,
                        });
                    } catch (e) {
                        console.warn("Could not sync project name:", e);
                    }
                });
            }
        }

        const tools = [
            createReadFilesTool({internalKey}),
            createListFilesTool({internalKey,projectId}),
            createUpdateFilesTool({internalKey}),
            createCreateFilesTool({projectId,internalKey}),
            createCreateFolderTool({projectId,internalKey}),
            createRenameFileTool({internalKey}),
            createDeleteFilesTool({internalKey}),
            createScrapeUrlsTool()
        ];

        const codingCandidates = getInngestCodingModelCandidates();
        let assistantResponse = "I processed your request. Let me know if you need anything else!";
        let succeededModel = "";
        const attemptedErrors: string[] = [];

        for (let i = 0; i < codingCandidates.length; i++) {
            const candidate = codingCandidates[i];
            console.log(`[Inngest Agent] Attempting coding agent with ${candidate.name} (${i + 1}/${codingCandidates.length})...`);

            try {
                const codingAgent = createAgent({
                    name: `codepilot-${i}`,
                    description: "An expert AI coding assistant",
                    system: systemPrompt,
                    model: candidate.getModel(),
                    tools,
                });

                const network = createNetwork({
                    name: `codepilot-network-${i}`,
                    agents: [codingAgent],
                    maxIter: 10,
                    router: ({ network }) => {
                        const lastResult = network.state.results.at(-1);
                        const hasTextResponse = lastResult?.output.some(
                            (m) => m.type === "text" && m.role === "assistant"
                        );
                        const hasToolCalls = lastResult?.output.some(
                            (m) => m.type === "tool_call"
                        );
                        if (hasTextResponse && !hasToolCalls) {
                            return undefined;
                        }
                        return codingAgent;
                    },
                });

                const result = await network.run(message);
                const lastResult = result.state.results.at(-1);
                const textMessage = lastResult?.output.find(
                    (m) => m.type === "text" && m.role === "assistant"
                );

                if (textMessage?.type === "text") {
                    assistantResponse = typeof textMessage.content === "string"
                        ? textMessage.content
                        : textMessage.content.map((c) => c.text).join("");
                }

                succeededModel = candidate.name;
                console.log(`[Inngest Agent] ✅ Successfully processed request with ${candidate.name}`);
                break;
            } catch (networkErr: any) {
                const errMsg = networkErr?.message || String(networkErr);
                console.warn(`[Inngest Agent] ⚠️ Model ${candidate.name} failed: ${errMsg}`);
                attemptedErrors.push(`${candidate.name}: ${errMsg}`);

                if (errMsg.includes("429") && i < codingCandidates.length - 1) {
                    console.log(`[Inngest Agent] Rate limit reached on ${candidate.name}. Falling back immediately to next model...`);
                    await new Promise((r) => setTimeout(r, 1500));
                }
            }
        }

        if (!succeededModel) {
            assistantResponse = `⚠️ **Error processing request**: All AI models in the fallback chain were attempted and failed.\n\n**Attempted models:**\n${attemptedErrors.map((e) => `- ${e}`).join("\n")}\n\nPlease try again or verify your API keys.`;
        }

        await step.run("ensure-package-json", async () => {
            const projectFiles = await convex.query(api.system.getProjectFiles, {
                internalKey,
                projectId,
            });

            if (projectFiles && projectFiles.length > 0) {
                const hasPkg = projectFiles.some((f) => f.name === "package.json");
                if (!hasPkg) {
                    const defaultPkg = {
                        name: "codepilot-app",
                        private: true,
                        version: "0.1.0",
                        type: "module",
                        scripts: {
                            dev: "vite",
                            start: "vite",
                            build: "vite build",
                            preview: "vite preview"
                        },
                        dependencies: {
                            react: "^18.3.1",
                            "react-dom": "^18.3.1",
                            "lucide-react": "^0.454.0",
                            "clsx": "^2.1.1",
                            "tailwind-merge": "^2.5.4"
                        },
                        devDependencies: {
                            "@vitejs/plugin-react": "^4.3.3",
                            vite: "^5.4.10"
                        }
                    };

                    await convex.mutation(api.system.createFile, {
                        internalKey,
                        projectId,
                        name: "package.json",
                        content: JSON.stringify(defaultPkg, null, 2),
                    });
                }

                const hasViteConfig = projectFiles.some(
                    (f) => f.name === "vite.config.js" || f.name === "vite.config.ts"
                );
                if (!hasViteConfig) {
                    await convex.mutation(api.system.createFile, {
                        internalKey,
                        projectId,
                        name: "vite.config.js",
                        content: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});\n",
                    });
                }
            }
        });

        await step.run("update-assitant-message",async () => {
            await convex.mutation(api.system.updateMessageContent,{
                internalKey,
                messageId,
                content:assistantResponse
            })
        })

        return {
            success:true,
            messageId
        }
    }
)