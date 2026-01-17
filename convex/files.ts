import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";
import { Id } from "./_generated/dataModel";



export const getFiles = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found");
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }

        return await ctx.db
            .query("files")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    }
})

export const getFile = query({
    args: { id: v.id("files") },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);
        if (!file) {
            throw new Error("File not found")
        }
        const project = await ctx.db.get("projects", file.projectId)

        if (!project) {
            throw new Error("Project not found");
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }

        return file;
    }
})

export const getFolderContents = query({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files"))
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found");
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }

        const files = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
            .collect();

        //sort krna hai : folder first -> files -> alphabetically within each group
        return files.sort((a, b) => {
            if (a.type === "folder" && b.type === "file") return -1;
            if (a.type === "file" && b.type === "folder") return 1;

            return a.name.localeCompare(b.name);
        })
    }
})

export const createFile = mutation({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files")),
        name: v.string(),
        content: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found");
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }

        const files = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
            .collect();

        const existingFile = files.find((file) => file.name === args.name && file.type === "file")
        if (existingFile) throw new Error("File alreadu exist");

        await ctx.db.insert("files", {
            projectId: args.projectId,
            name: args.name,
            content: args.content,
            type: "file",
            parentId: args.parentId,
            updatedAt: Date.now(),
        });

        await ctx.db.patch("projects",args.projectId,{
            updateAt:Date.now(),
    })

    },
})

export const createFolder = mutation({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files")),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found");
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }

        const files = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
            .collect();

        const existingFolder = files.find((file) => file.name === args.name && file.type === "folder")
        if (existingFolder) throw new Error("Folder already exist");

        await ctx.db.insert("files", {
            projectId: args.projectId,
            name: args.name,
            type: "folder",
            parentId: args.parentId,
            updatedAt: Date.now(),
        });

        await ctx.db.patch("projects",args.projectId,{
            updateAt:Date.now(),
    })

    },
})

export const renameFile = mutation({
    args: {
        id: v.id("files"),
        newName: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) throw new Error("File not found")

        const project = await ctx.db.get("projects", file.projectId)

        if (project?.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }
        const neighbours = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) =>
                q
                    .eq("projectId", file.projectId)
                    .eq("parentId", file.parentId))
            .collect()
        const exist=neighbours.find(
            (neighbour)=>
                neighbour.name === args.newName &&
                neighbour.type === file.type &&
                neighbour._id !== args.id
        )
        if(exist){
            throw new Error(`A ${file.type} with this name already exists in this location`)
        }
        const now=Date.now()
        await ctx.db.patch("files",args.id,{
            name:args.newName,
            updatedAt:now
        });
        
       await ctx.db.patch("projects",file.projectId,{
        updateAt:now,
    })
    }

})

export const deleteFile = mutation({
    args: {
        id: v.id("files"),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) throw new Error("File not found")

        const project = await ctx.db.get("projects", file.projectId)

        if (project?.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }
        
       const deleteRecursive = async (filedId:Id<"files">)=> {
        const item=await ctx.db.get("files",filedId);
        
        if(item?.type==="folder"){
            const children=await ctx.db
            .query("files")
            .withIndex("by_project_parent",(q)=>q.eq("projectId",item.projectId).eq("parentId",filedId))
            .collect();

            for(const child of children){
                await deleteRecursive(child._id);
            }
        }
        if(item?.storageId){
            await ctx.storage.delete(item.storageId)
        }
        await ctx.db.delete("files",filedId)
       };
       await deleteRecursive(args.id);
       
    }

});

export const updateFile=mutation({
    args:{
        id:v.id("files"),
        content:v.string(),
    },
    handler:async (ctx,args)=>{
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) throw new Error("File not found")

        const project = await ctx.db.get("projects", file.projectId)

        if (project?.ownerId !== identity.subject) {
            throw new Error("Unauthorized to access this project")
        }

        const now=Date.now();
        await ctx.db.patch("files",args.id,{
            content:args.content,
            updatedAt:now
        })
        await ctx.db.patch("projects",file.projectId,{
            updateAt:now,
        })
    }
})
