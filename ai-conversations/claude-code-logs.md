# AI Conversation Logs — VEED Video Library Dashboard

Prompts from the development session with Claude Code. Responses omitted for brevity.

---

## Backend Setup

Add tRPC types and procedures for `seed.json`. Use Fastify for serving tRPC and Prisma with SQLite.

---

Use Prisma v6, not v7 — v7 forces driver adapters, generates raw TS source files instead of a compiled client, and `migrate dev` is broken with SQLite. v6 just works.

---

## Frontend Scaffold

Go with a client-side Vite app — SSR would add a redundant server layer on top of an API we've already cleanly separated. SEO isn't a concern for a video library. Scaffold with Tailwind and Headless UI, don't hook up to the API yet.

---

Restructure to top-level `api/` and `web/` as fully self-contained directories, each with their own `package.json` and `tsconfig`. Having `/app` and `/src` mixed at the root is messy.

---

Wire up to the API in a basic way. Keep the implementation as simple as possible I will fully integrate.

---

## Real-time & Subscriptions

Use tRPC subscriptions to push live updates when new videos are added.

---

Use SSE over WebSockets — we only need server-to-client push, there's no case for bi-directional comms here.

---

Use an in-process Node.js `EventEmitter` to broadcast SSE events — keeps infrastructure simple with no external broker needed.

---

## Core Features

Add filter and search UI.

---

Set limit to 10 results and add a load more button.

---

## Redux Saga Architecture

Refactor the frontend to event-driven Redux: `createStore` with a single plain reducer using `immer/produce`, `redux-saga` for side effects, `typed-redux-saga` for type inference. Strict action naming convention — `[ui]` for user intent, `[routing]` for navigation, `[effects]` for async results. This gives us a full observable audit trail of every state transition.

---

Compare the observability and testability of the Saga approach against the previous hook-based setup.

---

Make sure `takeLatest` is cancelling in-flight requests on filters and search — we don't want stale results racing.

---

Debounce the search with a `delay` effect in the saga before pushing to the URL.

---

Load more should use `takeLeading` — rapid scroll events shouldn't stack requests.

---

Handle routing inside Redux. Use `createBrowserHistory` with a routing saga that listens to history events and dispatches `[routing] navigated`. This lets sagas react to URL changes the same way they react to any other action.

---

## UX & Navigation

Filter, sort, and search state needs to be encoded in the URL — navigating to a detail page and back should restore the exact list view the user was on, including scroll position.

---

Move the create form into a Headless UI `Popover` anchored to the header button on the right.

---

We're clearing list state on navigation to the detail page — that's wrong. Cache the items and serve from cache on back-navigation so users don't see a skeleton on return.


---

New video is appearing twice in the list after creation.

---

## Create Form — Tags

Add tag input to the create form with autocomplete against existing top tags, sorted A–Z. The suggestion dropdown is being clipped by the popover's overflow — fix the layout so it's always fully visible.

---

## State Architecture

`videoDetail` shouldn't store the full video object — store just the ID and look it up from `videoCache`. The cache is the single source of truth.

---

Hovering multiple cards quickly leaves videos playing after the cursor leaves — the blur/mouseout handling isn't reliable. Also seeing redundant network calls to `main.mp4` after hover ends. Fix both.

---

## View Counter

Implement the view counter with an in-memory write buffer — accumulate increments and flush to the DB on a timer rather than writing on every view. Prevents I/O thrashing under concurrent traffic.

Fan out the updated count via subscription so the gallery reflects live increments without a reload.

---

## Media Chrome Polish

Horizontal padding on play, mute, and fullscreen buttons. Remove hover effects on control bar buttons. Remove the text cursor from the duration display.

---

Sort order is in the URL but isn't restored when navigating back from the detail page — fix the history/pop handling.

---

## Detail Page Layout

Layout: video player `flex-2` on the left, right column with metadata and related videos.

---

Break `App.tsx` into per-route page components — smaller files, clearer separation.

---

## Accessibility & Performance

Audit accessibility — ARIA labels, keyboard navigation, focus management. Fix anything missing.

---

## Final Polish

Clicking a tag on the detail page should navigate to the list with that tag pre-filtered.

---

Analyse the Vite bundle — then move `hls.js` and `media-chrome` to dynamic imports since they're not needed until a video is played.

---

## Testing

Add Playwright E2E tests:
- Intercept the API and verify the error state renders
- List page loads and displays seeded videos
- A new video can be created and appears in the list
- Clicking a video navigates to the detail page
- Detail page handles a non-existent video ID gracefully

---

Tests should hit the real API and SQLite DB — no mocking. We want to catch integration failures, not just unit behaviour.

---

We have `seed.json` at the test layer already — reference it directly instead of creating videos via the API in test setup. Tighter, more predictable tests.

---

The create form is reporting success even when the API call fails. Success/error state needs to be driven by the Redux `[effects]` actions, not local component state.

---

I caught a bug in the production build on Railway — creating a video throws an `INTERNAL_SERVER_ERROR`. Tracked it down in the logs. Can you ensure we don't expect Crypto to be global.