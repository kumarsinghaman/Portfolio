# Cursor ECC setup (Portfolio)

This project includes ECC hooks, rules, and skills under `.cursor/` and `scripts/`.

## Verify

```bash
npm run verify:cursor
```

## Hooks in Cursor Settings

Project hooks live at `.cursor/hooks.json`. For them to appear and run:

1. Open the **Portfolio folder** as the workspace (`File → Open Folder…` → `Portfolio`). Do not open a single file or the parent `Work Aman` folder only.
2. **Trust the workspace** when Cursor prompts you (required for project hooks).
3. **Reload the window**: `Cmd+Shift+P` → **Developer: Reload Window**.
4. Open **Cursor Settings → Hooks**. You should see **16 project hooks** (15 hook steps; `beforeShellExecution` has two entries).

If Settings still looks empty, check **View → Output → Hooks**. A healthy load looks like:

```text
Loaded 16 project hook(s) for steps: sessionStart, sessionEnd, ...
```

That log line means hooks are active even if the Settings UI is slow to refresh.

### Common Settings UI issues

| Symptom | Fix |
|---------|-----|
| "Invalid hooks.json" / 0 hooks | Ensure top-level `"version": 1` and entries only use `command`, `type`, `timeout`, `matcher`, `failClosed`, `loop_limit` (no extra `event` / `description` fields). |
| No hooks listed | Open `Portfolio` folder, trust workspace, reload window. |
| Hooks fail at runtime | Hook scripts are `.cjs` (CommonJS). Root `"type": "module"` is for Vite only. |

## Hook scripts

Configured in `.cursor/hooks.json`. Scripts delegate to `scripts/hooks/` for formatting, typecheck, security, and git safety.

- `.cursor/hooks/*.cjs` — Cursor entrypoints
- `.cursor/hooks/package.json` → `{ "type": "commonjs" }`
- `scripts/package.json` → `{ "type": "commonjs" }`

### Hook profile (optional)

| Variable | Values | Default |
|----------|--------|---------|
| `ECC_HOOK_PROFILE` | `minimal`, `standard`, `strict` | `standard` |
| `ECC_DISABLED_HOOKS` | comma-separated hook IDs | (none) |

## Rules

40 rule files in `.cursor/rules/*.mdc`:

- **Always apply:** `common-*` (git, security, workflow, testing, etc.)
- **TypeScript (this project):** `typescript-*.mdc` when editing `*.ts` / `*.tsx`
- **Portfolio-specific:** `test-fixes-before-finalizing.mdc`

## Skills

Project skills in `.cursor/skills/` (e.g. `documentation-lookup` for Context7 MCP).

## After changes

1. Run `npm run verify:cursor`
2. Reload Cursor window
3. Confirm in **Output → Hooks** that 16 project hooks loaded
