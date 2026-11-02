import { inngest } from "@/inngest/client";
import { Id } from "../../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { ARCHITECT_SYSTEM_PROMPT, CODER_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { fetchUpdatedDocumentation } from "@/lib/firecrawl";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../../convex/constants";
import { createAgent } from "@inngest/agent-kit";
import {
    getCodingModelCandidates,
    getInngestTitleModelCandidates,
    generateObjectWithFallback,
    generateTextWithFallback
} from "@/lib/ai-models";
import { z } from "zod";

interface MessageEvent{
    messageId:Id<"messages">,
    conversationId:Id<"conversations">,
    projectId:Id<"projects">
    message:string;
}

const architectSchema = z.object({
    files: z.array(z.object({
        path: z.string().describe("The file path, e.g., 'src/App.jsx' or 'package.json'"),
        instruction: z.string().describe("Detailed instructions for the coder agent on what to write in this file")
    }))
});

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
                        content:"âš ï¸ An error occurred while processing this request. Please try sending your message again."
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

        let historyText = "";
        const contextMessages=recentMessages.filter((msg)=>msg._id!==messageId && msg.content.trim()!== "")

        if(contextMessages.length>0){
            historyText=contextMessages.map((msg)=>`${msg.role.toUpperCase()}:${msg.content}`).join("\n\n");
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
                            console.log(`[Title Generator] âœ… Generated title with ${candidate.name}: "${title}"`);
                            break;
                        }
                    }
                } catch (titleErr: any) {
                    console.warn(`[Title Generator] âš ï¸ Candidate ${candidate.name} failed:`, titleErr?.message || titleErr);
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

        // ==========================================
        // Phase 0: Live Docs & Version Context via Firecrawl
        // ==========================================
        let liveDocumentation = "";
        try {
            liveDocumentation = await step.run("fetch-documentation-firecrawl", async () => {
                return await fetchUpdatedDocumentation(message);
            });
            if (liveDocumentation) {
                console.log(`[Firecrawl] Injected live documentation (${liveDocumentation.length} chars).`);
            }
        } catch (docErr) {
            console.warn("[Firecrawl] Could not fetch live documentation:", docErr);
        }

        // ==========================================
        // Phase 1: Architect (Planning)
        // ==========================================
        let architectPlan: { files: { path: string, instruction: string }[] } | null = null;
        try {
            architectPlan = await step.run("architect-phase", async () => {
                const candidates = getCodingModelCandidates();
                const architectPrompt = [
                    historyText ? `Project Context:\n${historyText}` : "",
                    liveDocumentation ? `\n${liveDocumentation}\n` : "",
                    `New Request: ${message}`
                ].filter(Boolean).join("\n\n");

                const { object } = await generateObjectWithFallback({
                    schema: architectSchema,
                    system: ARCHITECT_SYSTEM_PROMPT,
                    prompt: architectPrompt,
                    candidates
                });

                // Sanitize all file paths to remove /app/, leading slashes, etc.
                const cleanFiles = object.files.map((f) => ({
                    path: f.path
                        .trim()
                        .replace(/^[\\/]+/, "")
                        .replace(/^(app|root|workspace)[\\/]+/i, "")
                        .replace(/^\.[\\/]+/, "")
                        .replace(/\\/g, "/")
                        .replace(/\/+/g, "/"),
                    instruction: f.instruction,
                })).filter((f) => Boolean(f.path));

                return { files: cleanFiles };
            });
            console.log(`[Architect] Planned ${architectPlan?.files?.length || 0} files to create/modify.`);
        } catch (error: any) {
            console.error("[Architect] Failed to generate plan:", error);
            await step.run("update-message-on-plan-failure",async () =>{
                await convex.mutation(api.system.updateMessageContent,{
                    internalKey,
                    messageId,
                    content:`âš ï¸ The AI Architect failed to generate a project plan. Error: ${error.message || String(error)}`
                });
            });
            return { success: false, messageId };
        }

        // ==========================================
        // Phase 2: Parallel Coders
        // ==========================================
        let generatedFiles: { path: string, content: string }[] = [];
        try {
            if (architectPlan && architectPlan.files.length > 0) {
                generatedFiles = await step.run("parallel-coders-phase", async () => {
                    const planOverview = JSON.stringify(architectPlan!.files.map(f => f.path), null, 2);
                    
                    const files = await Promise.all(
                        architectPlan!.files.map(async (file) => {
                            const coderPrompt = `
Architect Plan Overview (All files in project):
${planOverview}

${liveDocumentation ? `${liveDocumentation}\n` : ""}
Your Assignment:
File to write: ${file.path}
Instructions: ${file.instruction}

Remember: Output ONLY the raw code for this file. No markdown formatting (\`\`\`js etc), no explanations. Just the code.
`;
                            const candidates = getCodingModelCandidates();
                            const { text } = await generateTextWithFallback({
                                system: CODER_SYSTEM_PROMPT,
                                prompt: coderPrompt,
                                candidates
                            });

                            // Clean any potential markdown blocks the model might incorrectly include
                            let cleanContent = text.trim();
                            if (cleanContent.startsWith("```")) {
                                const firstNewline = cleanContent.indexOf("\n");
                                if (firstNewline !== -1) cleanContent = cleanContent.slice(firstNewline + 1);
                                if (cleanContent.endsWith("```")) {
                                    cleanContent = cleanContent.slice(0, -3).trim();
                                }
                            }

                            return {
                                path: file.path,
                                content: cleanContent
                            };
                        })
                    );
                    return files;
                });
                console.log(`[Parallel Coders] Successfully generated ${generatedFiles.length} files.`);
            }
        } catch (error: any) {
            console.error("[Parallel Coders] Failed to generate code:", error);
             await step.run("update-message-on-code-failure",async () =>{
                await convex.mutation(api.system.updateMessageContent,{
                    internalKey,
                    messageId,
                    content:`âš ï¸ A Coder agent failed to generate a file. Error: ${error.message || String(error)}`
                });
            });
            return { success: false, messageId };
        }

        // Ensure essential React boilerplate if it's a React project
        const hasReactApp = generatedFiles.some(f => f.path.includes(".jsx") || f.path.includes(".tsx"));
        if (hasReactApp) {
            const hasPkg = generatedFiles.some(f => f.path === "package.json");
            if (!hasPkg) {
                generatedFiles.push({
                    path: "package.json",
                    content: JSON.stringify({
                        name: "codepilot-app",
                        private: true,
                        version: "0.1.0",
                        type: "module",
                        scripts: { dev: "vite", start: "vite", build: "vite build" },
                        dependencies: {
                            react: "^18.3.1",
                            "react-dom": "^18.3.1",
                            "lucide-react": "^0.454.0",
                            clsx: "^2.1.1",
                            "tailwind-merge": "^2.5.4",
                        },
                        devDependencies: {
                            "@vitejs/plugin-react": "^4.3.3",
                            vite: "^5.4.10",
                            tailwindcss: "^3.4.14",
                            postcss: "^8.4.47",
                            autoprefixer: "^10.4.20",
                        },
                    }, null, 2),
                });
            }

            const hasVite = generatedFiles.some(f => f.path === "vite.config.js" || f.path === "vite.config.ts");
            if (!hasVite) {
                generatedFiles.push({
                    path: "vite.config.js",
                    content: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});\n",
                });
            }

            const hasIndexHtml = generatedFiles.some(f => f.path === "index.html");
            if (!hasIndexHtml) {
                generatedFiles.push({
                    path: "index.html",
                    content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>CodePilot App</title>\n  </head>\n  <body class="bg-slate-950 text-slate-100 min-h-screen">\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n',
                });
            }
        }

        // ==========================================
        // Phase 3: Commit Phase (Hierarchical Folders & Files)
        // ==========================================
        await step.run("commit-phase", async () => {
            await convex.mutation(api.system.saveFileTree, {
                internalKey,
                projectId,
                files: generatedFiles,
            });
        });

        await step.run("update-assitant-message", async () => {
            const filesList = generatedFiles.map(f => `- \`${f.path}\``).join("\n");
            await convex.mutation(api.system.updateMessageContent, {
                internalKey,
                messageId,
                content: `### 🚀 Project Generated Successfully!\n\nI have generated your project with a complete folder structure and full component implementation:\n\n**📁 Files Created:**\n${filesList}\n\n**▶️ How to Run:**\nClick the **Preview** tab (or press **Alt+2**) in the top navigation bar to test your live app directly in the browser WebContainer!`
            });
        });

        return {
            success: true,
            messageId
        };
    }
);