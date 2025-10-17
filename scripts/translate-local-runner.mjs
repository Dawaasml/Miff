#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
// Try multiple Python launchers for cross-platform support
const PY_CANDIDATES = [
  process.env.PYTHON,
  process.env.PY,
  process.env.PYLAUNCHER,
  process.env.PYTHON_EXECUTABLE,
  'py',
  'python',
  'python3'
].filter(Boolean);
const scriptPath = path.join(ROOT, 'scripts', 'translate_local.py');

if (!existsSync(scriptPath)) {
  console.error('translate_local.py not found at', scriptPath);
  process.exit(1);
}

console.log('Running local translator (no API keys required)...');

const tryNext = (idx = 0) => {
  if (idx >= PY_CANDIDATES.length) {
    console.error('No working Python launcher found. Tried:', PY_CANDIDATES.join(', '));
    process.exit(1);
  }
  const cmd = PY_CANDIDATES[idx];
  const p = spawn(cmd, [scriptPath], { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' });
  p.on('error', () => tryNext(idx + 1));
  p.on('exit', (code) => {
    if (code === 0) process.exit(0);
    // If exit code indicates launcher not found, try next
    if (code === 9009 /* Windows command not found */) return tryNext(idx + 1);
    // Otherwise, return the code (likely dependency error inside Python)
    process.exit(code ?? 1);
  });
};

tryNext();

