"use client";

import { Allotment } from "allotment";
import "allotment/dist/style.css";
import {
  PlayIcon,
  RotateCcwIcon,
  Loader2Icon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  TextCursorInputIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  ZapIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { PlaygroundNavbar } from "./playground-navbar";
import { PlaygroundEditor } from "./playground-editor";
import { LanguageSelector } from "./language-selector";
import { OutputPanel } from "./output-panel";
import { usePlaygroundStore } from "./store/use-playground-store";
import { getLanguageById } from "./constants";
import { LanguageIcon } from "./language-icon";

export const PlaygroundView = () => {
  const {
    languageId,
    setLanguageId,
    code,
    setCode,
    stdin,
    setStdin,
    showStdin,
    setShowStdin,
    status,
    result,
    error,
    fontSize,
    setFontSize,
    execute,
    clearOutput,
    resetCode,
  } = usePlaygroundStore();

  const currentLang = getLanguageById(languageId);
  const isRunning = status === "running";

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Navbar */}
      <PlaygroundNavbar />

      {/* Toolbar */}
      <div className="h-10 flex items-center justify-between px-3 bg-sidebar border-b border-border/50 shrink-0 gap-2">
        {/* Left: Language + Run */}
        <div className="flex items-center gap-2">
          <LanguageSelector value={languageId} onChange={setLanguageId} />

          {/* Run Button */}
          <Button
            size="sm"
            onClick={execute}
            disabled={isRunning || !code.trim()}
            className={cn(
              "h-8 px-4 text-xs font-semibold gap-1.5 transition-all",
              isRunning
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            )}
          >
            {isRunning ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-3.5 fill-current" />
                Run
              </>
            )}
          </Button>

          {/* Keyboard shortcut hint */}
          <span className="hidden md:inline text-[11px] text-muted-foreground font-mono">
            Ctrl+Enter
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          {/* Stdin Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 p-0",
                  showStdin && "bg-muted text-foreground"
                )}
                onClick={() => setShowStdin(!showStdin)}
              >
                <TextCursorInputIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle stdin input</TooltipContent>
          </Tooltip>

          {/* Font Size Controls */}
          <div className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded bg-muted/40 border border-border/40">
            <button
              type="button"
              onClick={() => setFontSize(fontSize - 1)}
              className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer"
            >
              <MinusIcon className="size-3" />
            </button>
            <span className="text-[11px] font-mono text-muted-foreground min-w-[28px] text-center">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => setFontSize(fontSize + 1)}
              className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer"
            >
              <PlusIcon className="size-3" />
            </button>
          </div>

          <div className="w-px h-5 bg-border/50 mx-0.5" />

          {/* Clear Output */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={clearOutput}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear output</TooltipContent>
          </Tooltip>

          {/* Reset Code */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={resetCode}
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to boilerplate</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="flex-1 min-h-0">
        <Allotment>
          {/* Left: Code Editor */}
          <Allotment.Pane minSize={300}>
            <PlaygroundEditor
              languageId={languageId}
              value={code}
              onChange={setCode}
              onRun={execute}
              fontSize={fontSize}
            />
          </Allotment.Pane>

          {/* Right: Output */}
          <Allotment.Pane minSize={250} preferredSize={500}>
            <OutputPanel
              result={result}
              error={error}
              status={status}
              stdin={stdin}
              onStdinChange={setStdin}
              showStdin={showStdin}
            />
          </Allotment.Pane>
        </Allotment>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-sidebar border-t border-border px-3 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 font-mono">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            {status === "idle" && (
              <>
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-sans">Ready</span>
              </>
            )}
            {status === "running" && (
              <>
                <Loader2Icon className="size-3 animate-spin text-amber-400" />
                <span className="font-sans text-amber-400">Executing...</span>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2Icon className="size-3 text-emerald-500" />
                <span className="font-sans text-emerald-400">Success</span>
              </>
            )}
            {status === "error" && (
              <>
                <XCircleIcon className="size-3 text-red-500" />
                <span className="font-sans text-red-400">Error</span>
              </>
            )}
          </div>

          {/* Exit code */}
          {result && result.code !== null && (
            <>
              <span className="text-border">|</span>
              <span
                className={cn(
                  "font-sans",
                  result.code === 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                Exit: {result.code}
              </span>
            </>
          )}

          {/* Execution time */}
          {result?.executionTime !== undefined && (
            <>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1 font-sans">
                <ClockIcon className="size-3" />
                {result.executionTime}ms
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Language info */}
          <div className="flex items-center gap-1.5">
            <LanguageIcon language={currentLang.id} className="size-3.5 shrink-0" useBrandColor />
            <span className="font-sans font-medium text-foreground">
              {currentLang.name}
            </span>
            <span className="text-muted-foreground font-mono text-[11px]">
              {currentLang.wandboxVersion}
            </span>
          </div>
          <span className="text-border">|</span>
          <span className="font-sans text-[11px] uppercase px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-semibold">
            {currentLang.extension.replace(".", "").toUpperCase()}
          </span>
          <span className="text-border">|</span>
          <span className="font-sans text-[11px]">Wandbox Engine</span>
        </div>
      </footer>
    </div>
  );
};
