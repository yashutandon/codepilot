import { useCallback, useEffect, useRef, useState } from "react";
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

  const containerRef = useRef<WebContainer | null>(null);
  const startedRef = useRef(false);

  const files = useFiles(projectId);

  const installCommand = settings?.installCommand ?? "npm install";
  const devCommand = settings?.devCommand ?? "npm run dev";

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

        /* 🔥 IMPORTANT FIX
           Mount project files DIRECTLY at root `/`
        */
        const fileTree = buildTreeFile(files);
        await container.mount(fileTree);

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        /* ---------------- Install ---------------- */

        setStatus("installing");
        append(`$ ${installCommand}\n`);

        const [installBin, ...installArgs] = installCommand.split(" ");
        const installProcess = await container.spawn(
          installBin,
          installArgs
        );

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              append(data);
            },
          })
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(`${installCommand} failed`);
        }

        /* ---------------- Dev server ---------------- */

        append(`\n$ ${devCommand}\n`);
        const [devBin, ...devArgs] = devCommand.split(" ");

        const devProcess = await container.spawn(devBin, devArgs);
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
  }, [enabled, files, installCommand, devCommand]);

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
    startedRef.current = false;

    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    setTerminalOutput("");
  }, []);

  return {
    status,
    previewUrl,
    error,
    restart,
    terminalOutput,
  };
};
