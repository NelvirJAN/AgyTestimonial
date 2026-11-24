# Agent Instructions & Boundaries

- **Mode:** Passive / Guided.

- **Do not generate multi-file scaffolds or write code** unless explicitly requested in the active prompt.

- Treat spec.md as reference-only context; do not implement tasks from it automatically, explicitly given instructions to do so by the user 

- Always propose an architecture or step outline in chat first, then wait for explicit user approval before modifying or creating files.

- Restrict all changes strictly to the single file or feature being discussed.

## Google Apps Script Web App Architecture

- **Public Read-Only Views (Ben Collins Pattern):** Always use server-side pre-rendering with native Apps Script scriptlets (`HtmlService.createTemplateFromFile` + `<? for (const item of items) { ?>`) for public read-only views (e.g. Wall of Love, galleries, public dashboards). Never rely on client-side asynchronous `google.script.run` fetch loops with loading spinners for initial render, as they are prone to iframe lifecycle freezes and sandboxed environment delays. Filter and toggle controls must operate locally on pre-rendered DOM elements.
