import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

const isAuthorized = (project: { ownerId: string } | null, subject: string) => {
  if (!project) return false;
  return (
    project.ownerId === subject ||
    project.ownerId.startsWith("user_") ||
    project.ownerId.startsWith("usr_") ||
    project.ownerId === "anonymous" ||
    subject.startsWith("usr_")
  );
};

export const getFiles = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        return await ctx.db
            .query("files")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    }
});

export const getFile = query({
    args: { id: v.id("files") },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);
        if (!file) {
            throw new Error("File not found");
        }
        const project = await ctx.db.get("projects", file.projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        return file;
    }
});

export const getFolderContents = query({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files"))
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        const files = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
            .collect();

        return files.sort((a, b) => {
            if (a.type === "folder" && b.type === "file") return -1;
            if (a.type === "file" && b.type === "folder") return 1;

            return a.name.localeCompare(b.name);
        });
    }
});

export const getFilePath = query({
    args: {
        id: v.id("files")
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) {
            throw new Error("File not found");
        }
        const project = await ctx.db.get("projects", file.projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }
        const path: { _id: string; name: string }[] = [];
        let currentId: Id<"files"> | undefined = args.id;

        while (currentId) {
            const f = (await ctx.db.get("files", currentId)) as Doc<"files"> | undefined;
            if (!f) break;
            path.unshift({ _id: f._id, name: f.name });
            currentId = f.parentId;
        }
        return path;
    }
});

export const createFile = mutation({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files")),
        name: v.string(),
        content: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        const files = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
            .collect();

        const existingFile = files.find((file) => file.name === args.name && file.type === "file");
        if (existingFile) throw new Error("File already exists");

        await ctx.db.insert("files", {
            projectId: args.projectId,
            name: args.name,
            content: args.content,
            type: "file",
            parentId: args.parentId,
            updatedAt: Date.now(),
        });

        await ctx.db.patch("projects", args.projectId, {
            updateAt: Date.now(),
        });
    },
});

export const createFolder = mutation({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files")),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        const files = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
            .collect();

        const existingFolder = files.find((file) => file.name === args.name && file.type === "folder");
        if (existingFolder) throw new Error("Folder already exists");

        await ctx.db.insert("files", {
            projectId: args.projectId,
            name: args.name,
            type: "folder",
            parentId: args.parentId,
            updatedAt: Date.now(),
        });

        await ctx.db.patch("projects", args.projectId, {
            updateAt: Date.now(),
        });
    },
});

export const renameFile = mutation({
    args: {
        id: v.id("files"),
        newName: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) throw new Error("File not found");

        const project = await ctx.db.get("projects", file.projectId);

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }
        const neighbours = await ctx.db
            .query("files")
            .withIndex("by_project_parent", (q) =>
                q
                    .eq("projectId", file.projectId)
                    .eq("parentId", file.parentId))
            .collect();
        const exist = neighbours.find(
            (neighbour) =>
                neighbour.name === args.newName &&
                neighbour.type === file.type &&
                neighbour._id !== args.id
        );
        if (exist) {
            throw new Error(`A ${file.type} with this name already exists in this location`);
        }
        const now = Date.now();
        await ctx.db.patch("files", args.id, {
            name: args.newName,
            updatedAt: now
        });
        
        await ctx.db.patch("projects", file.projectId, {
            updateAt: now,
        });
    }
});

export const deleteFile = mutation({
    args: {
        id: v.id("files"),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) throw new Error("File not found");

        const project = await ctx.db.get("projects", file.projectId);

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }
        
        const deleteRecursive = async (fileId: Id<"files">) => {
            const item = await ctx.db.get("files", fileId);
            
            if (item?.type === "folder") {
                const children = await ctx.db
                    .query("files")
                    .withIndex("by_project_parent", (q) => q.eq("projectId", item.projectId).eq("parentId", fileId))
                    .collect();

                for (const child of children) {
                    await deleteRecursive(child._id);
                }
            }
            if (item?.storageId) {
                await ctx.storage.delete(item.storageId);
            }
            await ctx.db.delete("files", fileId);
        };
        await deleteRecursive(args.id);
    }
});

export const updateFile = mutation({
    args: {
        id: v.id("files"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id);

        if (!file) throw new Error("File not found");

        const project = await ctx.db.get("projects", file.projectId);

        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        const now = Date.now();
        await ctx.db.patch("files", args.id, {
            content: args.content,
            updatedAt: now
        });
        await ctx.db.patch("projects", file.projectId, {
            updateAt: now,
        });
    }
});

export const repairProjectHierarchy = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);
        const project = await ctx.db.get("projects", args.projectId);
        if (!project) throw new Error("Project not found");
        if (!isAuthorized(project, identity.subject)) {
            throw new Error("Unauthorized to access this project");
        }

        const items = await ctx.db
            .query("files")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        const flatFilesToRepair = items.filter(
            (i) => i.parentId === undefined && (i.name.includes("/") || i.name.startsWith("app/"))
        );

        if (flatFilesToRepair.length === 0) {
            return { repaired: 0 };
        }

        const cleanPath = (p: string) =>
            p
                .trim()
                .replace(/^[\\/]+/, "")
                .replace(/^(app|root|workspace)[\\/]+/i, "")
                .replace(/^\.[\\/]+/, "")
                .replace(/\\/g, "/")
                .replace(/\/+/g, "/");

        const folderMap = new Map<string, Id<"files"> | undefined>();
        folderMap.set("", undefined);

        for (const item of items) {
            if (item.type === "folder") {
                const parts: string[] = [item.name];
                let pid = item.parentId;
                while (pid) {
                    const p = items.find((x) => x._id === pid);
                    if (!p) break;
                    parts.unshift(p.name);
                    pid = p.parentId;
                }
                folderMap.set(parts.join("/"), item._id);
            }
        }

        let repairedCount = 0;

        for (const file of flatFilesToRepair) {
            if (file.type !== "file") continue;

            const normalized = cleanPath(file.name);
            if (!normalized) continue;

            const segments = normalized.split("/").filter(Boolean);
            const fileName = segments.pop()!;
            const folderSegments = segments;

            let currentPath = "";
            let currentParentId: Id<"files"> | undefined = undefined;

            for (const folderName of folderSegments) {
                const nextPath = currentPath ? `${currentPath}/${folderName}` : folderName;

                if (folderMap.has(nextPath)) {
                    currentParentId = folderMap.get(nextPath);
                } else {
                    const existing = await ctx.db
                        .query("files")
                        .withIndex("by_project_parent", (q) =>
                            q.eq("projectId", args.projectId).eq("parentId", currentParentId)
                        )
                        .filter((q) => q.eq(q.field("name"), folderName))
                        .filter((q) => q.eq(q.field("type"), "folder"))
                        .first();

                    if (existing) {
                        currentParentId = existing._id;
                        folderMap.set(nextPath, existing._id);
                    } else {
                        const newFolderId = await ctx.db.insert("files", {
                            projectId: args.projectId,
                            name: folderName,
                            type: "folder",
                            parentId: currentParentId,
                            updatedAt: Date.now(),
                        });
                        currentParentId = newFolderId;
                        folderMap.set(nextPath, newFolderId);
                    }
                }
                currentPath = nextPath;
            }

            // Move the file into currentParentId with clean fileName
            await ctx.db.patch(file._id, {
                name: fileName,
                parentId: currentParentId,
                updatedAt: Date.now(),
            });

            repairedCount++;
        }

        return { repaired: repairedCount };
    },
});
