"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  TerminalSquareIcon,
  TextCursorInputIcon,
  XCircleIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { ExecutionResult } from "./constants";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OutputPanelProps {
  result: ExecutionResult | null;
  error: string | null;
  status: "idle" | "running" | "success" | "error";
  stdin: string;
  onStdinChange: (value: string) => void;
  showStdin: boolean;
}

export const OutputPanel = ({
  result,
  error,
  status,
  stdin,
  onStdinChange,
  showStdin,
}: OutputPanelProps) => {
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result, error]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOutputContent = () => {
    if (error) return error;
    if (!result) return "";
    return result.output || "(No output)";
  };

  const getCompileContent = () => {
    if (!result?.compile) return "(No compile info)";
    const parts: string[] = [];
    if (result.compile.stdout) parts.push(result.compile.stdout);
    if (result.compile.stderr) parts.push(result.compile.stderr);
    if (parts.length === 0) parts.push("Compilation successful ✓");
    return parts.join("\n");
  };

  const hasCompileError =
    result?.compile?.code !== null &&
    result?.compile?.code !== undefined &&
    result?.compile?.code !== 0;

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs
        defaultValue={showStdin ? "stdin" : "output"}
        className="h-full flex flex-col"
      >
        {/* Tab Header */}
        <div className="h-9 flex items-center justify-between px-2 bg-sidebar border-b border-border/50 shrink-0">
          <TabsList className="h-7 bg-muted/40 border border-border/40 p-0.5 gap-0.5">
            <TabsTrigger
              value="output"
              className="h-6 px-2.5 text-[11px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
            >
              <TerminalSquareIcon className="size-3" />
              Output
              {status === "success" && (
                <CheckCircle2Icon className="size-3 text-emerald-500" />
              )}
              {status === "error" && (
                <XCircleIcon className="size-3 text-red-500" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="compile"
              className="h-6 px-2.5 text-[11px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
            >
              <AlertTriangleIcon className="size-3" />
              Compile
              {hasCompileError && (
                <span className="size-1.5 rounded-full bg-red-500" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="stdin"
              className="h-6 px-2.5 text-[11px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5"
            >
              <TextCursorInputIcon className="size-3" />
              Stdin
            </TabsTrigger>
          </TabsList>

          {/* Copy Button */}
          {result && (
            <button
              type="button"
              onClick={() => handleCopy(getOutputContent())}
              className="flex items-center gap-1 h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground rounded bg-muted/40 border border-border/40 transition-colors cursor-pointer"
            >
              {copied ? (
                <CheckIcon className="size-3 text-emerald-500" />
              ) : (
                <CopyIcon className="size-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {/* Output Tab */}
          <TabsContent value="output" className="h-full m-0 p-0">
            <div className="h-full relative">
              {status === "idle" && !result && (
                <div className="size-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <TerminalSquareIcon className="size-8 opacity-30" />
                  <p className="text-xs font-medium">No output yet</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
                      Ctrl+Enter
                    </kbd>{" "}
                    to run your code
                  </p>
                </div>
              )}

              {status === "running" && (
                <div className="size-full flex items-center justify-center text-muted-foreground gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-2 rounded-full bg-emerald-500 animate-bounce" />
                    </div>
                    <p className="text-xs font-medium">Executing...</p>
                  </div>
                </div>
              )}

              {(result || error) && status !== "running" && (
                <pre
                  ref={outputRef}
                  className={cn(
                    "h-full overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed",
                    status === "error"
                      ? "text-red-400"
                      : "text-foreground"
                  )}
                >
                  {getOutputContent()}
                </pre>
              )}
            </div>
          </TabsContent>

          {/* Compile Tab */}
          <TabsContent value="compile" className="h-full m-0 p-0">
            <div className="h-full">
              {!result?.compile ? (
                <div className="size-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <AlertTriangleIcon className="size-8 opacity-30" />
                  <p className="text-xs font-medium">No compile info</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Compile output appears here for compiled languages
                  </p>
                </div>
              ) : (
                <pre
                  className={cn(
                    "h-full overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed",
                    hasCompileError ? "text-red-400" : "text-emerald-400"
                  )}
                >
                  {getCompileContent()}
                </pre>
              )}
            </div>
          </TabsContent>

          {/* Stdin Tab */}
          <TabsContent value="stdin" className="h-full m-0 p-0">
            <div className="h-full flex flex-col">
              <div className="px-3 py-2 text-[11px] text-muted-foreground bg-muted/20 border-b border-border/30">
                Standard Input — This will be passed to your program via{" "}
                <code className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">
                  stdin
                </code>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => onStdinChange(e.target.value)}
                placeholder="Enter input for your program here...&#10;e.g. 42&#10;Hello World"
                className="flex-1 w-full resize-none bg-transparent text-xs font-mono p-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
