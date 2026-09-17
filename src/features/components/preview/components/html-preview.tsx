"use client";

import { useMemo, useState } from "react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { getFilePath } from "../utils/file-tree";
import { AlertCircleIcon, ExternalLinkIcon, FileCodeIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type FileDoc = Doc<"files">;

interface HtmlPreviewProps {
  files?: FileDoc[];
}

export const HtmlPreview = ({ files = [] }: HtmlPreviewProps) => {
  const [reloadKey, setReloadKey] = useState(0);

  // Find all HTML files
  const htmlFiles = useMemo(() => {
    return files.filter(
      (f) => f.type === "file" && f.name.toLowerCase().endsWith(".html")
    );
  }, [files]);

  // Default to index.html or first html file
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const activeHtmlFile = useMemo(() => {
    if (selectedFileId) {
      const found = htmlFiles.find((f) => f._id === selectedFileId);
      if (found) return found;
    }
    const indexHtml = htmlFiles.find(
      (f) => f.name.toLowerCase() === "index.html"
    );
    return indexHtml ?? htmlFiles[0] ?? null;
  }, [htmlFiles, selectedFileId]);

  // Build a path-to-file map
  const filePathsMap = useMemo(() => {
    const map = new Map<string, FileDoc>();
    const filesMap = new Map(files.map((f) => [f._id, f]));

    for (const file of files) {
      if (file.type !== "file") continue;
      const fullPath = getFilePath(file, filesMap).toLowerCase();
      map.set(fullPath, file);
      map.set(file.name.toLowerCase(), file);
      map.set(`./${file.name.toLowerCase()}`, file);
      map.set(`/${file.name.toLowerCase()}`, file);
    }
    return map;
  }, [files]);

  // Compile HTML with inlined local CSS and JS
  const compiledHtml = useMemo(() => {
    if (!activeHtmlFile || !activeHtmlFile.content) return "";

    let html = activeHtmlFile.content;

    // 1. Inline local CSS: <link rel="stylesheet" href="...">
    html = html.replace(
      /<link\b([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
      (match, pre, href, post) => {
        const cleanHref = href.trim();
        // Skip external CDNs or absolute URLs
        if (
          cleanHref.startsWith("http://") ||
          cleanHref.startsWith("https://") ||
          cleanHref.startsWith("//") ||
          cleanHref.startsWith("data:")
        ) {
          return match;
        }

        const normalized = cleanHref.toLowerCase().replace(/^\.\//, "");
        const cssFile =
          filePathsMap.get(normalized) ||
          filePathsMap.get(cleanHref.toLowerCase()) ||
          filePathsMap.get(normalized.split("/").pop() || "");

        if (cssFile && cssFile.content) {
          return `<style data-source="${cleanHref}">\n${cssFile.content}\n</style>`;
        }
        return match;
      }
    );

    // 2. Inline local JS: <script src="..."></script>
    html = html.replace(
      /<script\b([^>]*?)src=["']([^"']+)["']([^>]*?)>([\s\S]*?)<\/script>/gi,
      (match, pre, src, post) => {
        const cleanSrc = src.trim();
        // Skip external CDNs or absolute URLs
        if (
          cleanSrc.startsWith("http://") ||
          cleanSrc.startsWith("https://") ||
          cleanSrc.startsWith("//") ||
          cleanSrc.startsWith("data:")
        ) {
          return match;
        }

        const normalized = cleanSrc.toLowerCase().replace(/^\.\//, "");
        const jsFile =
          filePathsMap.get(normalized) ||
          filePathsMap.get(cleanSrc.toLowerCase()) ||
          filePathsMap.get(normalized.split("/").pop() || "");

        if (jsFile && jsFile.content) {
          return `<script data-source="${cleanSrc}">\n${jsFile.content}\n</script>`;
        }
        return match;
      }
    );

    return html;
  }, [activeHtmlFile, filePathsMap]);

  const handleOpenInNewTab = () => {
    if (!compiledHtml) return;
    const blob = new Blob([compiledHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (!activeHtmlFile) {
    return (
      <div className="size-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-background">
        <AlertCircleIcon className="size-8 text-amber-500 mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">
          No HTML File Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Create an <code className="bg-muted px-1.5 py-0.5 rounded font-mono">index.html</code> file in the file explorer to preview your web page here.
        </p>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Sub-header for HTML Preview controls */}
      <div className="h-8 flex items-center justify-between px-3 border-b border-border/60 bg-muted/20 text-xs shrink-0">
        <div className="flex items-center gap-2 font-mono">
          <FileCodeIcon className="size-3.5 text-orange-400" />
          {htmlFiles.length > 1 ? (
            <select
              value={activeHtmlFile._id}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="bg-background text-foreground text-xs px-2 py-0.5 rounded border border-border focus:outline-hidden"
            >
              {htmlFiles.map((file) => (
                <option key={file._id} value={file._id}>
                  {file.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-foreground font-medium">
              {activeHtmlFile.name}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-sans px-1.5 py-0.2 rounded bg-muted/60">
            Live Static
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload HTML frame"
          >
            <RefreshCwIcon className="size-3 mr-1" />
            Reload
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={handleOpenInNewTab}
            title="Open HTML in new tab"
          >
            <ExternalLinkIcon className="size-3 mr-1" />
            Pop out
          </Button>
        </div>
      </div>

      {/* Sandboxed HTML Iframe */}
      <div className="flex-1 min-h-0 bg-white relative">
        <iframe
          key={reloadKey}
          srcDoc={compiledHtml}
          title="HTML Preview"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
          className="size-full border-0 bg-white"
        />
      </div>
    </div>
  );
};
