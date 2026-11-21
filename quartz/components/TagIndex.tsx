import { getAllSegmentPrefixes } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { getDate } from "./Date"
import { QuartzComponent } from "./types"

export type TagSortOrder = "alphabetical" | "recent" | "count"

export type TagStats = {
  tag: string
  count: number
  latestDate: number | null
}

export function collectTagStats(files: QuartzPluginData[]): TagStats[] {
  const stats = new Map<string, TagStats>()

  for (const file of files) {
    if (file.unlisted === true || !Array.isArray(file.frontmatter?.tags)) continue
    const date = file.defaultDateType ? (getDate(file)?.getTime() ?? null) : null
    const tags = new Set(file.frontmatter.tags.flatMap(getAllSegmentPrefixes))

    for (const tag of tags) {
      const stat = stats.get(tag) ?? { tag, count: 0, latestDate: null }
      stat.count += 1
      if (date !== null && (stat.latestDate === null || date > stat.latestDate)) {
        stat.latestDate = date
      }
      stats.set(tag, stat)
    }
  }

  return [...stats.values()]
}

export function sortTagStats(stats: TagStats[], order: TagSortOrder): TagStats[] {
  return [...stats].sort((a, b) => {
    const alphabetically = a.tag.localeCompare(b.tag, undefined, { sensitivity: "base" })
    if (order === "count") return b.count - a.count || alphabetically
    if (order === "recent") {
      const recent = (b.latestDate ?? -Infinity) - (a.latestDate ?? -Infinity)
      return recent || alphabetically
    }
    return alphabetically
  })
}

const TagIndex: QuartzComponent = ({ fileData, allFiles }) => {
  if (fileData.slug !== "tags/index") return null

  const stats = collectTagStats(allFiles)
  const orders = {
    alphabetical: sortTagStats(stats, "alphabetical").map(({ tag }) => tag),
    recent: sortTagStats(stats, "recent").map(({ tag }) => tag),
    count: sortTagStats(stats, "count").map(({ tag }) => tag),
  }

  return (
    <div class="tag-index-sort" data-tag-index-orders={JSON.stringify(orders)}>
      <label>
        Order tags
        <select data-tag-index-sort>
          <option value="alphabetical">Alphabetical</option>
          <option value="recent">Newest post</option>
          <option value="count">Most used</option>
        </select>
      </label>
    </div>
  )
}

TagIndex.css = `
.tag-index-sort {
  margin: 1rem 0;
}

.tag-index-sort label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-index-sort select {
  color: var(--darkgray);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 0.25rem;
  padding: 0.3rem 0.5rem;
}
`

TagIndex.afterDOMLoaded = `
function bindTagIndexSort() {
  const control = document.querySelector(".tag-index-sort[data-tag-index-orders]")
  const index = document.querySelector('.popover-hint[data-quartz-plugin="tag-page"]')
  if (!control || !index) return

  const groupContainer = Array.from(index.children).find((child) =>
    Array.from(child.children).some((group) => group.querySelector(":scope > h2 > a.tag-link")),
  )
  if (!groupContainer) return

  const groups = Array.from(groupContainer.children).filter((group) =>
    group.querySelector(":scope > h2 > a.tag-link"),
  )
  const orders = JSON.parse(control.dataset.tagIndexOrders || "{}")
  const select = control.querySelector("[data-tag-index-sort]")
  if (!select || control.dataset.bound === "true") return
  control.dataset.bound = "true"

  const tagsByName = new Map(groups.map((group) => [
    group.querySelector(":scope > h2 > a.tag-link").textContent,
    group,
  ]))
  const sortGroups = () => {
    for (const tag of orders[select.value] || orders.alphabetical || []) {
      const group = tagsByName.get(tag)
      if (group) groupContainer.appendChild(group)
    }
  }

  control.remove()
  index.insertBefore(control, index.children[1] || null)
  select.addEventListener("change", sortGroups)
  sortGroups()
}

bindTagIndexSort()
document.addEventListener("nav", bindTagIndexSort)
`

export default TagIndex
