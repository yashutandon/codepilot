import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_THEME_ID,
  EDITOR_THEMES,
  EditorThemeDefinition,
  getEditorThemeById,
} from "../themes/editor-themes";

interface EditorThemeStore {
  themeId: string;
  setThemeId: (id: string) => void;
  getTheme: () => EditorThemeDefinition;
}

export const useEditorTheme = create<EditorThemeStore>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      setThemeId: (id: string) => {
        const found = EDITOR_THEMES.some((t) => t.id === id);
        if (found) {
          set({ themeId: id });
        }
      },
      getTheme: () => {
        return getEditorThemeById(get().themeId);
      },
    }),
    {
      name: "codepilot-editor-theme-v1",
    }
  )
);
