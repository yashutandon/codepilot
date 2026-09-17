import { z } from "zod";
import { createTool } from "@inngest/agent-kit";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface CreateFilesToolOptions {
  projectId: Id<"projects">;
  internalKey: string;
}

const paramsSchema = z.object({
  parentId: z.string().nullable().optional(),
  files: z
    .array(
      z.object({
        name: z.string().min(1, "File name cannot be empty"),
        content: z.string(),
      })
    )
    .min(1, "Provide at least one file to create"),
});

export const createCreateFilesTool = ({
  projectId,
  internalKey,
}: CreateFilesToolOptions) => {
  return createTool({
    name: "createFiles",
    description:
      "Create multiple files at once in the project. For root level files (e.g. package.json, index.html, vite.config.js), pass parentId as null. For subdirectories, pass the parent folder ID from listFiles.",
    parameters: z.object({
      parentId: z
        .string()
        .nullable()
        .describe(
          "The ID of the parent folder from listFiles, or null for root level directory."
        ),
      files: z
        .array(
          z.object({
            name: z.string().describe("The file name including extension (e.g. 'package.json', 'src/App.jsx')"),
            content: z.string().describe("The full code content of the file"),
          })
        )
        .describe("Array of files to create"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }

      const { parentId, files } = parsed.data;

      try {
        return await toolStep?.run("create-files", async () => {
          let resolvedParentId: Id<"files"> | undefined;

          if (parentId && parentId !== "") {
            try {
              resolvedParentId = parentId as Id<"files">;
              const parentFolder = await convex.query(api.system.getFileId, {
                internalKey,
                fileId: resolvedParentId,
              });
              if (!parentFolder) {
                return `Error: Parent folder with ID "${parentId}" not found. Use listFiles to get valid folder IDs.`;
              }
              if (parentFolder.type !== "folder") {
                return `Error: The ID "${parentId}" is a file, not a folder. Use a folder ID as parentId.`;
              }
            } catch {
              return `Error: Invalid parentId "${parentId}". Use listFiles to get valid folder IDs, or use empty string for root level.`;
            }
          }

          const results = await convex.mutation(api.system.createFiles, {
            internalKey,
            projectId,
            parentId: resolvedParentId,
            files,
          });

          const created = results.filter((r) => !r.error);
          const failed = results.filter((r) => r.error);

          let response = `Created ${created.length} file(s)`;
          if (created.length > 0) {
            response += `: ${created.map((r) => r.name).join(", ")}`;
          }
          if (failed.length > 0) {
            response += `. Failed: ${failed.map((r) => `${r.name} (${r.error})`).join(", ")}`;
          }

          return response;
        });
      } catch (error) {
        return `Error creating files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  });
};