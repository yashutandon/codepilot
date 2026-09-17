"use client";

import { useEffect, useState } from "react";
import { Allotment } from "allotment";
import {
  Loader2Icon,
  TerminalSquareIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ServerIcon,
  GlobeIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { useWebContainer } from "../../preview/hooks/use-webcontainer";
import { PreviewSettingsPopover } from "../../preview/components/preview-settings-popover";
import { PreviewTerminal } from "../../preview/components/preview-terminal";
import { HtmlPreview } from "../../preview/components/html-preview";

import { Button } from "@/components/ui/button";
import { useProject } from "../hooks/use-projects";
import { useFiles } from "../hooks/use-files";
import { cn } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";

export const PreviewView = ({
  projectId,
  enabled = true,
}: {
  projectId: Id<"projects">;
  enabled?: boolean;
}) => {
  const project = useProject(projectId);
  const files = useFiles(projectId);

  const [showTerminal, setShowTerminal] = useState(true);
  const [previewMode, setPreviewMode] = useState<"server" | "html">("server");

  const {
    status,
    previewUrl,
    error,
    restart,
    terminalOutput,
    hasPackageJson,
    hasHtmlFile,
    isCommandRunning,
    activeCommand,
    executeCommand,
    killCurrentProcess,
    clearTerminal,
  } = useWebContainer({
    projectId,
    enabled,
    settings: project?.settings,
  });

  // Auto-switch to HTML preview if the project is a static HTML site without package.json
  useEffect(() => {
    if (files && files.length > 0) {
      const hasPkg = files.some((f) => f.name === "package.json");
      const hasHtml = files.some((f) => f.name.endsWith(".html"));
      if (!hasPkg && hasHtml) {
        setPreviewMode("html");
      }
    }
  }, [files]);

  const isLoading = status === "booting" || status === "installing";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Preview Header */}
      <div className="h-9 flex items-center justify-between border-b border-border/70 bg-sidebar px-2 shrink-0 gap-2">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/40 border border-border/60">
          <button
            type="button"
            onClick={() => setPreviewMode("server")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
              previewMode === "server"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Node / Vite Dev Server"
          >
            <ServerIcon className="size-3 text-blue-400" />
            <span>Dev Server</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode("html")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
              previewMode === "html"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Live Static HTML/CSS/JS Preview"
          >
            <GlobeIcon className="size-3 text-emerald-400" />
            <span>HTML Preview</span>
          </button>
        </div>

        {/* Status / URL Display */}
        <div className="flex-1 h-7 flex items-center px-3 bg-background border border-border/60 rounded text-xs text-muted-foreground truncate font-mono">
          {previewMode === "server" ? (
            <>
              {isLoading && (
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Loader2Icon className="size-3 animate-spin" />
                  <span>{status === "booting" ? "Booting WebContainer..." : "Installing dependencies..."}</span>
                </div>
              )}
              {previewUrl && (
                <span className="truncate text-foreground font-medium">{previewUrl}</span>
              )}
              {!isLoading && !previewUrl && !error && (
                <span>
                  {hasPackageJson ? "Ready to preview" : "Static project (use HTML Preview tab or run commands)"}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-foreground">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              <span>Static HTML Sandbox (Real-time Live Sync)</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {previewMode === "server" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={isLoading}
              onClick={restart}
              title="Restart container"
            >
              <RefreshCwIcon className="size-3.5" />
            </Button>
          )}

          {previewMode === "server" && previewUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => window.open(previewUrl, "_blank")}
              title="Open preview in new tab"
            >
              <ExternalLinkIcon className="size-3.5" />
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 w-7 p-0",
              showTerminal && "bg-muted text-foreground"
            )}
            title="Toggle terminal"
            onClick={() => setShowTerminal((value) => !value)}
          >
            <TerminalSquareIcon className="size-3.5" />
          </Button>

          {previewMode === "server" && (
            <PreviewSettingsPopover
              projectId={projectId}
              initialValues={project?.settings}
              onSave={restart}
            />
          )}
        </div>
      </div>

      {/* Main Preview & Terminal Workspace */}
      <div className="flex-1 min-h-0">
        <Allotment vertical>
          {/* Top: Selected Preview Mode */}
          <Allotment.Pane>
            {previewMode === "html" ? (
              <HtmlPreview files={files} />
            ) : (
              <div className="size-full bg-background relative">
                {error && (
                  <div className="size-full flex items-center justify-center text-muted-foreground p-4">
                    <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                      <AlertTriangleIcon className="size-6 text-amber-500" />
                      <p className="text-sm font-medium text-foreground">{error}</p>
                      <p className="text-xs text-muted-foreground">
                        Try running commands directly in the terminal below or restart.
                      </p>
                      <Button size="sm" variant="outline" onClick={restart}>
                        <RefreshCwIcon className="size-4 mr-1.5" />
                        Restart
                      </Button>
                    </div>
                  </div>
                )}

                {isLoading && !error && (
                  <div className="size-full flex items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                      <Loader2Icon className="size-6 animate-spin text-primary" />
                      <p className="text-sm font-medium">
                        {status === "booting"
                          ? "Starting WebContainer..."
                          : "Running npm install..."}
                      </p>
                    </div>
                  </div>
                )}

                {previewUrl && (
                  <iframe
                    src={previewUrl}
                    className="size-full border-0 bg-white"
                    title="Dev Server Preview"
                  />
                )}

                {!isLoading && !previewUrl && !error && (
                  <div className="size-full flex items-center justify-center text-muted-foreground p-6 text-center">
                    <div className="flex flex-col items-center gap-2 max-w-sm">
                      <ServerIcon className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-foreground">
                        {hasPackageJson
                          ? "Dev server is starting or idle"
                          : "No package.json detected"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hasHtmlFile
                          ? "Switch to the 'HTML Preview' tab above to see your static HTML page instantly, or use the terminal below to run custom commands."
                          : "Use the terminal below to run any command (e.g. 'npm run dev', 'npm install', or 'npm init')."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Allotment.Pane>

          {/* Bottom: Terminal */}
          {showTerminal && (
            <Allotment.Pane minSize={120} maxSize={600} preferredSize={240}>
              <div className="h-full flex flex-col bg-background border-t border-border/70">
                {/* Terminal Sub-header */}
                <div className="h-7.5 flex items-center justify-between px-3 text-xs bg-sidebar border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-2 text-foreground font-mono">
                    <TerminalSquareIcon className="size-3.5 text-muted-foreground" />
                    <span className="font-semibold text-[11px]">Interactive Terminal</span>
                    <span className="text-[10px] text-muted-foreground">
                      (WebContainer Shell)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCommandRunning ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                        <Loader2Icon className="size-3 animate-spin" />
                        <span className="truncate max-w-[200px]">
                          {activeCommand}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                        <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Terminal with Command Input Bar */}
                <PreviewTerminal
                  output={terminalOutput}
                  onExecuteCommand={executeCommand}
                  isCommandRunning={isCommandRunning}
                  activeCommand={activeCommand}
                  onKillCommand={killCurrentProcess}
                  onClearTerminal={clearTerminal}
                />
              </div>
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    </div>
  );
};