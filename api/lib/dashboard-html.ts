import type { PortfolioStats } from './portfolio-stats.js'
import type { TrafficBreakdownItem } from './redis.js'

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

function metricValueHtml(value: number, metricKey: string): string {
  return `<span class="metric-value" data-metric="${escapeHtml(metricKey)}" data-value="${value}">${value}<span class="delta" hidden></span></span>`
}

function countWithDeltaHtml(value: number, metricKey: string, suffix = ''): string {
  return `<span class="count" data-metric="${escapeHtml(metricKey)}" data-value="${value}">${value}${escapeHtml(suffix)}<span class="delta" hidden></span></span>`
}

function renderBreakdownList(items: TrafficBreakdownItem[], group: string): string {
  if (items.length === 0) {
    return '<p class="muted">No data yet.</p>'
  }

  return `<ul class="breakdown-list">
    ${items
      .map(
        (item) => `
      <li>
        <div class="breakdown-row">
          <span class="breakdown-label">${escapeHtml(item.label)}</span>
          <span class="breakdown-count" data-metric="${escapeHtml(`${group}:${item.label}`)}" data-value="${item.count}">${item.count} · ${item.percent}%<span class="delta" hidden></span></span>
        </div>
        <div class="breakdown-bar" aria-hidden="true">
          <span style="width: ${Math.min(item.percent, 100)}%"></span>
        </div>
      </li>`,
      )
      .join('')}
  </ul>`
}

function renderTrafficAudience(stats: PortfolioStats, period: number): string {
  const audience = stats.trafficAudience
  if (!stats.upstashConfigured || !audience) {
    return ''
  }

  return `
    <details class="traffic-details">
      <summary>Audience breakdown (${period}d)</summary>
      <div class="traffic-details-body">
        <div class="audience-highlight">
          <span class="audience-label">Unique IPs</span>
          <span class="audience-value" data-metric="uniqueIps" data-value="${audience.uniqueIps}">${audience.uniqueIps}<span class="delta" hidden></span></span>
          <span class="audience-note">of ${audience.totalPageviews} page views</span>
        </div>
        <div class="breakdown-grid">
          <div class="breakdown-card">
            <h3>Country</h3>
            ${renderBreakdownList(audience.countries, 'country')}
          </div>
          <div class="breakdown-card">
            <h3>Referrer</h3>
            ${renderBreakdownList(audience.referrers, 'referrer')}
          </div>
          <div class="breakdown-card">
            <h3>Device</h3>
            ${renderBreakdownList(audience.devices, 'device')}
          </div>
        </div>
      </div>
    </details>`
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
            ${metricValueHtml(stats.traffic.pageviews, 'pageviews')}
            <span class="metric-label">Page views (${period}d)</span>
          </div>
          <div class="metric">
            ${metricValueHtml(stats.traffic.events, 'events')}
            <span class="metric-label">Events (${period}d)</span>
          </div>
        </div>
        ${renderTrafficAudience(stats, period)}`

  const resumeSection = !stats.resume.configured
    ? warningBlock('GoatCounter API not configured for resume download stats.')
    : stats.resume.error
      ? warningBlock(stats.resume.error)
      : `
        <div class="metric-grid">
          <div class="metric">
            ${metricValueHtml(stats.resume.total, 'resumeTotal')}
            <span class="metric-label">Total resume clicks</span>
          </div>
          ${stats.resume.downloads
            .map(
              (item) => `
            <div class="metric">
              ${metricValueHtml(item.count, `resume:${item.source}`)}
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
              ${countWithDeltaHtml(item.count, `question:${item.question}`, '×')}
            </li>`,
            )
            .join('')}
        </ol>`

  const toolbar = `
        <div class="toolbar">
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
        </div>`

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
      .sub { color: var(--muted); margin: 0 0 1rem; }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        align-items: center;
        margin-bottom: 1.5rem;
      }
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
        display: inline-flex;
        align-items: baseline;
        gap: 0.4rem;
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
      .delta {
        font-family: ui-monospace, monospace;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--accent);
        background: rgba(0, 229, 160, 0.12);
        border: 1px solid rgba(0, 229, 160, 0.35);
        border-radius: 999px;
        padding: 0.12rem 0.45rem;
        line-height: 1.2;
        animation: delta-pop 0.45s ease-out;
      }
      .delta[hidden] { display: none; }
      @keyframes delta-pop {
        from { opacity: 0; transform: translateY(4px) scale(0.92); }
        to { opacity: 1; transform: translateY(0) scale(1); }
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
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
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
      .clear-form { display: inline; margin: 0; }
      .traffic-details {
        margin-top: 1rem;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.14);
        overflow: hidden;
      }
      .traffic-details summary {
        cursor: pointer;
        list-style: none;
        padding: 0.85rem 1rem;
        font-family: ui-monospace, monospace;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent2);
      }
      .traffic-details summary::-webkit-details-marker { display: none; }
      .traffic-details summary::after {
        content: '+';
        float: right;
        color: var(--muted);
      }
      .traffic-details[open] summary::after { content: '−'; }
      .traffic-details-body {
        padding: 0 1rem 1rem;
        border-top: 1px solid var(--border);
      }
      .audience-highlight {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.5rem 0.75rem;
        margin: 1rem 0;
        padding: 0.85rem 1rem;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.18);
      }
      .audience-label {
        font-family: ui-monospace, monospace;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--muted);
      }
      .audience-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--accent);
        line-height: 1;
        display: inline-flex;
        align-items: baseline;
        gap: 0.4rem;
      }
      .audience-note {
        font-size: 0.82rem;
        color: var(--muted);
      }
      .breakdown-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.85rem;
      }
      .breakdown-card {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.85rem 1rem;
        background: rgba(0, 0, 0, 0.12);
      }
      .breakdown-card h3 {
        margin: 0 0 0.75rem;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .breakdown-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.65rem;
      }
      .breakdown-row {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        font-size: 0.82rem;
      }
      .breakdown-label {
        color: var(--text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .breakdown-count {
        font-family: ui-monospace, monospace;
        color: var(--muted);
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .breakdown-bar {
        margin-top: 0.35rem;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }
      .breakdown-bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), var(--accent2));
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <p class="eyebrow">Private · Vercel</p>
      <h1>Portfolio stats</h1>
      <p class="sub">All metrics in one place · updated ${escapeHtml(generated)}</p>

      ${toolbar}

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
        <span>Period: last ${period} days</span>
      </div>
    </div>
    <script>
      (function () {
        var STORAGE_KEY = 'aks-portfolio-stats-snapshot';
        var params = new URLSearchParams(window.location.search);
        if (params.get('cleared') === '1') {
          try { sessionStorage.removeItem(STORAGE_KEY); } catch (err) {}
        }

        var nodes = document.querySelectorAll('[data-metric][data-value]');
        if (!nodes.length) return;

        var previous = {};
        try {
          previous = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {};
        } catch (err) {
          previous = {};
        }

        var next = {};
        nodes.forEach(function (node) {
          var key = node.getAttribute('data-metric');
          var value = Number(node.getAttribute('data-value') || 0);
          if (!key) return;
          next[key] = value;

          var prev = previous[key];
          if (typeof prev !== 'number') return;
          var delta = value - prev;
          if (delta <= 0) return;

          var badge = node.querySelector('.delta');
          if (!badge) return;
          badge.textContent = '+' + delta;
          badge.hidden = false;
        });

        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
          // Ignore quota / private-mode failures.
        }
      })();
    </script>
  </body>
</html>`
}
