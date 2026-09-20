import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LANGUAGE_ID,
  ExecutionResult,
  getLanguageById,
} from "../constants";

type ExecutionStatus = "idle" | "running" | "success" | "error";

interface PlaygroundStore {
  // Language
  languageId: string;
  setLanguageId: (id: string) => void;

  // Code
  code: string;
  setCode: (code: string) => void;

  // Stdin
  stdin: string;
  setStdin: (stdin: string) => void;
  showStdin: boolean;
  setShowStdin: (show: boolean) => void;

  // Execution State
  status: ExecutionStatus;
  result: ExecutionResult | null;
  error: string | null;

  // Font size
  fontSize: number;
  setFontSize: (size: number) => void;

  // Actions
  execute: () => Promise<void>;
  clearOutput: () => void;
  resetCode: () => void;
}

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get) => ({
      // ─── Defaults ───
      languageId: DEFAULT_LANGUAGE_ID,
      code: getLanguageById(DEFAULT_LANGUAGE_ID).boilerplate,
      stdin: "",
      showStdin: false,
      status: "idle" as ExecutionStatus,
      result: null,
      error: null,
      fontSize: 14,

      // ─── Language ───
      setLanguageId: (id: string) => {
        const lang = getLanguageById(id);
        set({
          languageId: id,
          code: lang.boilerplate,
          result: null,
          error: null,
          status: "idle",
        });
      },

      // ─── Code ───
      setCode: (code: string) => set({ code }),

      // ─── Stdin ───
      setStdin: (stdin: string) => set({ stdin }),
      setShowStdin: (show: boolean) => set({ showStdin: show }),

      // ─── Font size ───
      setFontSize: (size: number) =>
        set({ fontSize: Math.max(10, Math.min(24, size)) }),

      // ─── Execute ───
      execute: async () => {
        const { languageId, code, stdin } = get();
        const lang = getLanguageById(languageId);

        if (!code.trim()) {
          set({ error: "No code to execute.", status: "error" });
          return;
        }

        set({ status: "running", error: null, result: null });

        try {
          const response = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              compiler: lang.wandboxCompiler,
              code,
              stdin,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({
              status: "error",
              error:
                data.error || `Execution failed (HTTP ${response.status})`,
            });
            return;
          }

          const hasError =
            (data.code !== null && data.code !== 0) ||
            (data.compile?.code !== null &&
              data.compile?.code !== undefined &&
              data.compile?.code !== 0);

          set({
            status: hasError ? "error" : "success",
            result: data,
            error: null,
          });
        } catch (err) {
          set({
            status: "error",
            error:
              err instanceof Error
                ? err.message
                : "Network error. Failed to execute code.",
          });
        }
      },

      // ─── Clear ───
      clearOutput: () =>
        set({ result: null, error: null, status: "idle" }),

      // ─── Reset ───
      resetCode: () => {
        const lang = getLanguageById(get().languageId);
        set({
          code: lang.boilerplate,
          result: null,
          error: null,
          status: "idle",
        });
      },
    }),
    {
      name: "codepilot-playground-v1",
      partialize: (state) => ({
        languageId: state.languageId,
        code: state.code,
        stdin: state.stdin,
        showStdin: state.showStdin,
        fontSize: state.fontSize,
      }),
    }
  )
);
