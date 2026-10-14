# ScriptFolio — Topics & Solutions Notebook

> Learn to code by solving real problems. Structured practice questions with verified code-solution screenshots, one-click question copying, and a linked Computer Notes portal — all in one clean, warm-themed workspace.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![No Build Step](https://img.shields.io/badge/build-none-446852)
![Static Site](https://img.shields.io/badge/type-static%20site-32503e)

**Live site:** <https://scriptfolio-code.vercel.app/>
**Computer Notes portal:** <https://notes-computer.vercel.app/>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [How the Site Works](#how-the-site-works)
4. [Folder Structure](#folder-structure)
5. [Getting Started](#getting-started)
6. [Deep Linking](#deep-linking)
7. [Adding Content](#adding-content)
   - [Add a new subtopic page](#1-add-a-new-subtopic-page)
   - [Add a new question to a page](#2-add-a-new-question-to-a-page)
   - [Add a new main topic](#3-add-a-new-main-topic)
8. [Customization & Theming](#customization--theming)
9. [Deployment](#deployment)
10. [Browser Support](#browser-support)
11. [Troubleshooting](#troubleshooting)
12. [Author](#author)

---

## Overview

ScriptFolio is a static website (plain HTML, CSS and JavaScript — no frameworks, no build tools) that works as a programming practice notebook. Each topic page shows a practice **question** with the author's verified **code solution screenshot** directly beneath it. A shared navigation bar ties everything together, and the **Practice** view gives a sidebar-plus-viewer workspace for moving quickly between pages.

The site has two views behind a single navbar:

| View | How to open | What you see |
|------|-------------|--------------|
| **Home** (landing page) | `index.html` or any of Home / Computer Notes / Learn & Solve / Features | Hero section, stats, Computer Notes banner, learning workflow, features, footer |
| **Practice** (workspace) | `index.html#practice` or the **Practice** navbar link | Practice sidebar on the left, the selected topic page in an iframe on the right |

---

## Features

- **One shared navbar** for the entire site, with an active-link indicator and a slide-out drawer on mobile.
- **Practice workspace** — collapsible topic groups in a left sidebar, with the selected page shown on the right.
- **Breadcrumb + "Open Page"** — the top bar shows `Language › Subtopic` and lets you open the current page in its own tab.
- **Pinned Computer Notes card** — loads the external notes portal inside the same viewer.
- **One-click "Copy Question"** on every question, with clipboard fallback for iframes and a toast confirmation.
- **Solution screenshot lightbox** — click any code screenshot to zoom it; press `Esc` to close.
- **Auto question counter** — each topic page counts its own `.qa-card` elements.
- **Auto topic counter** — the sidebar badge and the landing-page stat are calculated from the topic list in `index.js`.
- **Deep links** — open a specific page via URL parameters.
- **Fully responsive** — desktop two-pane layout and a mobile drawer for the topics list.
- **Lazy loading** — the iframe only loads when the Practice view is first opened.
- **Warm earthy theme** — no pure white or pure black; sage and terracotta accents; Plus Jakarta Sans and JetBrains Mono fonts.

---

## How the Site Works

ScriptFolio is a single-page shell (`index.html`) with one navbar and two views. Only one view is visible at a time, and the URL hash decides which one.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  index.html  (single entry point)                                              │
├────────────────────────────────────────────────────────────────────────────────┤
│  SHARED NAVBAR   Home · Computer Notes · Learn & Solve · Features · Practice   │
├────────────────────────────────────────────────────────────────────────────────┤
│  HOME VIEW  #homeView          shown for #top, #notes-portal, #methodology,    │
│                                #features and any other hash                    │
│    hero + stats · notes banner · how-to-learn steps · features · footer        │
├────────────────────────────────────────────────────────────────────────────────┤
│  PRACTICE VIEW  #practiceView  shown only for #practice                        │
│                                                                                │
│    ┌─────────────────────┬──────────────────────────────────────────────────┐  │
│    │ SIDEBAR             │ TOP BAR  Language › Subtopic     [Open Page]     │  │
│    │ • Total Languages   ├──────────────────────────────────────────────────┤  │
│    │ • Computer Notes    │ <iframe id="externalPageFrame">                  │  │
│    │ • Python ▾          │   topics/python/<page>.html                      │  │
│    │     Operators       │   (styled by css/pages, scripted by js/pages)    │  │
│    │     ASCII           │                                                  │  │
│    │     …               │                                                  │  │
│    └─────────────────────┴──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Routing: which view is shown

| URL hash | View | What happens |
|----------|------|--------------|
| *(none)* or `#top` | Home | Scrolls to the top of the landing page |
| `#notes-portal`, `#methodology`, `#features` | Home | Shows Home, then scrolls to that section |
| `#practice` | Practice | Shows the sidebar + iframe workspace |

`route()` in `js/index/index.js` runs on page load and on every `hashchange`. It calls `showView('practice')` or `showView('home')`, which:

1. toggles the `.active` class on `#homeView` and `#practiceView`;
2. adds or removes `practice-mode` on `<body>`, which stops page scrolling so the workspace can fill the screen below the navbar;
3. underlines the matching navbar link (`data-nav="practice"` or `data-nav="home"`);
4. for the Practice view, loads the first page into the iframe the first time only (lazy loading).

### The Practice view

1. **Data:** subjects are defined once in `TOPICS_CONFIG` (name, icon, and a list of subtopics with file paths) in `js/index/index.js`.
2. **Sidebar:** `renderSidebar()` builds the collapsible language groups and subtopic links from that data. The "Total Languages" badge and the "Practice Topics" stat on the Home page are counted from it automatically.
3. **Opening a page:** clicking a subtopic calls `loadPage()`, which sets the iframe `src`, updates the `Language › Subtopic` breadcrumb, highlights the active link and points **Open Page** at the same file.
4. **Computer Notes:** the pinned card calls `loadExternalPortal()`, which shows the notes website in the same iframe.
5. **Layout height:** `measureNavbar()` writes the real navbar height into the CSS variable `--nav-h`, so the workspace is always `100vh - navbar` tall.
6. **Mobile:** below 820px the sidebar becomes a slide-in drawer opened from the **Practice** bar under the navbar (`toggleSidebar()`); the navbar has its own separate hamburger drawer (`toggleMobileMenu()`).

### Topic pages (inside the iframe)

Each file in `topics/` is a standalone HTML page with its own questions. It loads `css/pages/pages.css` and `js/pages/pages.js`, so it also works when opened directly. `pages.js` provides:

- the automatic **N Questions** counter (counts `.qa-card` elements);
- the **Copy Question** button, with a clipboard fallback for iframes and a toast message;
- the **lightbox** for zooming solution screenshots (close with the button, a click outside, or `Esc`).

### Key names used in the code

| Name | Where | Purpose |
|------|-------|---------|
| `#homeView` / `#practiceView` | `index.html`, `workspace.css`, `index.js` | The two views |
| `body.practice-mode` | `workspace.css`, `index.js` | Locks page scroll in the Practice view |
| `#practiceContainer` | `index.html`, `index.js` | Where the sidebar groups are generated |
| `#externalPageFrame` | `index.html`, `index.js` | The iframe that shows topic pages and the notes site |
| `#totalLanguagesBadge` | `index.html`, `index.js` | Language count in the sidebar |
| `#activeLanguageText`, `#activeSubtopicText` | `index.html`, `index.js` | Breadcrumb text |
| `TOPICS_CONFIG` | `index.js` | Single source of truth for all pages |

---

## Folder Structure

```
scriptfolio/
│
├── index.html                    # Main shell: shared navbar + Home view + Practice workspace
├── README.md                     # This file
│
├── css/
│   ├── index/
│   │   ├── landing-page.css      # Design tokens, navbar, hero, sections, features, footer, navbar drawer
│   │   └── workspace.css         # Practice view: sidebar, breadcrumb bar, iframe, practice drawer, view switching
│   └── pages/
│       └── pages.css             # Styles shared by every topic page (cards, copy button, lightbox, toast)
│
├── js/
│   ├── index/
│   │   └── index.js              # TOPICS_CONFIG, routing, sidebar builder, iframe loader, mobile drawers
│   └── pages/
│       └── pages.js              # Question counter, copy-to-clipboard, lightbox (used by topic pages)
│
├── images/
│   ├── icon/
│   │   └── logo.png              # Favicon and brand logo
│   └── code-screenshot/          # Solution screenshots shown under each question
│       ├── convert-lower-to-uppercase.png
│       ├── find-ascii-from-num.png
│       ├── lower-to-uppercase-ASCII.png
│       ├── print-ascii-value.png
│       └── ...                   # one image per question
│
└── topics/                       # One folder per language shown in the Practice sidebar
    └── python/                   # One HTML page per subtopic
        ├── operator.html
        ├── ascii.html
        ├── string.html
        ├── if.html
        ├── if-else.html
        ├── if-elif-else.html
        ├── nested-if-else.html
        ├── for-loop.html
        ├── while-loop.html
        ├── nested-for-loop.html
        ├── continue-statement.html
        ├── pass-statement.html
        ├── list.html
        ├── tuple.html
        ├── set.html
        ├── dictionary.html
        └── function.html
```

> **Naming note:** the navbar tab is called **Practice**, but the content folder is still `topics/` and the data array is still `TOPICS_CONFIG`. They describe what is inside (topics grouped by language), so they were kept to avoid changing every page path. Adding another language later is just a new folder such as `topics/javascript/` plus an entry in `TOPICS_CONFIG`.

### What each file does

| File | Purpose |
|------|---------|
| `index.html` | Single entry point. Contains the navbar, the navbar drawer, `#homeView` (landing page) and `#practiceView` (sidebar + iframe). |
| `css/index/landing-page.css` | Design tokens (colors, fonts, radii, shadows) plus styles for the navbar, hero, stats, portal banner, feature cards, footer and the navbar drawer. |
| `css/index/workspace.css` | Styles for the Practice view, scoped under `#practiceView` so they never clash with the landing styles. Also contains view-switching, `practice-mode` and mobile rules. Load it after `landing-page.css`. |
| `css/pages/pages.css` | Look and feel of the topic pages: header, `.qa-card`, copy button, solution image box, lightbox, toast. |
| `js/index/index.js` | Controller for the main shell: routing, sidebar, iframe loading, deep links, both mobile drawers. See [How the Site Works](#how-the-site-works). |
| `js/pages/pages.js` | Helper script included by every topic page. |
| `topics/python/*.html` | Question pages. Each one links `pages.css` and `pages.js` and contains its own questions. |
| `images/icon/logo.png` | Favicon and logo used in the navbar, drawer, footer and every page's `<head>`. |
| `images/code-screenshot/*.png` | Solution screenshots referenced by the question cards. |

---

## Getting Started

ScriptFolio has no dependencies to install. It only needs a browser.

### External resources used (loaded from CDNs)

- [Font Awesome 6.5.1](https://fontawesome.com/) — icons
- [Google Fonts](https://fonts.google.com/) — Plus Jakarta Sans and JetBrains Mono

An internet connection is needed for icons and fonts. The layout still works without them, using system fonts.

---

## Deep Linking

The Practice view can be opened directly on a given page using URL parameters:

| URL | Result |
|-----|--------|
| `index.html#practice` | Practice view, first page (Operators) |
| `index.html?page=topics/python/for-loop.html` | Opens the For Loop page |
| `index.html?topic=Python&subtopic=While+Loop` | Opens Python → While Loop |
| `index.html?portal=notes` | Opens the Computer Notes portal inside the viewer |

Using any of these parameters without a hash switches to the Practice view automatically.

---

## Adding Content

### 1. Add a new subtopic page

1. Copy an existing page, e.g. `topics/python/ascii.html`, to a new file such as `topics/python/recursion.html`.
2. Change the `<title>`, the page heading and the questions.
3. Register it in `TOPICS_CONFIG` in `js/index/index.js`:

```js
{ name: 'Recursion', file: 'topics/python/recursion.html' }
```

The sidebar entry, counters, breadcrumb and deep link all work from that one line.

### 2. Add a new question to a page

Inside `<main class="questions-container">`, add a card. Each card needs a **unique id** and the matching `q#-text` id used by the copy button:

```html
<article class="qa-card" id="q5">
  <div class="question-section">
    <div class="question-meta-bar">
      <div class="question-pill-group">
        <span class="question-num">Question 5</span>
        <span class="topic-tag">Topic</span>
      </div>
      <button class="copy-btn" onclick="copyQuestion('q5-text', this)" title="Copy question prompt">
        <i class="fa-regular fa-copy"></i>
        <span>Copy Question</span>
      </button>
    </div>
    <h2 class="question-heading">Your question title</h2>
    <p class="question-desc" id="q5-text">Full question text that will be copied to the clipboard.</p>
  </div>
  <div class="solution-section">
    <div class="solution-header">
      <span class="solution-title"><i class="fa-solid fa-code"></i> Solution Code Screenshot</span>
      <span class="image-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Click image to zoom</span>
    </div>
    <div class="image-container" onclick="openLightbox(this)">
      <img src="../../images/code-screenshot/your-image.png" alt="Solution" class="solution-image">
    </div>
  </div>
</article>
```

Save the screenshot in `images/code-screenshot/`. The "N Questions" badge in the page header updates by itself.

### 3. Add a new main topic

Add another object to `TOPICS_CONFIG` (for example JavaScript or C):

```js
{
  id: 'javascript',
  title: 'JavaScript',
  icon: 'fa-brands fa-js',            // any Font Awesome class
  subtopics: [
    { name: 'Variables', file: 'topics/javascript/variables.html' }
  ]
}
```

Create the matching folder under `topics/`. The sidebar group, the "Total Languages" badge and the landing-page topic count update automatically.

---

## Customization & Theming

All colors, fonts and radii are CSS variables defined in `:root` at the top of `landing-page.css` and `pages.css`. To restyle the whole site, change them in **both** files so the shell and the iframe pages stay in sync.

| Variable | Default | Used for |
|----------|---------|----------|
| `--bg-body` | `#f2ece1` | Page background |
| `--bg-card` | `#faf4e8` | Cards and bars |
| `--bg-card-alt` | `#f4ecdf` | Alternate surfaces |
| `--border-color` | `#dfd3c0` | Borders |
| `--text-primary` | `#332e29` | Main text |
| `--text-secondary` | `#5f574d` | Secondary text |
| `--sage-accent` | `#446852` | Primary accent, active states |
| `--terracotta` | `#b86242` | Secondary accent |
| `--font-sans` | Plus Jakarta Sans | UI text |
| `--font-mono` | JetBrains Mono | Code-style labels |

Design rule used throughout: **no pure white (`#fff`) and no pure black (`#000`)**.

Other quick changes:

- **Logo / favicon:** replace `images/icon/logo.png`.
- **Navbar links:** edit the `.nav-links` list and the `.drawer-links` list in `index.html` (keep both in sync).
- **Hero text and stats:** edit the `hero-section` block in `index.html`.
- **Author links:** search for `brijeshsingh16` and `bsingh16` in `index.html` and update them.
- **Notes portal URL:** change `NOTES_URL` in `index.js` and the links in `index.html`.

---

## Deployment

Because the site is fully static, any static host works.

### GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Source**, choose the `main` branch and the `/ (root)` folder, then save.
4. Your site will be available at `https://<username>.github.io/<repo>/`.

### Vercel / Netlify

Import the repository, leave the build command empty and set the output directory to the project root.

> **Tip:** file paths are case-sensitive on most hosts. Make sure names such as `logo.png` and `lower-to-uppercase-ASCII.png` match exactly what the HTML references.

---

## Browser Support

Works in current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile. It uses CSS variables, flexbox, grid and `backdrop-filter` (the navbar blur falls back to a solid color where unsupported).

---

## Troubleshooting

| Problem | Likely cause and fix |
|---------|----------------------|
| Topics page is blank | The file path in `TOPICS_CONFIG` doesn't match the real file name or folder. Check spelling and case. |
| Styles missing on a topic page | The page must link `../../css/pages/pages.css`. Check relative paths. |
| Solution image not showing | The image is missing from `images/code-screenshot/`, or the file name differs in case. |
| Copy button does nothing | Some browsers block the Clipboard API on `file://`. Use a local server or the deployed site. The script falls back to `execCommand` where possible. |
| Computer Notes won't load in the viewer | The external site may block being embedded in iframes. Use the arrow button on the card or **Open Page** to open it in a new tab. |
| Sidebar not showing on mobile | Tap the **Practice** bar under the navbar to open the drawer. |
| Navbar link doesn't scroll to a section | Switch back to the Home view first (any non-`#practice` link does this); make sure the section `id` exists. |

---

## Author

**Brijesh Singh**

- GitHub: [@brijeshsingh16](https://github.com/brijeshsingh16)
- LinkedIn: [bsingh16](https://www.linkedin.com/in/bsingh16)

---

<p align="center">Made with care for people learning to code. ⭐ Star the repo if it helps you!</p>
