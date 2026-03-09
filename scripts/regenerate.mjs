#!/usr/bin/env node
/**
 * Regenerate instruction files (CLAUDE.md, copilot-instructions.md, .cursorrules)
 * from populated agent_docs/ templates.
 *
 * Usage: node scripts/regenerate.mjs --target /path/to/project
 */

import { existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const OVERLAY_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CORE_DIR = join(OVERLAY_ROOT, 'core');

function parseTarget() {
  const i = process.argv.indexOf('--target');
  return i !== -1 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : process.cwd();
}

async function main() {
  const targetDir = parseTarget();
  const agentDocsDir = join(targetDir, 'agent_docs');

  if (!existsSync(agentDocsDir)) {
    console.error('[ERROR] No agent_docs/ directory found. Run onboard.mjs first.');
    process.exit(1);
  }

  console.log(`\nRegenerate instruction files`);
  console.log(`Target: ${targetDir}\n`);

  // Import stack detection from onboard.mjs
  const { detectStacks } = await import('./onboard.mjs');
  let detectedStacks = [];
  try {
    detectedStacks = detectStacks(targetDir);
  } catch {
    // Stack detection is best-effort for regeneration
  }

  const regenerated = [];

  // Copilot
  if (existsSync(join(targetDir, '.github', 'copilot-instructions.md'))) {
    const { generateCopilotConfig } = await import('../adapters/copilot/generate.mjs');
    const out = generateCopilotConfig(targetDir, CORE_DIR, agentDocsDir, detectedStacks);
    regenerated.push(relative(targetDir, out));
  }

  // Claude
  if (existsSync(join(targetDir, 'CLAUDE.md'))) {
    const { generateClaudeConfig } = await import('../adapters/claude/generate.mjs');
    const r = generateClaudeConfig(targetDir, CORE_DIR, agentDocsDir, detectedStacks);
    regenerated.push(relative(targetDir, r.claudeMdPath));
  }

  // Cursor
  if (existsSync(join(targetDir, '.cursorrules'))) {
    const { generateCursorConfig } = await import('../adapters/cursor/generate.mjs');
    const out = generateCursorConfig(targetDir, CORE_DIR, agentDocsDir, detectedStacks);
    regenerated.push(relative(targetDir, out));
  }

  if (regenerated.length === 0) {
    console.log('  No instruction files found to regenerate.');
    console.log('  (Looking for CLAUDE.md, .github/copilot-instructions.md, or .cursorrules)\n');
  } else {
    console.log('  Regenerated:');
    regenerated.forEach((f) => console.log(`    + ${f}`));
    console.log('');
  }
}

main();
