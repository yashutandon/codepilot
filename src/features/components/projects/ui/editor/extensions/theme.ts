import { EditorView } from "codemirror"



export const customTheme = EditorView.theme({
    "&" : {
        outline:"none !important",
        height:"100%"
    },
    ".cm-scroller":{
        height:"100%",
        fontFamily:"var(--font-plex-mono),monospace",
        fontSize:"13px",
        lineHeight:"1.6",
        scrollbarWidth:"thin",
        scrollbarColor:"#3f3f46 transparent"
    },
    ".cm-content":{
        fontFamily:"var(--font-plex-mono),monospace",
        fontSize:"13px",
        lineHeight:"1.6",
        padding:"8px 0"
    }
})