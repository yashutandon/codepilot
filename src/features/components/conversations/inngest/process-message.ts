import { inngest } from "@/inngest/client";
import { Id } from "../../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { ARCHITECT_SYSTEM_PROMPT, CODER_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
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

        // ==========================================
        // Phase 1: Architect (Planning)
        // ==========================================
        let architectPlan: { files: { path: string, instruction: string }[] } | null = null;
        try {
            architectPlan = await step.run("architect-phase", async () => {
                const candidates = getCodingModelCandidates();
                const { object } = await generateObjectWithFallback({
                    schema: architectSchema,
                    system: ARCHITECT_SYSTEM_PROMPT,
                    prompt: historyText ? `Project Context:\n${historyText}\n\nNew Request: ${message}` : `New Request: ${message}`,
                    candidates
                });
                return object;
            });
            console.log(`[Architect] Planned ${architectPlan?.files?.length || 0} files to create/modify.`);
        } catch (error: any) {
            console.error("[Architect] Failed to generate plan:", error);
            await step.run("update-message-on-plan-failure",async () =>{
                await convex.mutation(api.system.updateMessageContent,{
                    internalKey,
                    messageId,
                    content:`⚠️ The AI Architect failed to generate a project plan. Error: ${error.message || String(error)}`
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
                    content:`⚠️ A Coder agent failed to generate a file. Error: ${error.message || String(error)}`
                });
            });
            return { success: false, messageId };
        }

        // ==========================================
        // Phase 3: Commit Phase
        // ==========================================
        await step.run("commit-phase", async () => {
            // Check if files already exist to update them instead of inserting new
            const existingProjectFiles = await convex.query(api.system.getProjectFiles, {
                internalKey,
                projectId,
            });

            for (const file of generatedFiles) {
                const existingFile = existingProjectFiles?.find(f => f.name === file.path);
                
                if (existingFile) {
                    await convex.mutation(api.system.updateFile, {
                        internalKey,
                        fileId: existingFile._id,
                        content: file.content
                    });
                } else {
                    await convex.mutation(api.system.createFile, {
                        internalKey,
                        projectId,
                        name: file.path,
                        content: file.content,
                    });
                }
            }
        });

        await step.run("update-assitant-message",async () => {
            const filesList = generatedFiles.map(f => `- ` + f.path).join("\n");
            await convex.mutation(api.system.updateMessageContent,{
                internalKey,
                messageId,
                content: `I have generated your project using a parallel multi-agent architecture!\n\n**Files Generated:**\n${filesList}\n\nLet me know if you need anything else.`
            });
        });

        return {
            success:true,
            messageId
        };
    }
);