import assert from "node:assert/strict"
import test from "node:test"
import type { QuartzPluginData } from "../plugins/vfile"
import { collectTagStats, sortTagStats } from "./TagIndex"

const page = (tags: string[], created: string, unlisted = false) =>
  ({
    frontmatter: { title: "test", tags },
    dates: {
      created: new Date(created),
      modified: new Date(created),
      published: new Date(created),
    },
    defaultDateType: "created",
    unlisted,
  }) as QuartzPluginData

test("tag stats count distinct page tags and include parent tags", () => {
  const stats = collectTagStats([
    page(["work", "work/notes"], "2024-01-01"),
    page(["work/notes"], "2024-02-01"),
    page(["private"], "2024-03-01", true),
  ])

  assert.deepEqual(stats, [
    { tag: "work", count: 2, latestDate: new Date("2024-02-01").getTime() },
    { tag: "work/notes", count: 2, latestDate: new Date("2024-02-01").getTime() },
  ])
})

test("tag order supports alphabetical, newest activity, and usage count", () => {
  const stats = [
    { tag: "older", count: 4, latestDate: 1 },
    { tag: "busy", count: 8, latestDate: 2 },
    { tag: "recent", count: 2, latestDate: 3 },
  ]

  assert.deepEqual(
    sortTagStats(stats, "alphabetical").map(({ tag }) => tag),
    ["busy", "older", "recent"],
  )
  assert.deepEqual(
    sortTagStats(stats, "recent").map(({ tag }) => tag),
    ["recent", "busy", "older"],
  )
  assert.deepEqual(
    sortTagStats(stats, "count").map(({ tag }) => tag),
    ["busy", "older", "recent"],
  )
})
