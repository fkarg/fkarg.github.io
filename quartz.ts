import { h } from "preact"
import { readFileSync } from "node:fs"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { External, type QuartzComponent } from "./quartz/components"
import TopNav from "./quartz/components/TopNav"
import { FilenameDate } from "./quartz/plugins/transformers/filename-date"

const baseUrl = process.env.QUARTZ_BASE_URL ?? readFileSync("CNAME", "utf8").trim()
if (!baseUrl) throw new Error("CNAME must contain the deployed hostname")
const config = await loadQuartzConfig({ baseUrl })
const frontmatterIndex = config.plugins.transformers.findIndex(
  (plugin) => plugin.name === "Frontmatter",
)
if (frontmatterIndex < 0) throw new Error("Quartz frontmatter transformer is missing")
config.plugins.transformers.splice(frontmatterIndex + 1, 0, FilenameDate())
export default config

const RecentNotes = External("RecentNotes", {
  title: "Recent",
  limit: 5,
  showTags: true,
  hideFolderPages: true,
  filter: (file: { slug?: string }) =>
    file.slug?.startsWith("notes/") === true || file.slug?.startsWith("posts/") === true,
})
const RecentNotesOnHome: QuartzComponent = (props) =>
  props.fileData.slug === "index" ? RecentNotes(props) : null
RecentNotesOnHome.css = RecentNotes.css
RecentNotesOnHome.afterDOMLoaded = RecentNotes.afterDOMLoaded
const Backlinks = External("Backlinks", { hideWhenEmpty: true })
const ReaderMode = External("ReaderMode")
const Graph = External("Graph")
const CollapsibleGraph: QuartzComponent = (props) =>
  h("details", { class: "collapsible-graph" }, [
    h("summary", null, "Explore connections"),
    Graph(props),
  ])
CollapsibleGraph.css = Graph.css + `
.collapsible-graph > summary {
  cursor: pointer;
  color: var(--secondary);
  margin: 1rem 0;
}
.collapsible-graph[open] > .graph {
  margin-top: 1rem;
}
`
CollapsibleGraph.afterDOMLoaded = (Graph.afterDOMLoaded ?? "") + `
function bindCollapsibleGraphs() {
  document.querySelectorAll("details.collapsible-graph").forEach((details) => {
    if (details.dataset.graphBound) return
    details.dataset.graphBound = "true"
    details.addEventListener("toggle", () => {
      if (details.open) {
        document.dispatchEvent(new CustomEvent("render", { detail: { url: window.location.href } }))
      }
    })
  })
}
bindCollapsibleGraphs()
document.addEventListener("nav", bindCollapsibleGraphs)
`

export const layout = await loadQuartzLayout({
  defaults: {
    header: [External("PageTitle"), TopNav, External("Search"), ReaderMode, External("Darkmode")],
    beforeBody: [RecentNotesOnHome],
    afterBody: [Backlinks, CollapsibleGraph],
    left: [],
    right: [],
  },
  byPageType: {
    content: { frame: "full-width" },
    folder: { frame: "full-width" },
    tag: { frame: "full-width" },
    bases: { frame: "full-width" },
    "404": { frame: "full-width" },
  },
})
