#!/usr/bin/env node
/**
 * Verify Cursor hooks, rules, and skills for this project.
 * Run: node scripts/verify-cursor-setup.js
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let failed = 0;

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failed += 1;
}

function section(title) {
  console.log(`\n${title}`);
}

section('Config files');
for (const rel of ['.cursor/hooks.json', '.cursor/hooks/package.json', 'scripts/package.json']) {
  const full = path.join(root, rel);
  fs.existsSync(full) ? ok(rel) : fail(`Missing ${rel}`);
}

section('Hooks schema');
const hooksConfig = JSON.parse(fs.readFileSync(path.join(root, '.cursor/hooks.json'), 'utf8'));
const hookEntries = Object.values(hooksConfig.hooks || {}).flat();
if (hooksConfig.version === 1) {
  ok('hooks.json version is 1 (required for Cursor 3.x project hooks)');
} else {
  fail(`hooks.json version must be 1, got ${hooksConfig.version}`);
}
const allowedHookKeys = new Set([
  'command',
  'type',
  'timeout',
  'loop_limit',
  'failClosed',
  'matcher',
]);
for (const entry of hookEntries) {
  for (const key of Object.keys(entry)) {
    if (!allowedHookKeys.has(key)) {
      fail(`hooks.json entry has unsupported field "${key}" (breaks Settings → Hooks UI)`);
    }
  }
}
if (hookEntries.length === 16) {
  ok('16 hook entries configured (15 steps; beforeShellExecution has 2)');
} else {
  fail(`expected 16 hook entries, found ${hookEntries.length}`);
}

section('Hooks smoke test');
for (const entry of hookEntries) {
  const cmd = String(entry.command || '');
  const match = cmd.match(/node\s+(\S+)/);
  if (!match) continue;
  const hookPath = path.join(root, match[1]);
  if (!fs.existsSync(hookPath)) {
    fail(`Hook script missing: ${match[1]}`);
    continue;
  }
  try {
    execFileSync('node', [hookPath], {
      input: '{}',
      cwd: root,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
    });
    ok(path.basename(hookPath));
  } catch (e) {
    fail(`${path.basename(hookPath)} exited ${e.status ?? 1}`);
  }
}

section('Block --no-verify regression');
const blockHook = path.join(root, '.cursor/hooks/before-shell-execution-block-no-verify.cjs');
const allowInput = JSON.stringify({ command: 'git commit -m "message mentions --no-verify"' });
const blockInput = JSON.stringify({ command: 'git commit --no-verify -m test' });
try {
  execFileSync('node', [blockHook], { input: allowInput, cwd: root, stdio: 'pipe' });
  ok('allows commit message containing "no-verify" text');
} catch {
  fail('false-positive: blocked commit message containing "no-verify"');
}
try {
  execFileSync('node', [blockHook], { input: blockInput, cwd: root, stdio: 'pipe' });
  fail('did not block git commit --no-verify');
} catch (e) {
  e.status === 2 ? ok('blocks git commit --no-verify') : fail(`unexpected exit ${e.status}`);
}

section('Rules');
const rulesDir = path.join(root, '.cursor/rules');
const expectedRules = [
  'portfolio-project.mdc',
  'test-fixes-before-finalizing.mdc',
  'common-agents.mdc',
  'common-coding-style.mdc',
  'common-development-workflow.mdc',
  'common-git-workflow.mdc',
  'common-hooks.mdc',
  'common-patterns.mdc',
  'common-performance.mdc',
  'common-security.mdc',
  'common-testing.mdc',
  'typescript-coding-style.mdc',
  'typescript-hooks.mdc',
  'typescript-patterns.mdc',
  'typescript-security.mdc',
  'typescript-testing.mdc',
];
let rulesPresent = 0;
for (const name of expectedRules) {
  if (fs.existsSync(path.join(rulesDir, name))) {
    ok(name);
    rulesPresent += 1;
  } else {
    fail(`Missing rule: ${name}`);
  }
}
if (rulesPresent === expectedRules.length) {
  ok(`${rulesPresent} .mdc rule files (portfolio + common + typescript)`);
}

section('Rules frontmatter');
for (const name of expectedRules) {
  const rulePath = path.join(rulesDir, name);
  if (!fs.existsSync(rulePath)) continue;
  const raw = fs.readFileSync(rulePath, 'utf8');
  if (!raw.startsWith('---')) {
    fail(`${name}: missing YAML frontmatter`);
    continue;
  }
  const end = raw.indexOf('---', 3);
  const front = raw.slice(3, end);
  if (!/^description:/m.test(front)) {
    fail(`${name}: missing description in frontmatter`);
  }
}

section('Skills');
const skillsDir = path.join(root, '.cursor/skills');
const expectedSkills = ['portfolio-dev', 'documentation-lookup'];
let skillsPresent = 0;
for (const name of expectedSkills) {
  const skillFile = path.join(skillsDir, name, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    fail(`Missing skill: ${name}`);
    continue;
  }
  const raw = fs.readFileSync(skillFile, 'utf8');
  const nameMatch = raw.match(/^name:\s*(.+)$/m);
  const descMatch = raw.match(/^description:\s*(.+)$/m);
  if (!nameMatch) fail(`${name}: SKILL.md missing name`);
  else if (!/^[a-z0-9-]+$/.test(nameMatch[1].trim())) fail(`${name}: invalid skill name`);
  if (!descMatch) fail(`${name}: SKILL.md missing description`);
  ok(name);
  skillsPresent += 1;
}
if (skillsPresent === expectedSkills.length) {
  ok(`${skillsPresent} project skills`);
}

section('Result');
if (failed === 0) {
  console.log('\nAll checks passed. Restart Cursor if hooks were just added.');
  process.exit(0);
}
console.error(`\n${failed} check(s) failed.`);
process.exit(1);
