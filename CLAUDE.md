# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Jekyll-based personal blog (readandchedan.com) hosted on GitHub Pages. It uses a single layout and minimal client-side JavaScript for search, pagination, and a scroll progress bar.

## Commands

- **Local development**: `bundle exec jekyll serve` — builds and serves at `http://localhost:4000`
- **Build only**: `bundle exec jekyll build`
- **Deploy**: `fab up` (or manually `git add --all && git commit && git push`) — GitHub Pages builds from `master`

## Architecture

### Post Organization

Posts are stored in a nested `_posts/<category>/_posts/` structure:

- `_posts/fiction/_posts/YYYY-MM-DD-slug.md`
- `_posts/nonfiction/_posts/YYYY-MM-DD-slug.md`
- `_posts/tabletennis/_posts/YYYY-MM-DD-slug.md`

Each post requires Jekyll frontmatter:
```yaml
---
layout: default
title: "Post Title"
---
```

**Category assignment is path-based**, not frontmatter-based. The layout (`_layouts/default.html`) and category pages check `post.path contains 'tabletennis'` (or `'fiction'`, `'nonfiction'`) to determine category. This path matching also drives the search index category field in `search.json`.

### Category Pages

- `tabletennis.html`, `fiction.html`, `nonfiction.html` — Loop over `site.posts` and filter by path
- Pagination is client-side in `js/site.js` (`initCategoryPagination`), showing 20 posts per page with URL hash navigation (`#page2`)
- `index.md` — Homepage with category links and a random quote

### Client-Side Features (`js/site.js`)

- **Search**: Loads `/search.json`, performs client-side fuzzy search with title/content ranking, shows up to 10 results with snippets
- **Category pagination**: 20 items per page, prev/next controls, URL hash state (`#pageN`)
- **Scroll progress bar**: `#scroll-progress` element width updated on scroll
- **Random quote**: Cycles through a hardcoded array of quotes on the homepage

### Search Index (`search.json`)

A Jekyll template generating JSON from `site.posts`. The `category` field is determined by path-matching logic that must stay in sync with the layout and category pages.

### Drafts

Unpublished posts go in `draft/`. They do not appear in `site.posts` unless moved to a category `_posts` directory.
