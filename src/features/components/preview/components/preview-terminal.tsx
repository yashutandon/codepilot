"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { PlayIcon, SquareIcon, Trash2Icon, CornerDownLeftIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import "@xterm/xterm/css/xterm.css";

interface PreviewTerminalProps {
  output: string;
  onExecuteCommand?: (cmd: string) => void;
  isCommandRunning?: boolean;
  activeCommand?: string | null;
  onKillCommand?: () => void;
  onClearTerminal?: () => void;
}

export const PreviewTerminal = ({
  output,
  onExecuteCommand,
  isCommandRunning = false,
  activeCommand,
  onKillCommand,
  onClearTerminal,
}: PreviewTerminalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastLengthRef = useRef(0);
  const inputBufferRef = useRef("");

  const [commandInput, setCommandInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyOutput = async () => {
    try {
      let textToCopy = terminalRef.current?.getSelection() || "";
      if (!textToCopy) {
        textToCopy = output || "";
      }
      const cleanText = textToCopy.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      );
      if (cleanText.trim()) {
        await navigator.clipboard.writeText(cleanText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn("Failed to copy terminal logs:", err);
    }
  };

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const terminal = new Terminal({
      convertEol: true,
      disableStdin: false,
      cursorBlink: true,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
      theme: {
        background: "#18181b",
        foreground: "#f4f4f5",
        cursor: "#a1a1aa",
        selectionBackground: "#3f3f46",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Allow native copy on Ctrl+C / Cmd+C when text is selected in xterm
    terminal.attachCustomKeyEventHandler((event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        if (terminal.hasSelection()) {
          const selection = terminal.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).catch(() => {});
          }
          return false; // Prevent xterm from sending \u0003 SIGINT
        }
      }
      return true;
    });

    // Interactive xterm input handler
    terminal.onData((data) => {
      // Enter key
      if (data === "\r" || data === "\n") {
        const cmd = inputBufferRef.current;
        inputBufferRef.current = "";
        terminal.write("\r\n");
        if (cmd.trim() && onExecuteCommand) {
          onExecuteCommand(cmd);
        }
      }
      // Backspace
      else if (data === "\u007F" || data === "\b") {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          terminal.write("\b \b");
        }
      }
      // Ctrl+C (Copy selection if exists, otherwise Interrupt/SIGINT)
      else if (data === "\u0003") {
        if (terminal.hasSelection()) {
          const selection = terminal.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).catch(() => {});
            return;
          }
        }
        inputBufferRef.current = "";
        terminal.write("^C\r\n");
        if (onKillCommand) {
          onKillCommand();
        }
      }
      // Ctrl+L (Clear)
      else if (data === "\u000c") {
        terminal.clear();
        inputBufferRef.current = "";
        if (onClearTerminal) {
          onClearTerminal();
        }
      }
      // Printable characters
      else if (data >= " ") {
        inputBufferRef.current += data;
        terminal.write(data);
      }
    });

    // Write existing output on mount
    if (output) {
      terminal.write(output);
      lastLengthRef.current = output.length;
    }

    requestAnimationFrame(() => fitAddon.fit());

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [onExecuteCommand, onKillCommand, onClearTerminal]);

  // Sync output updates
  useEffect(() => {
    if (!terminalRef.current) return;

    if (output.length < lastLengthRef.current) {
      terminalRef.current.clear();
      lastLengthRef.current = 0;
    }

    const newData = output.slice(lastLengthRef.current);
    if (newData) {
      terminalRef.current.write(newData);
      lastLengthRef.current = output.length;
    }
  }, [output]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd || !onExecuteCommand) return;
    onExecuteCommand(cmd);
    setCommandInput("");
  };

  const handleQuickCommand = (cmd: string) => {
    if (onExecuteCommand) {
      onExecuteCommand(cmd);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#18181b] overflow-hidden">
      {/* Terminal Viewport */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 p-2.5 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full! overflow-hidden"
      />

      {/* Interactive Command Input Bar */}
      <div className="border-t border-border bg-[#18181b] px-2 py-1.5 flex flex-col gap-1.5 shrink-0">
        {/* Presets row */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="text-muted-foreground text-[11px] uppercase font-mono mr-1">
              Quick:
            </span>
            <button
              type="button"
              onClick={() => handleQuickCommand("npm run dev")}
              className="px-1.5 py-0.5 rounded bg-[#27272a] border border-border hover:bg-[#3f3f46] text-foreground text-[11px] font-mono transition-colors"
            >
              npm run dev
            </button>
            <button
              type="button"
              onClick={() => handleQuickCommand("npm install")}
              className="px-1.5 py-0.5 rounded bg-[#27272a] border border-border hover:bg-[#3f3f46] text-foreground text-[11px] font-mono transition-colors"
            >
              npm install
            </button>
            <button
              type="button"
              onClick={() => handleQuickCommand("ls -la")}
              className="px-1.5 py-0.5 rounded bg-[#27272a] border border-border hover:bg-[#3f3f46] text-foreground text-[11px] font-mono transition-colors"
            >
              ls
            </button>
            <button
              type="button"
              onClick={() => handleQuickCommand("node --version")}
              className="px-1.5 py-0.5 rounded bg-[#27272a] border border-border hover:bg-[#3f3f46] text-foreground text-[11px] font-mono transition-colors"
            >
              node -v
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isCommandRunning && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-5 px-2 text-[11px] gap-1"
                onClick={onKillCommand}
                title="Stop current command"
              >
                <SquareIcon className="size-2.5 fill-current" />
                Stop
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
              onClick={handleCopyOutput}
              title="Copy terminal logs or selected error text"
            >
              {copied ? (
                <>
                  <CheckIcon className="size-2.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-2.5" />
                  <span className="text-[10px]">Copy Logs</span>
                </>
              )}
            </Button>
            {onClearTerminal && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={onClearTerminal}
                title="Clear terminal"
              >
                <Trash2Icon className="size-2.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Command Form */}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-1.5 bg-background rounded border border-border/70 px-2 py-0.5 focus-within:border-primary/70 transition-colors"
        >
          <span className="font-mono text-xs text-muted-foreground select-none">
            $
          </span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={
              isCommandRunning
                ? `Running '${activeCommand}'... Type to queue or click Stop`
                : "Enter any command (e.g. npm i lucide-react, ls, npm run dev)..."
            }
            className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden py-1"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={!commandInput.trim()}
            className="h-6 px-2 text-xs font-mono gap-1"
          >
            <CornerDownLeftIcon className="size-3" />
            <span className="text-[11px]">Run</span>
          </Button>
        </form>
      </div>
    </div>
  );
};