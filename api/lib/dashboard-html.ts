import type { PortfolioStats } from './portfolio-stats.js'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatQuestion(question: string): string {
  if (!question) return ''
  return question.charAt(0).toUpperCase() + question.slice(1)
}

function warningBlock(message: string): string {
  return `<p class="warn">${escapeHtml(message)}</p>`
}

export function renderDashboardHtml(
  stats: PortfolioStats,
  token: string,
  options: { cleared?: boolean } = {},
): string {
  const period = stats.periodDays
  const generated = new Date(stats.generatedAt).toLocaleString()

  const trafficSection = !stats.traffic.configured
    ? warningBlock('GoatCounter API not configured. Set GOATCOUNTER_API_HOST and GOATCOUNTER_API_KEY on Vercel.')
    : stats.traffic.error
      ? warningBlock(stats.traffic.error)
      : `
        <div class="metric-grid">
          <div class="metric">
            <span class="metric-value">${stats.traffic.pageviews}</span>
            <span class="metric-label">Page views (${period}d)</span>
          </div>
          <div class="metric">
            <span class="metric-value">${stats.traffic.events}</span>
            <span class="metric-label">Events (${period}d)</span>
          </div>
        </div>`

  const resumeSection = !stats.resume.configured
    ? warningBlock('GoatCounter API not configured for resume download stats.')
    : stats.resume.error
      ? warningBlock(stats.resume.error)
      : `
        <div class="metric-grid">
          <div class="metric">
            <span class="metric-value">${stats.resume.total}</span>
            <span class="metric-label">Total resume clicks</span>
          </div>
          ${stats.resume.downloads
            .map(
              (item) => `
            <div class="metric">
              <span class="metric-value">${item.count}</span>
              <span class="metric-label">${escapeHtml(item.label)}</span>
            </div>`,
            )
            .join('')}
        </div>`

  const questionsSection = !stats.upstashConfigured
    ? warningBlock('Upstash not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel.')
    : stats.topQuestions.length === 0
      ? '<p class="muted">No chat questions recorded yet.</p>'
      : `<ol class="question-list">
          ${stats.topQuestions
            .map(
              (item, index) => `
            <li>
              <span class="rank">#${index + 1}</span>
              <span class="q">${escapeHtml(formatQuestion(item.question))}</span>
              <span class="count">${item.count}×</span>
            </li>`,
            )
            .join('')}
        </ol>`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Portfolio stats · AKS</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b0f14;
        --surface: #121a24;
        --border: #243041;
        --text: #e8edf4;
        --muted: #7a8ba3;
        --accent: #00e5a0;
        --accent2: #00b8ff;
        --warn: #f5a623;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Space Grotesk", system-ui, sans-serif;
        background: radial-gradient(circle at top, #122033 0%, var(--bg) 45%);
        color: var(--text);
        padding: 2rem 1rem 3rem;
      }
      .wrap { max-width: 920px; margin: 0 auto; }
      .eyebrow {
        font-family: ui-monospace, monospace;
        font-size: 0.75rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--accent);
      }
      h1 {
        margin: 0.4rem 0 0.25rem;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        text-transform: uppercase;
        letter-spacing: -0.03em;
      }
      .sub { color: var(--muted); margin: 0 0 2rem; }
      .card {
        background: color-mix(in srgb, var(--surface) 88%, transparent);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.25rem 1.35rem;
        margin-bottom: 1rem;
      }
      .card h2 {
        margin: 0 0 1rem;
        font-size: 0.85rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent2);
      }
      .metric-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.85rem;
      }
      .metric {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.18);
      }
      .metric-value {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
        color: var(--accent);
      }
      .metric-label {
        display: block;
        margin-top: 0.45rem;
        font-size: 0.82rem;
        color: var(--muted);
      }
      .question-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.65rem;
      }
      .question-list li {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.75rem;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.85rem 1rem;
        background: rgba(0, 0, 0, 0.18);
      }
      .rank {
        font-family: ui-monospace, monospace;
        color: var(--accent);
        font-size: 0.8rem;
      }
      .count {
        font-family: ui-monospace, monospace;
        color: var(--muted);
        font-size: 0.85rem;
      }
      .warn, .muted { color: var(--warn); margin: 0; }
      .muted { color: var(--muted); }
      .footer {
        margin-top: 1.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1.25rem;
        align-items: center;
        color: var(--muted);
        font-size: 0.85rem;
      }
      a {
        color: var(--accent);
        text-decoration: none;
      }
      a:hover { color: var(--accent2); }
      .btn {
        display: inline-block;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.45rem 0.8rem;
        font-family: ui-monospace, monospace;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        background: transparent;
        color: var(--accent);
        cursor: pointer;
      }
      .btn:hover { color: var(--accent2); }
      .btn-danger {
        border-color: #7a2e2e;
        color: #ff8a8a;
        background: rgba(255, 80, 80, 0.08);
      }
      .btn-danger:hover { color: #ffb4b4; border-color: #a33; }
      .notice {
        margin: 0 0 1rem;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        border: 1px solid #2d6a4f;
        background: rgba(0, 229, 160, 0.08);
        color: var(--accent);
        font-size: 0.9rem;
      }
      .footer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        align-items: center;
      }
      .clear-form { display: inline; margin: 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <p class="eyebrow">Private · Vercel</p>
      <h1>Portfolio stats</h1>
      <p class="sub">All metrics in one place · updated ${escapeHtml(generated)}</p>

      ${options.cleared ? '<p class="notice">All counters cleared. New visits and questions will be counted from now.</p>' : ''}

      <section class="card">
        <h2>Traffic</h2>
        ${trafficSection}
      </section>

      <section class="card">
        <h2>Resume downloads</h2>
        ${resumeSection}
      </section>

      <section class="card">
        <h2>Top 5 AI questions</h2>
        ${questionsSection}
      </section>

      <div class="footer">
        <div class="footer-actions">
          <a class="btn" href="/api/dashboard?token=${encodeURIComponent(token)}">Refresh</a>
          <a class="btn" href="/api/stats?token=${encodeURIComponent(token)}">JSON</a>
          <form
            class="clear-form"
            method="POST"
            action="/api/clear-stats?token=${encodeURIComponent(token)}"
            onsubmit="return confirm('Clear all portfolio stats? Traffic, resume downloads, and AI questions will reset to zero on this dashboard.')"
          >
            <button type="submit" class="btn btn-danger">Clear all</button>
          </form>
        </div>
        <span>Period: last ${period} days</span>
      </div>
    </div>
  </body>
</html>`
}
