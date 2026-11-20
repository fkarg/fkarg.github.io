import assert from "node:assert/strict"
import test from "node:test"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { VFile } from "vfile"
import type { FilePath } from "../../util/path"
import { FilenameDate } from "./filename-date"

test("adapts Jekyll post syntax and inline TOCs without changing source files", async () => {
  const plugin = FilenameDate()
  const source = plugin.textTransform!(
    {} as never,
    "* TOC\n{:toc}\n\n{{ 'assets/img/a.png' | relative_url }}\n\n{% highlight js linenos %}\nconst x = 1\n{% endhighlight %}\n\n[From Zero to One](../2020-02-01-zero-to-one/)\n\n[now](../now/)\n\n[tags](https://www.fkarg.me/tags/)\n\n[external](https://example.com)",
  )
  assert.doesNotMatch(source, /\* TOC|\{% highlight/)
  assert.match(source, /\/assets\/img\/a\.png/)
  assert.match(source, /```js\nconst x = 1\n```/)
  assert.match(source, /\[From Zero to One\]\(\/posts\/2020-02-01-zero-to-one\)/)
  assert.match(source, /\]\(\/home\/now\)/)
  assert.match(source, /\]\(\/tags\/index\)/)

  const tableSource = plugin.textTransform!(
    {} as never,
    "| Name | Ear | Table |\n| | Phone | Board |\n|:---|:---:|---:|\n| X | 1 | 2 |",
  )
  assert.match(tableSource, /\| Name | Ear<br>Phone | Table<br>Board \|\n\|:---\|:---:\|---:\|/)

  const transformer = unified()
    .use(remarkParse)
    .use(plugin.markdownPlugins!({} as never)[0] as never)
  const file = new VFile({
    value: "## First\n\n{: .box-note}\nA note.\n\n{:toc}\n\n### Child",
    path: "posts/2020-01-02-example.md",
  })
  file.data.relativePath = "posts/2020-01-02-example.md" as FilePath
  const tree = await transformer.run(transformer.parse(file), file)
  const renderedTree = JSON.stringify(tree)
  assert.match(renderedTree, /#first/)
  assert.match(renderedTree, /#child/)
  assert.doesNotMatch(renderedTree, /\{:toc\}/)
  assert.doesNotMatch(renderedTree, /\{: \.box-note\}/)
  assert.match(renderedTree, /"className":\["box-note"\]/)
  assert.ok(file.data.aliases?.includes("/2020-01-02-example/index" as never))
})
