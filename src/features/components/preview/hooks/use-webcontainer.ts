import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

import {
  buildTreeFile,
  getFilePath,
} from "@/features/components/preview/utils/file-tree";

import { Id } from "../../../../../convex/_generated/dataModel";
import { useFiles } from "../../projects/hooks/use-files";

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

/* ---------------- WebContainer singleton ---------------- */

const getWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) return webcontainerInstance;

  if (!bootPromise) {
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }

  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};

const teardownWebContainer = () => {
  webcontainerInstance?.teardown();
  webcontainerInstance = null;
  bootPromise = null;
};

/* ---------------- Hook ---------------- */

interface UseWebContainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
}

export const useWebContainer = ({
  projectId,
  enabled,
  settings,
}: UseWebContainerProps) => {
  const [status, setStatus] = useState<
    "idle" | "booting" | "installing" | "running" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const containerRef = useRef<WebContainer | null>(null);
  const startedRef = useRef(false);
  const currentProcessRef = useRef<any>(null);
  const devProcessRef = useRef<any>(null);

  const files = useFiles(projectId);

  const hasPackageJson = useMemo(() => {
    return Boolean(files?.some((f) => f.name === "package.json"));
  }, [files]);

  const hasHtmlFile = useMemo(() => {
    return Boolean(files?.some((f) => f.name.endsWith(".html")));
  }, [files]);

  const installCommand = settings?.installCommand ?? "npm install";

  const devCommand = useMemo(() => {
    if (settings?.devCommand) return settings.devCommand;
    if (!files) return "npm run dev";
    const pkg = files.find((f) => f.name === "package.json");
    if (pkg?.content) {
      try {
        const parsed = JSON.parse(pkg.content);
        if (parsed.scripts?.dev) return "npm run dev";
        if (parsed.scripts?.start) return "npm start";
        if (parsed.scripts?.serve) return "npm run serve";
      } catch {}
    }
    return "npm run dev";
  }, [settings?.devCommand, files]);

  /* ---------------- Clear & Stop Controls ---------------- */

  const clearTerminal = useCallback(() => {
    setTerminalOutput("");
  }, []);

  const killCurrentProcess = useCallback(() => {
    if (currentProcessRef.current) {
      try {
        currentProcessRef.current.kill();
        setTerminalOutput((prev) => prev + "\r\n[Process terminated]\r\n");
      } catch {}
      currentProcessRef.current = null;
      setIsCommandRunning(false);
      setActiveCommand(null);
    }
  }, []);

  /* ---------------- Arbitrary Command Execution ---------------- */

  const executeCommand = useCallback(
    async (commandString: string) => {
      const trimmed = commandString.trim();
      if (!trimmed) return;

      if (trimmed === "clear") {
        clearTerminal();
        return;
      }

      const container = containerRef.current;
      if (!container) {
        setTerminalOutput(
          (prev) =>
            prev +
            `\r\n$ ${trimmed}\r\nWebContainer is not ready yet. Please wait.\r\n`
        );
        return;
      }

      setTerminalOutput((prev) => prev + `\r\n$ ${trimmed}\r\n`);
      setIsCommandRunning(true);
      setActiveCommand(trimmed);

      try {
        let process;
        try {
          process = await container.spawn("jsh", ["-c", trimmed]);
        } catch {
          const parts = trimmed.split(" ").filter(Boolean);
          const bin = parts[0];
          const args = parts.slice(1);
          process = await container.spawn(bin, args);
        }

        currentProcessRef.current = process;

        process.output.pipeTo(
          new WritableStream({
            write(data) {
              setTerminalOutput((prev) => prev + data);
            },
          })
        );

        const exitCode = await process.exit;
        if (exitCode !== 0) {
          setTerminalOutput(
            (prev) => prev + `\r\n[Process exited with code ${exitCode}]\r\n`
          );
        }
      } catch (err: any) {
        setTerminalOutput(
          (prev) =>
            prev +
            `\r\nError executing command: ${err?.message || "Unknown error"}\r\n`
        );
      } finally {
        setIsCommandRunning(false);
        setActiveCommand(null);
        currentProcessRef.current = null;
      }
    },
    [clearTerminal]
  );

  /* ---------------- Main effect ---------------- */

  useEffect(() => {
    if (!enabled || !files || files.length === 0 || startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      try {
        setStatus("booting");
        setError(null);
        setTerminalOutput("");

        const append = (data: string) =>
          setTerminalOutput((prev) => prev + data);

        const container = await getWebContainer();
        containerRef.current = container;

        /* Mount project files DIRECTLY at root `/` */
        const fileTree = buildTreeFile(files);
        await container.mount(fileTree);

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        // If project has NO package.json (e.g. pure HTML/CSS/JS project)
        if (!hasPackageJson) {
          append(
            "✓ WebContainer initialized & files mounted.\r\n" +
              (hasHtmlFile
                ? "💡 HTML project detected. Switch to 'HTML Preview' tab for live preview, or run commands below.\r\n"
                : "💡 No package.json found. You can run commands below (e.g. 'npm init -y').\r\n")
          );
          setStatus("running");
          return;
        }

        /* ---------------- Install ---------------- */

        setStatus("installing");
        append(`$ ${installCommand}\n`);

        const [installBin, ...installArgs] = installCommand.split(" ");
        const installProcess = await container.spawn(installBin, installArgs);
        currentProcessRef.current = installProcess;

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              append(data);
            },
          })
        );

        const installExitCode = await installProcess.exit;
        currentProcessRef.current = null;
        if (installExitCode !== 0) {
          throw new Error(`${installCommand} failed`);
        }

        /* ---------------- Dev server ---------------- */

        append(`\n$ ${devCommand}\n`);
        const [devBin, ...devArgs] = devCommand.split(" ");

        const devProcess = await container.spawn(devBin, devArgs);
        devProcessRef.current = devProcess;
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              append(data);
            },
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    };

    start();
  }, [enabled, files, installCommand, devCommand, hasPackageJson, hasHtmlFile]);

  /* ---------------- Hot file updates ---------------- */

  useEffect(() => {
    const container = containerRef.current;
    if (!container || status !== "running" || !files) return;

    const fileMap = new Map(files.map((f) => [f._id, f]));

    for (const file of files) {
      if (file.type !== "file" || !file.content || file.storageId) continue;

      const path = getFilePath(file, fileMap);
      container.fs.writeFile(path, file.content);
    }
  }, [files, status]);

  /* ---------------- Disable cleanup ---------------- */

  useEffect(() => {
    if (!enabled) {
      startedRef.current = false;
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
    }
  }, [enabled]);

  /* ---------------- Restart ---------------- */

  const restart = useCallback(() => {
    teardownWebContainer();
    containerRef.current = null;
    currentProcessRef.current = null;
    devProcessRef.current = null;
    startedRef.current = false;

    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    setTerminalOutput("");
    setIsCommandRunning(false);
    setActiveCommand(null);
  }, []);

  return {
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
  };
};
