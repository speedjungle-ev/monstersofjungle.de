# Monsters of Jungle Website

Static website built with Vite and a custom headless CMS plugin.

## Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # TypeScript compile + Vite build → dist/
npm run preview      # Preview the production build locally
npm run test         # Run Vitest tests
npm run test:watch   # Vitest in watch mode
npm run format       # Prettier formatting
```

## Project Structure

```
monstersofjungle.de/
├── content/                    # Markdown content (no images)
│   ├── artists/                # One .md file per artist
│   └── events/                 # One .md file per event (filename = date)
│
├── public/                     # Static assets copied verbatim to dist/
│   ├── artists/                # Artist photo sets
│   ├── crew/                   # Crew portrait images
│   ├── events/                 # Event flyer images
│   └── logos/                  # Brand logos
│
├── src/
│   ├── crates/                 # pageData functions for each crate type
│   │   └── artist.ts           # Maps artist frontmatter → page token map
│   ├── layouts/                # HTML page shells (one per collection type)
│   │   └── artist.html         # Shell template with {{token}} placeholders
│   ├── pages/                  # Vite entry-point HTML files
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── impressum.html
│   │   └── artist/             # Generated at build time — do not edit by hand
│   ├── partials/               # Reusable HTML fragments
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── mix-link.html       # {{> mix-link}} partial for artist pages
│   ├── scripts/                # Client-side TypeScript
│   ├── styles/                 # CSS
│   └── components/             # Client-side render functions
│
└── plugins/
    └── sj-web-crate/           # Custom Vite CMS plugin
        ├── plugin.ts           # Vite plugin entry point
        ├── domain/             # Core types and parsing
        │   ├── types.ts
        │   └── parseCrate.ts
        ├── application/        # Orchestration and utilities
        │   ├── buildRollupInput.ts
        │   ├── filenameToTitle.ts
        │   ├── generateDts.ts
        │   ├── logger.ts
        │   └── processPageTokens.ts
        └── tests/
```

## sj-web-crate Plugin

![](plugins/sj-web-crate/logo.png)

The custom Vite plugin that drives content management. It reads Markdown files at build time and handles:

- Exposing collection data as virtual modules for client-side scripts
- Generating one static HTML page per collection entry
- Injecting header/footer partials into all pages
- Watching content files for HMR during development

### Configuration (`vite.config.ts`)

```typescript
sjWebCrate({
  siteName: "Monsters of Jungle", // Appended to all page titles
  locale: "de-DE", // Used for {{buildDate}} formatting
  partials: {
    header: "src/partials/header.html",
    footer: "src/partials/footer.html",
  },
  collections: [
    {
      name: "artist",
      dir: "content/artists",
      requiredFields: ["artistNameLabel", "gridOrder"],
      pageTemplate: "src/layouts/artist.html",
      partialsDir: "src/partials",
      pageData: artistPageData,
    },
    {
      name: "upcoming-event",
      dir: "content/events",
      requiredFields: ["flyer"],
    },
  ],
});
```

**Top-level options:**

| Option     | Description                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `siteName` | Appended to every page title as a suffix separated by a pipe. The index page uses it as the full title.                            |
| `locale`   | Locale for `{{buildDate}}` in partials. Defaults to `"en-EN"`.                                                                     |
| `partials` | Paths to `header` and `footer` HTML files. Injected into empty `<header></header>` and `<footer></footer>` elements on every page. |
| `verbose`  | Enables debug logging from the plugin.                                                                                             |

**Collection options (`CrateConfig`):**

| Option           | Description                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `name`           | Collection identifier. Becomes the virtual module `virtual:sj-web-crate/<name>`.                                    |
| `dir`            | Directory of Markdown files, relative to project root.                                                              |
| `requiredFields` | Frontmatter fields that must be present. Build throws if any are missing.                                           |
| `pageTemplate`   | HTML shell file with `{{token}}` placeholders. Required to generate per-entry pages.                                |
| `partialsDir`    | Directory for `{{> partialName}}` resolution. Defaults to the same directory as `pageTemplate`.                     |
| `pageData`       | Function called once per entry: `(data) => tokenMap`. Return a `title` key to override the slug-derived page title. |

### Token Syntax

HTML shell templates and partials support three token forms:

| Syntax                | Behaviour                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{key}}`             | Replaced with the scalar value from the token map. Empty string if missing.                                                                          |
| `{{#key}}...{{/key}}` | Conditional block. Rendered if `key` is truthy; repeated per item if `key` is an array. Hidden if falsy or empty array.                              |
| `{{> partialName}}`   | Inside an array block: loads `partialName.html` from `partialsDir` and renders it once per array item, substituting `{{key}}` tokens from each item. |

**Built-in tokens available in every page template:**

| Token       | Value                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| `{{title}}` | `"<stem> \| <siteName>"`, or just `<siteName>` for the index page.           |
| `{{base}}`  | Vite `base` path (e.g. `/monstersofjungle.de/` in production, empty in dev). |

**Built-in tokens available in header/footer partials:**

| Token           | Value                                                |
| --------------- | ---------------------------------------------------- |
| `{{base}}`      | Vite `base` path.                                    |
| `{{buildDate}}` | Current date formatted with the configured `locale`. |

**Example — artist shell (`src/layouts/artist.html`):**

```html
<h1>{{artistName}}</h1>
{{#mixLinks}}
<ul id="mix-links">
  {{> mix-link}}
</ul>
{{/mixLinks}} {{#attachment}}
<p id="attachments">{{attachment}}</p>
{{/attachment}}
```

**Example — mix-link partial (`src/partials/mix-link.html`):**

```html
<li><a href="{{link}}" target="_blank" rel="noopener">{{label}}</a></li>
```

### Virtual Modules

Import collection data anywhere in client-side scripts or other build-time code:

```typescript
import { entries, slugs } from "virtual:sj-web-crate/artist";

// entries: parsed collection entries sorted by gridOrder
// slugs: string[] of entry slugs
```

TypeScript types for all collections are auto-generated to `plugins/sj-web-crate/sj-web-crate.d.ts` at build time.

### Feature System

Artists can opt into dynamic content via the `features` frontmatter field. Features are resolved in `src/crateFeatureResolver.ts` and attached to the `attachment` token.

Currently available feature: `radioShow` — calculates and displays the next 4th-Saturday-of-month broadcast date.

## Adding Content

### Artist

Create `content/artists/<slug>.md`:

```yaml
---
artistNameLabel: Artist Display Name
gridOrder: 10 # Controls position in the artist grid (lower = first)
mixLinks:
  - label: Mix title
    link: https://soundcloud.com/...
features: [] # Optional: ["radioShow"]
attachment: null # Optional: freeform HTML string (overridden by features)
---
```

The slug is derived from the filename. The page title is taken from `artistNameLabel`, not the slug, so `mjungle.md` with `artistNameLabel: M.Jungle` produces the title `"M.Jungle | Monsters of Jungle"`.

Place crew portrait images in `public/crew/<slug>.png`.

### Event

Create `content/events/<date>.md` (e.g. `13-04-2026.md`):

```yaml
---
flyer: filename.png # Must exist in public/events/
---
Event description text here.
```

Place the flyer image at `public/events/filename.png`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`. The site is served from the base path `/monstersofjungle.de/`.

To deploy manually:

```bash
npm run build
# Host the contents of dist/
```
