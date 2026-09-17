"use client";

import { useEffect, useLayoutEffect } from "react";
import { useEditorTheme } from "@/features/components/projects/ui/editor/store/use-editor-theme";
import { getEditorThemeById } from "@/features/components/projects/ui/editor/themes/editor-themes";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const applyThemeToDocument = (themeId: string) => {
  if (typeof document === "undefined") return;

  const theme = getEditorThemeById(themeId);
  const root = document.documentElement;

  // Toggle class and colorScheme
  if (theme.type === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }

  root.setAttribute("data-theme", theme.id);

  // Set CSS variables
  const { uiTokens } = theme;
  if (uiTokens) {
    root.style.setProperty("--background", uiTokens.background);
    root.style.setProperty("--foreground", uiTokens.foreground);
    root.style.setProperty("--card", uiTokens.card);
    root.style.setProperty("--card-foreground", uiTokens.cardForeground);
    root.style.setProperty("--popover", uiTokens.popover);
    root.style.setProperty("--popover-foreground", uiTokens.popoverForeground);
    root.style.setProperty("--primary", uiTokens.primary);
    root.style.setProperty("--primary-foreground", uiTokens.primaryForeground);
    root.style.setProperty("--secondary", uiTokens.secondary);
    root.style.setProperty("--secondary-foreground", uiTokens.secondaryForeground);
    root.style.setProperty("--muted", uiTokens.muted);
    root.style.setProperty("--muted-foreground", uiTokens.mutedForeground);
    root.style.setProperty("--accent", uiTokens.accent);
    root.style.setProperty("--accent-foreground", uiTokens.accentForeground);
    root.style.setProperty("--border", uiTokens.border);
    root.style.setProperty("--input", uiTokens.input);
    root.style.setProperty("--ring", uiTokens.ring);
    root.style.setProperty("--sidebar", uiTokens.sidebar);
    root.style.setProperty("--sidebar-foreground", uiTokens.sidebarForeground);
    root.style.setProperty("--sidebar-border", uiTokens.sidebarBorder);
    root.style.setProperty("--sidebar-primary", uiTokens.primary);
    root.style.setProperty("--sidebar-primary-foreground", uiTokens.primaryForeground);
    root.style.setProperty("--sidebar-accent", uiTokens.accent);
    root.style.setProperty("--sidebar-accent-foreground", uiTokens.accentForeground);
    root.style.setProperty("--sidebar-ring", uiTokens.ring);
  }
};

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem("codepilot-editor-theme-v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.themeId) {
        applyThemeToDocument(parsed.state.themeId);
      }
    }
  } catch {}
}

export const ThemeSync = () => {
  const { themeId } = useEditorTheme();

  useIsomorphicLayoutEffect(() => {
    applyThemeToDocument(themeId);
  }, [themeId]);

  useEffect(() => {
    const unsub = useEditorTheme.persist?.onFinishHydration?.((state) => {
      if (state.themeId) {
        applyThemeToDocument(state.themeId);
      }
    });
    return () => unsub?.();
  }, []);

  return null;
};
