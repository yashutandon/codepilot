import { FileSystemTree } from "@webcontainer/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

type FileDoc = Doc<"files">;

const cleanSegment = (str: string): string =>
    str
        .trim()
        .replace(/^[\\/]+/, "")
        .replace(/^(app|root|workspace)[\\/]+/i, "")
        .replace(/^\.[\\/]+/, "")
        .replace(/\\/g, "/");

export const buildTreeFile = (files: FileDoc[]): FileSystemTree => {
    const tree: FileSystemTree = {};
    const filesMap = new Map(files.map((f) => [f._id, f]));

    const getPath = (file: FileDoc): string[] => {
        const cleaned = cleanSegment(file.name);
        const nameParts = cleaned.split("/").filter(Boolean);
        const parts: string[] = [...nameParts];
        let parentId = file.parentId;

        while (parentId) {
            const parent = filesMap.get(parentId);
            if (!parent) break;
            const parentCleaned = cleanSegment(parent.name);
            const parentParts = parentCleaned.split("/").filter(Boolean);
            parts.unshift(...parentParts);
            parentId = parent.parentId;
        }
        return parts;
    };

    for (const file of files) {
        const pathParts = getPath(file);
        if (pathParts.length === 0) continue;

        let current = tree;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const isLast = i === pathParts.length - 1;

            if (isLast) {
                if (file.type === "folder") {
                    if (!current[part]) {
                        current[part] = { directory: {} };
                    }
                } else if (!file.storageId && file.content !== undefined) {
                    let contents = file.content;
                    const cleanFileName = cleanSegment(file.name).split("/").pop() || file.name;
                    if (cleanFileName === "package.json") {
                        try {
                            const pkg = JSON.parse(contents);
                            let modified = false;
                            if (!pkg.scripts) {
                                pkg.scripts = { dev: "vite", start: "vite", build: "vite build" };
                                modified = true;
                            } else if (!pkg.scripts.dev) {
                                if (pkg.scripts.start) {
                                    pkg.scripts.dev = pkg.scripts.start;
                                    modified = true;
                                } else if (pkg.scripts.serve) {
                                    pkg.scripts.dev = pkg.scripts.serve;
                                    modified = true;
                                }
                            }
                            if (modified) {
                                contents = JSON.stringify(pkg, null, 2);
                            }
                        } catch {}
                    }
                    current[part] = { file: { contents } };
                }
            } else {
                if (!current[part]) {
                    current[part] = { directory: {} };
                }
                const node = current[part];
                if ("directory" in node) {
                    current = node.directory;
                }
            }
        }
    }
    return tree;
};

export const getFilePath = (
    file: FileDoc,
    filesMap: Map<Id<"files">, FileDoc>
): string => {
    const parts: string[] = cleanSegment(file.name).split("/").filter(Boolean);
    let parentId = file.parentId;
    while (parentId) {
        const parent = filesMap.get(parentId);
        if (!parent) break;
        const parentParts = cleanSegment(parent.name).split("/").filter(Boolean);
        parts.unshift(...parentParts);
        parentId = parent.parentId;
    }
    return parts.join("/");
};
