# Aman Kumar Singh — Portfolio

Sleek, minimalist, animated personal portfolio built with React + Vite + Tailwind + Framer Motion.

**Live site:** [kumarsinghaman.github.io/Portfolio](https://kumarsinghaman.github.io/Portfolio/)

## Features

- Dark cinematic / terminal aesthetic
- Fully responsive design
- Scroll animations & animated stat counters
- AI chat assistant (Google Gemini via Vercel serverless)
- Free hosting on GitHub Pages

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your VITE_CHAT_API_URL
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deployment

### 1. GitHub Pages (static site)

This repo deploys to `https://kumarsinghaman.github.io/Portfolio/` via GitHub Actions (`.github/workflows/deploy.yml`).

1. Push to the `main` branch.
2. Ensure **Settings → Pages → Build and deployment → Source** is **GitHub Actions**.
3. Add a repository secret:
   - `VITE_CHAT_API_URL` = your Vercel chat API URL (e.g. `https://your-project.vercel.app/api/chat`)
4. Push to `main` — the site redeploys automatically.

### 2. Vercel (chat API only)

The live portfolio stays on **GitHub Pages**. Vercel only hosts `api/chat.ts` (see `vercel.json`: `framework: null`, no Vite build).

1. Link locally: `npx vercel link --yes --scope <team> --project portfolio`
2. Add environment variables in the [Vercel dashboard](https://vercel.com):
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)
   - `GEMINI_MODEL` — `gemini-2.5-flash` (default, free tier) or `gemini-2.5-pro`
3. Deploy API: `npx vercel deploy --prod`
4. Copy the production `/api/chat` URL (e.g. `https://portfolio-….vercel.app/api/chat`).
5. Set that URL as `VITE_CHAT_API_URL` in GitHub repo secrets (step 1.3 above).

**Note:** Disable or bypass Vercel Deployment Protection on production if the GitHub Pages site must call the API from browsers.

### 3. Custom assets

- **Headshot:** Replace `public/headshot.svg` with your photo and keep using `publicAsset('headshot.svg')` in `src/sections/About.tsx`.
- **Resume:** Replace `public/resume.pdf` with an updated version.
- **Project links:** Edit `src/data/profile.ts` — set `repo` and `demo` URLs on project entries.

## Project Structure

```
src/
  data/profile.ts      # All portfolio content (single source of truth)
  data/chatPrompt.ts   # AI assistant system prompt
  sections/            # Page sections
  components/          # Reusable UI components
api/
  chat.ts              # Vercel serverless DeepSeek proxy
public/
  resume.pdf           # Downloadable resume
  headshot.svg         # Profile photo placeholder
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons
- DeepSeek API (chat)
- GitHub Pages + Vercel

## License

Private — personal portfolio.
