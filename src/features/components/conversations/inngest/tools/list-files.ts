import z from "zod";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";


interface listFilesToolOptions{
    internalKey:string;
    projectId:Id<"projects">
}

const paramsSchema=z.object({
    fileIds:z.array(z.string().min(1,"File ID cannot be empty"))
    .min(1,"Provide at least one file ID")
})

export const createListFilesTool=({internalKey,projectId}:listFilesToolOptions)=>{
    return createTool({
        name:"listFiles",
        description:"List all  files and folders in the project. Returns names, IDs, types, and parentId for each item. Items with parentId: null are at root level. Use the parentId to understand the folder structure-items with the same parentId are in the same folder",
        parameters:z.object({
            fileIds:z.array(z.string().describe("Array of file IDs to read"))
        }),
        handler:async(_,{step:toolStep})=>{

            try {
                return await toolStep?.run("list-files",async()=>{
                   const files=await convex.query(api.system.getProjectFiles,{
                    internalKey,
                    projectId
                   })
                   const sorted=files.sort((a,b)=>{
                    if(a.type!==b.type){
                        return a.type === "folder" ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                   })
                   const fileList=sorted.map((f)=>({
                    id:f._id,
                    name:f.name,
                    type:f.type,
                    parentId:f.parentId ?? null
                   }))
                   return JSON.stringify(fileList)
                })
            } catch (error) {
                return `Error Listing files:${error instanceof Error ? error.message:"Unknown error"}`
            }
        }
    
    })
}