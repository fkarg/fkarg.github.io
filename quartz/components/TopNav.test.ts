import assert from "node:assert/strict"
import { runInNewContext } from "node:vm"
import test from "node:test"
import { dropdownScript } from "./TopNav"

class Target {
  constructor(
    readonly dropdown: Dropdown | null = null,
    readonly isLink = false,
  ) {}

  closest(selector: string) {
    if (selector === "details.site-nav-dropdown") return this.dropdown
    if (selector === "a" && this.isLink) return this
    return null
  }
}

class Dropdown {
  constructor(public open: boolean) {}

  removeAttribute(name: string) {
    if (name === "open") this.open = false
  }
}

function setup(firstOpen: boolean, secondOpen: boolean) {
  const first = new Dropdown(firstOpen)
  const second = new Dropdown(secondOpen)
  const dropdowns = [first, second]
  const listeners = new Map<string, (event: any) => void>()
  const document = {
    addEventListener: (name: string, listener: (event: any) => void) =>
      listeners.set(name, listener),
    querySelectorAll: () => dropdowns.filter((dropdown) => dropdown.open),
  }
  const window: Record<string, unknown> = {}
  const context = { document, window, Element: Target }
  runInNewContext(dropdownScript, context)
  return { first, second, listeners }
}

test("opening a dropdown closes any other open dropdown", () => {
  const { first, second, listeners } = setup(true, false)
  listeners.get("click")!({ target: new Target(second) })
  second.open = true // Native <details> toggles after the click event.
  assert.equal(first.open, false)
  assert.equal(second.open, true)
})

test("clicking outside closes all open dropdowns", () => {
  const { first, second, listeners } = setup(true, true)
  listeners.get("click")!({ target: new Target() })
  assert.equal(first.open, false)
  assert.equal(second.open, false)
})

test("clicking a dropdown link closes its menu", () => {
  const { first, listeners } = setup(true, false)
  listeners.get("click")!({ target: new Target(first, true) })
  assert.equal(first.open, false)
})
