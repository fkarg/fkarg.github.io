import type { Heading, Root, RootContent } from "mdast"
import type { VFile } from "vfile"
import type { QuartzTransformerPlugin } from "../types"
import type { FullSlug } from "../../util/path"

function plainText(node: { type: string; value?: string; children?: unknown[] }): string {
  return node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map((child) => plainText(child as never)).join("")
}

function headingSlug(text: string, used: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/ /g, "-")
  const count = used.get(base) ?? 0
  used.set(base, count + 1)
  return count === 0 ? base : `${base}-${count}`
}

function addInlineToc(tree: Root) {
  const headings = tree.children.filter((node): node is Heading => node.type === "heading")
  const used = new Map<string, number>()
  const entries = headings.map((heading) => ({
    text: plainText(heading),
    id: headingSlug(plainText(heading), used),
  }))
  tree.children = tree.children.flatMap((node): RootContent[] => {
    if (
      node.type !== "paragraph" ||
      node.children.length !== 1 ||
      node.children[0]?.type !== "text" ||
      node.children[0].value.trim() !== "{:toc}"
    )
      return [node]
    if (entries.length === 0) return []
    return [
      {
        type: "list",
        ordered: false,
        spread: false,
        children: entries.map(({ text, id }) => ({
          type: "listItem",
          spread: false,
          checked: null,
          children: [
            {
              type: "paragraph",
              spread: false,
              children: [
                {
                  type: "link",
                  url: `#${id}`,
                  title: null,
                  children: [{ type: "text", value: text }],
                },
              ],
            },
          ],
        })),
      },
    ]
  })
}

function applyBlockAttributes(tree: Root) {
  tree.children = tree.children.filter((node, index, nodes) => {
    if (node.type !== "paragraph") return true

    const last = node.children.at(-1)
    if (
      node.children.length > 1 &&
      last?.type === "text" &&
      node.children.some((child) => child.type === "image")
    ) {
      const imageClass = last.value.match(/^\{:\s*((?:\.[\w-]+\s*)+)\s*:?\s*\}$/)
      if (imageClass) {
        node.children.pop()
        const image = node.children.find((child) => child.type === "image")
        if (image) {
          const className = [...imageClass[1].matchAll(/\.([\w-]+)/g)].map((match) => match[1])
          image.data = { ...image.data, hProperties: { ...image.data?.hProperties, className } }
        }
        return true
      }
    }

    if (node.children[0]?.type !== "text") return true

    const text = node.children[0].value
    const match = text.match(/^\{:\s*\.([\w-]+)\s*:?\s*\}(?:\r?\n|$)/)
    if (!match) return true

    const remainder = text.slice(match[0].length)
    if (remainder.length > 0 || node.children.length > 1) {
      if (remainder.length > 0) node.children[0].value = remainder
      else node.children.splice(0, node.children[1]?.type === "break" ? 2 : 1)
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, className: [match[1]] },
      }
      return true
    }

    const following = nodes[index + 1]
    if (!following) return false
    following.data = {
      ...following.data,
      hProperties: {
        ...following.data?.hProperties,
        className: [match[1]],
      },
    }
    return false
  })
}

