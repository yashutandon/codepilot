import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { miniMap } from "../extensions/mini-map";
import { customSetup } from "../extensions/custom-setup";
import { suggestion } from "../extensions/suggestion/suggestion";
import { quickEdit } from "../extensions/quick-edit/quick-edit";
import { selectionTooltip } from "../extensions/selection-tooltip";
import { useEditorTheme } from "../store/use-editor-theme";
import { getEditorThemeById } from "../themes/editor-themes";

interface Props {
  fileName: string;
  initialValue: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ fileName, initialValue, onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useMemo(() => new Compartment(), []);
  const langaugeExtension = useMemo(() => getLanguageExtension(fileName), [fileName]);
  const themeId = useEditorTheme((state) => state.themeId);
  const currentTheme = useMemo(() => getEditorThemeById(themeId), [themeId]);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        themeCompartment.of(currentTheme.extension),
        customTheme,
        customSetup,
        langaugeExtension,
        suggestion(fileName),
        quickEdit(fileName),
        selectionTooltip(),
        keymap.of([indentWithTab]),
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
  }, [langaugeExtension]);

  // Dynamically reconfigure theme in-place when user picks a new theme
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.reconfigure(currentTheme.extension),
      });
    }
  }, [currentTheme, themeCompartment]);

  return (
    <div
      ref={editorRef}
      className="size-full overflow-hidden"
      style={{ backgroundColor: currentTheme.bgPreview }}
    />
  );
};