"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { customTheme } from "../projects/ui/editor/extensions/theme";
import { getLanguageExtension } from "../projects/ui/editor/extensions/language-extension";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { miniMap } from "../projects/ui/editor/extensions/mini-map";
import { customSetup } from "../projects/ui/editor/extensions/custom-setup";
import { useEditorTheme } from "../projects/ui/editor/store/use-editor-theme";
import { getEditorThemeById } from "../projects/ui/editor/themes/editor-themes";
import { getLanguageById } from "./constants";

interface Props {
  languageId: string;
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  fontSize?: number;
}

export const PlaygroundEditor = ({
  languageId,
  value,
  onChange,
  onRun,
  fontSize = 14,
}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useMemo(() => new Compartment(), []);
  const fontSizeCompartment = useMemo(() => new Compartment(), []);
  const themeId = useEditorTheme((state) => state.themeId);
  const currentTheme = useMemo(() => getEditorThemeById(themeId), [themeId]);

  // Map playground language ID to a filename for the language extension system
  const lang = getLanguageById(languageId);
  const fakeFileName = `main${lang.extension}`;
  const languageExtension = useMemo(
    () => getLanguageExtension(fakeFileName),
    [fakeFileName]
  );

  // Create font size extension
  const createFontSizeExtension = (size: number) =>
    EditorView.theme({
      "&": { fontSize: `${size}px` },
      ".cm-gutters": { fontSize: `${size}px` },
    });

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: value,
      parent: editorRef.current,
      extensions: [
        themeCompartment.of(currentTheme.extension),
        fontSizeCompartment.of(createFontSizeExtension(fontSize)),
        customTheme,
        customSetup,
        languageExtension,
        keymap.of([
          indentWithTab,
          // Ctrl/Cmd + Enter to run code
          {
            key: "Ctrl-Enter",
            mac: "Cmd-Enter",
            run: () => {
              onRun?.();
              return true;
            },
          },
        ]),
        miniMap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageExtension]);

  // Dynamically reconfigure theme
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.reconfigure(currentTheme.extension),
      });
    }
  }, [currentTheme, themeCompartment]);

  // Dynamically reconfigure font size
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: fontSizeCompartment.reconfigure(
          createFontSizeExtension(fontSize)
        ),
      });
    }
  }, [fontSize, fontSizeCompartment]);

  return (
    <div
      ref={editorRef}
      className="size-full overflow-hidden"
      style={{ backgroundColor: currentTheme.bgPreview }}
    />
  );
};
