---
name: GitHub Pages not loading after green workflow
description: Site fails to load on GitHub Pages despite workflow succeeding — open issue to investigate
type: project
---

After merging `feature/hero-content`, the GitHub Actions deploy workflow runs green but the site does not load on GitHub Pages.

**Why:** Unknown — likely related to the base path handling or the move from runtime partial injection to build-time `transformIndexHtml`. The base path in `vite.config.ts` is hardcoded as `/monstersofjungle.de/` in production (derived from `NODE_ENV !== "production"`), and the `configure-pages` step runs after the build so it cannot influence the base URL.

**How to apply:** When investigating, start by checking the deployed `dist/` artifact (download from the workflow run) to verify asset paths use `/monstersofjungle.de/` prefix. Also check that the `environment` name in the workflow (`github-scripts`) is accepted by GitHub Pages — standard name is `github-pages`. The base path refactor was discussed but not yet implemented (passing `${{ steps.pages.outputs.base_path }}` via `VITE_BASE_PATH` env var).