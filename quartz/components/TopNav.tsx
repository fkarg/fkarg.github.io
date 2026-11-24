import { QuartzComponent } from "./types"

export const dropdownScript = `
if (!window.__cogitateDropdownHandlersBound) {
  window.__cogitateDropdownHandlersBound = true
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null
    const clickedDropdown = target?.closest("details.site-nav-dropdown") ?? null
    const clickedLink = target?.closest("a")
    document.querySelectorAll("details.site-nav-dropdown[open]").forEach((dropdown) => {
      if (dropdown !== clickedDropdown || clickedLink) dropdown.removeAttribute("open")
    })
  })
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return
    document.querySelectorAll("details.site-nav-dropdown[open]").forEach((dropdown) => {
      dropdown.removeAttribute("open")
    })
  })
}
`

const TopNav: QuartzComponent = () => (
  <nav class="site-nav" aria-label="Main navigation">
    <a href="/posts/">Posts</a>
    <a href="/notes/">Notes</a>
    <a href="/tags/">Tags</a>
    <a href="/home/now">Now</a>
    <a href="/home/about">About</a>
    <a href="/home/freelancing">Freelancing</a>
    <details class="site-nav-dropdown">
      <summary>Projects</summary>
      <div class="site-nav-menu">
        <a href="/confertus/">confertus</a>
        <a href="https://www.fkarg.me/triplum/">triplum</a>
        <a href="https://github.com/fkarg/einsteinbot">Einsteinbot</a>
        <a href="https://github.com/fkarg/beancount-importer">beancount-importer</a>
        <a href="https://github.com/fkarg/UnifestBestellBot">UnifestBestellBot</a>
        <a href="https://github.com/fkarg/citation-velocity">citation-velocity</a>
        <a href="https://github.com/fkarg/configs">configs</a>
      </div>
    </details>
    <details class="site-nav-dropdown">
      <summary>More</summary>
      <div class="site-nav-menu">
        <a href="/home/referrals">Referrals</a>
        <a href="/home/privacy_policy">Privacy Policy</a>
        <a href="/home/attribution">Favicon Attribution</a>
      </div>
    </details>
  </nav>
)

TopNav.afterDOMLoaded = dropdownScript

TopNav.css = `
.site-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-width: 0;
  white-space: nowrap;
}

.site-nav a {
  color: var(--darkgray);
  font-size: 0.95rem;
  text-decoration: none;
}

.site-nav a:hover,
.site-nav a:focus-visible {
  color: var(--secondary);
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

.site-nav-dropdown {
  position: relative;
}

.site-nav-dropdown summary {
  display: block;
  color: var(--darkgray);
  cursor: pointer;
  font-size: 0.95rem;
  list-style: none;
}

.site-nav-dropdown summary::-webkit-details-marker {
  display: none !important;
}

.site-nav-dropdown summary::marker {
  content: "";
}

.site-nav-dropdown summary::after {
  content: "⌄";
  margin-left: 0.25rem;
}

.site-nav-menu {
  position: absolute;
  z-index: 10;
  top: 100%;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
  min-width: 13rem;
  max-width: min(18rem, calc(100vw - 2rem));
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.35rem;
  background: var(--light);
  box-shadow: 0 0.3rem 1rem #0002;
}

.site-nav-menu a {
  display: block;
  padding: 0.2rem 0;
  white-space: nowrap;
}

@media all and (max-width: 800px) {
  .site-nav {
    justify-content: flex-start;
    overflow: visible;
    padding: 0.25rem 0;
  }
}
`

export default TopNav
