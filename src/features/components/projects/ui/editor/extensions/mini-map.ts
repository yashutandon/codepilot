import { showMinimap } from "@replit/codemirror-minimap"
import { Extension } from "@codemirror/state"

const createMinimap = () => {
  const dom = document.createElement("div")
  dom.style.height = "100%"
  return { dom }
}

export const miniMap = (): Extension => {
  return showMinimap.of({
    create: createMinimap,
  })
}
