---
name: portfolio-dev
description: Develop, verify, and deploy the Aman Kumar Singh portfolio (React/Vite/Tailwind, GitHub Pages at /Portfolio/, Vercel chat API). Use when working in this Portfolio repo, fixing UI/layout bugs, updating profile content, testing Pages base paths, or changing hooks/rules/skills.
---

# Portfolio development

## Quick orientation

| Area | Location |
|------|----------|
| Content | `src/data/profile.ts` |
| Sections | `src/sections/` |
| Public assets | `public/` — use `publicAsset()` in components |
| Pages deploy | `.github/workflows/deploy.yml` |
| Cursor hooks | `.cursor/hooks.json` + `.cursor/hooks/*.cjs` |
| Verify setup | `npm run verify:cursor` |

## Local dev

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. For contact/resume checks, scroll to `#contact`.

## GitHub Pages parity

Root `package.json` has `"type": "module"` for Vite. Production deploy uses `/Portfolio/` base:

```bash
VITE_BASE_PATH=/Portfolio/ npm run build
npm run preview
```

Confirm `resume.pdf`, favicon, and headshot resolve under `/Portfolio/…`, not site root.

## Fix workflow

1. Implement a focused change.
2. Run the right check (dev server + browser, or Pages build above).
3. Run `npm run build` and `npm run verify:cursor` when touching Cursor config.
4. Commit/push only when the user asks or confirms the local check.

## Chat API (optional)

- Deploy `api/chat.ts` to Vercel with `GEMINI_API_KEY`.
- Set GitHub secret `VITE_CHAT_API_URL` for Pages builds.

## Cursor config

- **Rules:** `.cursor/rules/*.mdc` — appear in **Cursor Settings → Rules, Skills** when this folder is the workspace.
- **Skills:** `.cursor/skills/*/SKILL.md` — invoke with `@portfolio-dev` or let the agent match from description.
- **Hooks:** require `.cursor/hooks.json` with `"version": 1`; reload window after edits.
