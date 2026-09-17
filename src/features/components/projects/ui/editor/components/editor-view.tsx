import Image from "next/image";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useFile, useUpdateFile } from "../../../hooks/use-files";
import { useEditor } from "../hooks/use-editor";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { TopNavigation } from "./top-navigation";
import { CodeEditor } from "./code-editor";
import { ThemeSelector } from "./theme-selector";
import { useEditorTheme } from "../store/use-editor-theme";
import { getEditorThemeById } from "../themes/editor-themes";
import { useEffect, useRef, useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react";

const DEBOUNCE_MS = 1200;

export const EditorView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);
  const updateFile = useUpdateFile();
  const themeId = useEditorTheme((state) => state.themeId);
  const currentTheme = getEditorThemeById(themeId);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const pendingContent = useRef<{ id: Id<"files">; content: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;

  // Flush any pending unsaved edits when tab switches or unmounts
  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (pendingContent.current) {
        updateFile(pendingContent.current);
        pendingContent.current = null;
      }
    };
  }, [activeTabId, updateFile]);

  const getFileExtension = (name?: string) => {
    if (!name) return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()?.toUpperCase() ?? "" : "";
  };

  return (
    <div className="h-full flex flex-col bg-background select-none">
      <div className="flex items-center justify-between border-b border-border bg-sidebar pr-2">
        <div className="flex-1 min-w-0">
          <TopNavigation projectId={projectId} />
        </div>
        <ThemeSelector className="h-7 text-[11px] shrink-0 ml-2" />
      </div>

      {activeTabId && (
        <div className="px-1 bg-background border-b border-border">
          <FileBreadcrumbs projectId={projectId} />
        </div>
      )}

      <div
        className="flex-1 min-h-0 relative transition-colors"
        style={{ backgroundColor: currentTheme.bgPreview }}
      >
        {!activeFile && (
          <div className="size-full flex flex-col items-center justify-center gap-3">
            <div className="relative p-6 rounded-lg bg-card border border-border flex flex-col items-center">
              <Image
                src="/logo.svg"
                alt="CodePilot"
                width={56}
                height={56}
                className="opacity-40 mb-2"
              />
              <p className="text-sm font-medium text-muted-foreground">No file open</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Select a file from the explorer or press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Ctrl+Shift+K</kbd> to search
              </p>
            </div>
          </div>
        )}

        {isActiveFileText && (
          <CodeEditor
            key={`${activeFile._id}-${themeId}`}
            initialValue={
              pendingContent.current?.id === activeFile._id
                ? pendingContent.current.content
                : (activeFile.content ?? "")
            }
            fileName={activeFile.name}
            onChange={(content: string) => {
              pendingContent.current = { id: activeFile._id, content };
              setIsSaving(true);
              if (timeout.current) {
                clearTimeout(timeout.current);
              }
              timeout.current = setTimeout(async () => {
                if (pendingContent.current) {
                  await updateFile(pendingContent.current);
                  pendingContent.current = null;
                }
                setIsSaving(false);
              }, DEBOUNCE_MS);
            }}
          />
        )}

        {isActiveFileBinary && (
          <div className="size-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 max-w-md text-center p-6 rounded-lg bg-card border border-border">
              <AlertTriangleIcon className="size-8 text-amber-500/80" />
              <p className="text-sm font-medium text-foreground">Binary or Unsupported File</p>
              <p className="text-xs text-muted-foreground">
                This file cannot be displayed in the text editor because it is either binary or encoded in an unsupported format.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Production IDE Bottom Status Bar */}
      <footer className="h-6 bg-sidebar border-t border-border px-3 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            <span className="font-sans">Ready</span>
          </div>

          {activeFile && (
            <>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1">
                {isSaving ? (
                  <span className="text-amber-500/90 font-sans">Saving...</span>
                ) : (
                  <span className="text-emerald-500/80 flex items-center gap-1 font-sans">
                    <CheckCircle2Icon className="size-3" /> Saved
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeFile && (
            <>
              <span>UTF-8</span>
              <span className="text-border">|</span>
              <span>Spaces: 2</span>
              <span className="text-border">|</span>
              <span className="font-sans uppercase text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-semibold">
                {getFileExtension(activeFile.name) || "TEXT"}
              </span>
              <span className="text-border">|</span>
            </>
          )}
          <ThemeSelector compact className="h-5 px-1.5 text-[10px]" />
          <span className="text-border">|</span>
          <div className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity" title="Multi-Model Auto-Fallback: Groq -> Gemini -> Hugging Face -> OpenAI">
            <SparklesIcon className="size-3 text-emerald-400" />
            <span className="font-sans font-medium text-[10px] text-emerald-400">Auto-Fallback Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};