function convertJekyllSyntax(src: string): string {
  src = src.replace(/^\* TOC\s*$/gm, "")
  src = src.replace(/\/Users\/[^\s"'<>]*?\/assets\//g, "/assets/")
  src = src.replace(/\{\{\s*['"](assets\/[^'"]+)['"]\s*\|\s*relative_url\s*\}\}/g, "/$1")
  src = src.replace(
    /\{%\s*post_url\s+([^\s%]+)\s*%\}/g,
    (_match, slug: string) => `/posts/${slug.replace(/\.md$/, "")}`,
  )
  src = src.replace(
    /\{%\s*highlight\s+([\w+-]+)(?:\s+linenos)?\s*%\}\s*([\s\S]*?)\s*\{%\s*endhighlight\s*%\}/g,
    (_match, language: string, code: string) => {
      const fence = "`".repeat(
        Math.max(3, ...[...code.matchAll(/`+/g)].map((match) => match[0].length + 1)),
      )
      return `${fence}${language}\n${code}\n${fence}`
    },
  )

  const rewriteInternalUrl = (rawUrl: string): string => {
    const url = rawUrl.replace(/^https?:\/\/(?:www\.)?fkarg\.(?:me|de)(?=\/)/i, "")
    const [path, ...hashParts] = url.split("#")
    const hash = hashParts.length > 0 ? `#${hashParts.join("#")}` : ""
    if (path.includes("2026-05-31-sailing-trip")) return `/staged/sailing${hash}`
    const dateSlug = path.match(/(?:^|\/)(\d{4}-\d{2}-\d{2}-[^/?#]+)\/?$/)?.[1]
    if (dateSlug) {
      const quartzSlug = dateSlug.replace("everything-f-cked", "everything-fcked")
      return `/posts/${quartzSlug}${hash}`
    }

    const cleanPath = path
      .replace(/^(?:\.\.\/)+/, "")
      .replace(/^\//, "")
      .replace(/\/$/, "")
    if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(cleanPath)) {
      return `https://${cleanPath}${hash}`
    }
    if (cleanPath === "tags") return `/tags/index${hash}`
    const homePage = cleanPath.match(
      /^(about|now|attribution|privacy_policy2?|referrals|wishlist)$/,
    )
    if (homePage) return `/home/${homePage[1]}${hash}`
    return url
  }

  src = src.replace(
    /(\]\(|^\[[^\]]+\]:\s*|href=["'])([^\s)"']+)/gm,
    (_match, prefix: string, url: string) => {
      return `${prefix}${rewriteInternalUrl(url)}`
    },
  )

  return mergeMultirowGfmHeaders(src)
}

function splitPipeRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function isGfmDelimiter(line: string): boolean {
  const cells = splitPipeRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-{1,}:?$/.test(cell))
}

function mergeMultirowGfmHeaders(src: string): string {
  const lines = src.split("\n")
  const output: string[] = []
  let inFence = false
  let fence = ""

  for (let index = 0; index < lines.length;) {
    const fenceMatch = lines[index]!.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      if (!inFence) {
        inFence = true
        fence = fenceMatch[1]![0]!
      } else if (fenceMatch[1]![0] === fence) {
        inFence = false
      }
      output.push(lines[index++]!)
      continue
    }

    if (!inFence && lines[index]!.trimStart().startsWith("|")) {
      const start = index
      while (index < lines.length && lines[index]!.trimStart().startsWith("|")) index++
      const delimiterIndex = lines.slice(start, index).findIndex(isGfmDelimiter)
      if (delimiterIndex > 1) {
        const headerRows = lines.slice(start, start + delimiterIndex).map(splitPipeRow)
        const width = Math.max(...headerRows.map((row) => row.length))
        const merged = Array.from({ length: width }, (_, column) =>
          headerRows
            .map((row) => row[column] ?? "")
            .filter(Boolean)
            .join("<br>"),
        )
        output.push(`| ${merged.join(" | ")} |`, ...lines.slice(start + delimiterIndex, index))
      } else {
        output.push(...lines.slice(start, index))
      }
      continue
    }

    output.push(lines[index++]!)
  }

  return output.join("\n")
}

export const FilenameDate: QuartzTransformerPlugin = () => ({
  name: "FilenameDate",
  textTransform(_ctx, src) {
    return convertJekyllSyntax(src)
  },
  markdownPlugins() {
    return [
      () => (tree: Root, file: VFile) => {
        const data = file.data as typeof file.data & {
          relativePath?: string
          frontmatter?: Record<string, unknown>
        }
        const match = data.relativePath?.match(/(?:^|\/)(\d{4}-\d{2}-\d{2})-[^/]+\.md$/)
        if (match) {
          const isPost = data.relativePath?.startsWith("posts/")
          data.frontmatter = {
            ...data.frontmatter,
            created: match[1],
          } as NonNullable<typeof data.frontmatter>
          if (isPost) {
            const legacySlug = `/${data.relativePath!.split("/").at(-1)!.slice(0, -3).replaceAll("*", "-")}`
            const aliases = [`${legacySlug}/index`, legacySlug] as FullSlug[]
            file.data.aliases = [...new Set([...(file.data.aliases ?? []), ...aliases])]
          }
        }
        if (data.relativePath?.startsWith("home/") && !data.relativePath.endsWith("/index.md")) {
          const legacySlug = `/${data.relativePath.split("/").at(-1)!.slice(0, -3)}`
          const aliases = [`${legacySlug}/index`, legacySlug] as FullSlug[]
          file.data.aliases = [...new Set([...(file.data.aliases ?? []), ...aliases])]
        }
        applyBlockAttributes(tree)
        addInlineToc(tree)
      },
    ]
  },
})
