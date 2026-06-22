# Aman Kumar Singh — Portfolio

Sleek, minimalist, animated personal portfolio built with React + Vite + Tailwind + Framer Motion.

**Live site:** [kumarsinghaman.github.io/Portfolio](https://kumarsinghaman.github.io/Portfolio/)

## Features

- Dark cinematic / terminal aesthetic
- Fully responsive design
- Scroll animations & animated stat counters
- AI chat assistant (Google Gemini via Vercel serverless)
- Free analytics (GoatCounter + Upstash Redis)
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

### 3. Analytics (free)

**One dashboard on Vercel** (after env vars are set):

```
https://your-project.vercel.app/api/dashboard?token=YOUR_STATS_SECRET
```

Shows page views, resume download clicks, and top 5 AI questions (last 30 days).

| What | Tool | Where to view |
|------|------|----------------|
| Page visits | [GoatCounter](https://www.goatcounter.com) (free) | `/api/dashboard` or GoatCounter site |
| Resume downloads | GoatCounter events | `/api/dashboard` |
| Top 5 AI questions | [Upstash Redis](https://upstash.com) (free tier) | `/api/dashboard` |

**GoatCounter (GitHub Pages + Vercel dashboard):**

1. Create a free site at [goatcounter.com](https://www.goatcounter.com).
2. Add GitHub secret `VITE_GOATCOUNTER_ENDPOINT` = `https://YOURCODE.goatcounter.com/count`
3. In GoatCounter → **API**, create a key and add to **Vercel**:
   - `GOATCOUNTER_API_HOST` = `https://YOURCODE.goatcounter.com`
   - `GOATCOUNTER_API_KEY` = your API key
4. Redeploy GitHub Pages and Vercel.

**Upstash (AI questions):**

1. Create a free Redis database at [console.upstash.com](https://console.upstash.com).
2. In Vercel → Environment Variables, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `STATS_SECRET` — bookmark this in your dashboard URL
3. Redeploy Vercel.

**JSON API (same data):**

```bash
curl -s -H "Authorization: Bearer YOUR_STATS_SECRET" \
  https://your-project.vercel.app/api/stats
```

### 4. Custom assets

- **Headshot:** `public/headshot.jpg` (referenced via `publicAsset('headshot.jpg')` in `src/sections/About.tsx`).
- **Resume:** `public/Aman_Kumar_Singh_-_Senior_Software_Engineer.pdf` (linked via `profile.resumeFile` in Hero and Contact).
- **Project links:** Edit `src/data/profile.ts` — set `repo` and `demo` URLs on project entries.

## Project Structure

```
src/
  data/profile.ts      # All portfolio content (single source of truth)
  data/chatPrompt.ts   # AI assistant system prompt
  sections/            # Page sections
  components/          # Reusable UI components
api/
  chat.ts              # Vercel Gemini chat proxy (logs questions to Upstash)
  dashboard.ts         # Unified HTML stats dashboard (private)
  stats.ts             # Unified JSON stats API (private)
  lib/redis.ts         # Upstash helpers
  lib/goatcounter.ts   # GoatCounter API helpers
public/
  Aman_Kumar_Singh_-_Senior_Software_Engineer.pdf  # Downloadable resume
  headshot.jpg         # Profile photo
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Google Gemini API (chat)
- GoatCounter + Upstash (analytics)
- GitHub Pages + Vercel

## License

Private — personal portfolio.
