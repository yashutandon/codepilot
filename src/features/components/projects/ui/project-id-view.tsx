"use client";

import { cn } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { Allotment } from "allotment";
import FileExplorer from "./file-explorer";
import { EditorView } from "./editor/components/editor-view";
import { PreviewView } from "./preview-view";
import { ExportPopover } from "./export-popup";
import { Code2Icon, PlayIcon } from "lucide-react";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 280;
const DEFAULT_MAIN_SIZE = 1000;

export const ProjectIdView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");

  // Keyboard shortcut: Alt+1 for Code, Alt+2 for Preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "Digit1") {
        e.preventDefault();
        setActiveView("editor");
      } else if (e.altKey && e.code === "Digit2") {
        e.preventDefault();
        setActiveView("preview");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* View Switcher Sub-nav */}
      <nav className="h-9 flex items-center justify-between px-2.5 bg-sidebar border-b border-border/70 shrink-0">
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/40 border border-border/50">
          <button
            type="button"
            onClick={() => setActiveView("editor")}
            title="Editor View (Alt+1)"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer",
              activeView === "editor"
                ? "bg-background text-foreground shadow-xs border border-border/40 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2Icon className="size-3.5 text-blue-400" />
            <span>Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("preview")}
            title="Runtime Preview (Alt+2)"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer",
              activeView === "preview"
                ? "bg-background text-foreground shadow-xs border border-border/40 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PlayIcon className="size-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ExportPopover projectId={projectId} />
        </div>
      </nav>

      {/* Main Workspace Area */}
      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            activeView === "editor" ? "visible" : "invisible"
          )}
        >
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              <EditorView projectId={projectId} />
            </Allotment.Pane>
          </Allotment>
        </div>

        <div
          className={cn(
            "absolute inset-0",
            activeView === "preview" ? "visible" : "invisible"
          )}
        >
          <PreviewView
            projectId={projectId}
            enabled={activeView === "preview"}
          />
        </div>
      </div>
    </div>
  );
};
