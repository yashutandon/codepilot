import { Extension } from "@codemirror/state"

import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { python } from "@codemirror/lang-python"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { sql } from "@codemirror/lang-sql"
import { xml } from "@codemirror/lang-xml"
import { yaml } from "@codemirror/lang-yaml"
import { php } from "@codemirror/lang-php"
import { go } from "@codemirror/lang-go"
import { rust } from "@codemirror/lang-rust"
// import { bash } from "@codemirror/lang-bash"

export const getLanguageExtension = (filename: string): Extension => {
  const ext = filename.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "js":
    case "jsx":
      return javascript({ jsx: true })

    case "ts":
    case "tsx":
      return javascript({ typescript: true, jsx: true })

    case "html":
      return html()

    case "css":
      return css()

    case "json":
      return json()

    case "md":
    case "markdown":
      return markdown()

    case "py":
      return python()

    case "c":
    case "cpp":
    case "h":
    case "hpp":
      return cpp()

    case "java":
      return java()

    case "sql":
      return sql()

    case "xml":
      return xml()

    case "yml":
    case "yaml":
      return yaml()

    case "php":
      return php()

    case "go":
      return go()

    case "rs":
      return rust()

    // case "sh":
    // case "bash":
    //   return bash()

    default:
      // fallback → treat as plain JS (or you can return [] if you want no highlighting)
      return []
  }
}
