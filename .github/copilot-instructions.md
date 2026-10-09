# Copilot Instructions

- This repository is a Next.js 16 App Router project written in TypeScript.
- Keep changes minimal and consistent with existing patterns in `app/`, which is the current main application surface.
- Before making code changes, create or switch to a dedicated feature branch; do not edit on `main` or `master`.
- Before suggesting or using older Next.js patterns, check the installed Next.js docs under `node_modules/next/dist/docs/` and follow the guidance in `AGENTS.md`.
- Prefer validation with the existing npm scripts from `package.json`: `npm run lint` and, when relevant, `npm run build`.
- Prefer Tailwind CSS for application styling.
- Use Tailwind utility classes as the default styling approach in `app/`.
- Avoid introducing additional styling libraries unless there is a clear project need.
- Use modern sans-serif typography (system fonts: -apple-system, Roboto, Segoe UI, or similar).
- Apply Skipton branding as the primary visual language: deep blue (`#003d7a`), teal accents (`#00a3e0`), light backgrounds (`#f5f9fc`).
- Use vibrant Parkrun accent colors sparingly for energy and emphasis: red (`#e63946`), orange (`#f77f00`), green (`#06a77d`).
- Keep styling consistent with existing tokens, spacing, and typography patterns defined in `app/globals.css`.
- Maintain accessible contrast ratios and ensure dark mode colors are defined alongside light mode.
- When global theme values are needed, define them centrally in `app/globals.css`.
- Use the Skipton Building Society website as a reference for branding and design guidelines.
