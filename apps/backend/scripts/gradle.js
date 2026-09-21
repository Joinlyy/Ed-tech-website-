#!/usr/bin/env node
/**
 * Cross-platform gradle-wrapper dispatcher.
 *
 * - Prefers ./gradlew (Unix) or gradlew.bat (Windows).
 * - Falls back to a system `gradle` on PATH so the repo works even before
 *   `gradle wrapper` has been run to generate the wrapper JAR.
 * - Auto-loads apps/backend/.env (if present) and forwards its keys to the
 *   Java process so Spring's ${...} env-var substitution picks them up.
 *   .env is git-ignored — safe for secrets.
 */
const { spawn } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const wrapper = path.join(backendRoot, isWin ? 'gradlew.bat' : 'gradlew');

// ── 1. Load .env into process.env ──────────────────────────────────────────
// Minimal parser: `KEY=VALUE` per line. `#` starts a comment. Optional single/
// double quotes around VALUE are stripped. Blank lines ignored. No expansion.
function loadDotEnv(file) {
  if (!existsSync(file)) return { loaded: false, keys: [] };
  const keys = [];
  const text = readFileSync(file, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      // Real OS env wins so `KEY=x npm run …` overrides the file.
      process.env[key] = value;
      keys.push(key);
    }
  }
  return { loaded: true, keys };
}

const envFile = path.join(backendRoot, '.env');
const envResult = loadDotEnv(envFile);
if (envResult.loaded) {
  const list = envResult.keys.length ? envResult.keys.join(', ') : '(all keys already set in shell env)';
  console.error(`[gradle.js] Loaded ${envFile} → ${list}`);
} else {
  console.error(
    `[gradle.js] No ${envFile} — running with shell env only.\n` +
      `[gradle.js] Create it from .env.example if you need Google, Aiven, etc.`
  );
}

// ── 1a. Dev profile override: force H2, ignore any Aiven/Postgres creds ────
// Spring resolves OS env vars (higher priority) BEFORE application-dev.yml
// (lower). If the user has `SPRING_DATASOURCE_URL=jdbc:postgresql://…` in
// `.env` for production, running `--spring.profiles.active=dev` would still
// hit that Postgres. Strip SPRING_DATASOURCE_* when dev is active so the
// dev profile's `jdbc:h2:mem:redpen` in `application-dev.yml` wins.
const argsJoined = process.argv.slice(2).join(' ');
const devProfileRequested =
  /--spring\.profiles\.active=([\w,]*\b)?dev\b/.test(argsJoined) ||
  process.env.SPRING_PROFILES_ACTIVE?.split(',').includes('dev');
if (devProfileRequested) {
  const stripped = [];
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('SPRING_DATASOURCE_')) {
      delete process.env[k];
      stripped.push(k);
    }
  }
  if (stripped.length) {
    console.error(
      `[gradle.js] Dev profile active — stripped ${stripped.join(', ')} so H2 wins.`
    );
  }
}

// ── 2. Pick gradle command ─────────────────────────────────────────────────
let cmd;
if (existsSync(wrapper)) {
  cmd = wrapper;
} else {
  console.warn(
    '[gradle.js] Wrapper not found at ' + wrapper +
    '\n[gradle.js] Falling back to system `gradle`. To install the wrapper permanently:\n' +
    '[gradle.js]   cd apps/backend && gradle wrapper --gradle-version=8.10.2\n'
  );
  cmd = isWin ? 'gradle.bat' : 'gradle';
}

// ── 3. Spawn ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
// shell: true is required on Windows to invoke .bat/.cmd wrappers.
const child = spawn(cmd, args, { cwd: backendRoot, stdio: 'inherit', shell: isWin, env: process.env });
child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', (err) => {
  console.error('[gradle.js] Failed to spawn gradle:', err.message);
  process.exit(1);
});
