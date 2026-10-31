import { EditorView } from "codemirror";

export const customTheme = EditorView.theme({
  "&": {
    outline: "none !important",
    height: "100%",
  },
  ".cm-scroller": {
    height: "100%",
    fontFamily:
      "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
    fontSize: "13.5px",
    lineHeight: "1.65",
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
  ".cm-content": {
    fontFamily:
      "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
    fontSize: "13.5px",
    lineHeight: "1.65",
    padding: "8px 0",
  },
});
