import z from "zod";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";


interface UpdateFilesToolOptions{
    internalKey:string;
}

const paramsSchema=z.object({
    fileId:z.string().min(1,"File ID is required"),
    content:z.string()
})

export const createUpdateFilesTool=({internalKey}:UpdateFilesToolOptions)=>{
    return createTool({
        name:"updateFiles",
        description:"Update the content of the existing file",
        parameters:z.object({
            fileId:z.string().describe("The ID of the file to update"),
            content:z.string().describe("The new content for the file")
        }),
        handler:async(params,{step:toolStep})=>{
            const parsed=paramsSchema.safeParse(params);
            if(!parsed.success){
                return `Error: ${parsed.error.issues[0].message}`;
            }
            const {fileId,content}=parsed.data;

            const file=await convex.query(api.system.getFileId,{
                internalKey,
                fileId:fileId as Id<"files">
            })

            if(!file){
                return `Error: File with IDS "${fileId}" not found. Use listFiles to get valid file IDs.`
            }

            if(file.type==="folder"){
                return `Error: "${fileId}" is a folder, not a file, You can only update file contents.`
            }

            try {
                return await toolStep?.run("update-files",async()=>{
                    const results:{id:string; name:string; content:string}[]=[];
                    await convex.mutation(api.system.updateFile,{
                        internalKey,
                        fileId:fileId as Id<"files">,
                        content
                    })
                    return `File "${file.name}" updated successfully`
                })
            } catch (error) {
                return `Error update files:${error instanceof Error ? error.message:"Unknown error"}`
            }
        }
    
    })
}