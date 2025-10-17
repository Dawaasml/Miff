#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const PY = process.env.PYTHON || process.env.PY || 'python3';
const scriptPath = path.join(ROOT, 'scripts', 'translate_local.py');

if (!existsSync(scriptPath)) {
  console.error('translate_local.py not found at', scriptPath);
  process.exit(1);
}

console.log('Running local translator (no API keys required)...');
const proc = spawn(PY, [scriptPath], { stdio: 'inherit', env: process.env });
proc.on('exit', (code) => {
  process.exit(code ?? 0);
});

