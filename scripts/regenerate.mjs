#!/usr/bin/env node
/**
 * Regenerate instruction files from populated agent_docs/ templates.
 *
 * Usage: node scripts/regenerate.mjs --target /path/to/project
 */

import { existsSync, readFileSync } from 'node:fs';
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

  // Load overlay config if available
  const configPath = join(agentDocsDir, '.overlay-config.json');
  let overlayConfig = {};

  if (existsSync(configPath)) {
    try {
      overlayConfig = JSON.parse(readFileSync(configPath, 'utf8'));
      console.log('  Loaded .overlay-config.json');
    } catch (e) {
      console.log(`  [WARN] Could not parse .overlay-config.json: ${e.message}`);
    }
  } else {
    console.log('  [WARN] No .overlay-config.json found. Using defaults.');
    console.log('  [WARN] Re-run onboard.mjs for full configuration (branching, CI, etc.).\n');

    // Fallback: detect stacks
    const { detectStacks } = await import('./onboard.mjs');
    try {
      overlayConfig.detectedStacks = detectStacks(targetDir);
    } catch { /* best effort */ }
  }

  const regenerated = [];

  // Copilot
  if (existsSync(join(targetDir, '.github', 'copilot-instructions.md'))) {
    const { generateCopilotConfig } = await import('../adapters/copilot/generate.mjs');
    const paths = generateCopilotConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of paths) regenerated.push(relative(targetDir, p));
  }

  // Claude
  if (existsSync(join(targetDir, 'CLAUDE.md'))) {
    const { generateClaudeConfig } = await import('../adapters/claude/generate.mjs');
    const r = generateClaudeConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of r.paths) regenerated.push(relative(targetDir, p));
  }

  // Cursor
  if (existsSync(join(targetDir, '.cursorrules'))) {
    const { generateCursorConfig } = await import('../adapters/cursor/generate.mjs');
    const paths = generateCursorConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of paths) regenerated.push(relative(targetDir, p));
  }

  // Codex
  if (existsSync(join(targetDir, 'AGENTS.md'))) {
    const { generateCodexConfig } = await import('../adapters/codex/generate.mjs');
    const paths = generateCodexConfig(targetDir, CORE_DIR, agentDocsDir, overlayConfig);
    for (const p of paths) regenerated.push(relative(targetDir, p));
  }

  // README-AGENTIC.md
  if (existsSync(join(targetDir, 'README-AGENTIC.md'))) {
    const { generateReadmeAgentic } = await import('../adapters/shared/build-readme-agentic.mjs');
    const p = generateReadmeAgentic(targetDir, overlayConfig);
    regenerated.push(relative(targetDir, p));
  }

  // CI templates (regenerate from branchConfig)
  if (overlayConfig.ciProvider) {
    const { generateCITemplate } = await import('../adapters/shared/build-ci-templates.mjs');
    const providers = Array.isArray(overlayConfig.ciProvider)
      ? overlayConfig.ciProvider
      : [overlayConfig.ciProvider];
    for (const ci of providers) {
      try {
        const paths = generateCITemplate(ci, overlayConfig, targetDir);
        for (const p of paths) regenerated.push(relative(targetDir, p));
      } catch (e) {
        console.log(`  [WARN] CI template generation failed for ${ci}: ${e.message}`);
      }
    }
  }

  if (regenerated.length === 0) {
    console.log('  No instruction files found to regenerate.');
    console.log('  (Looking for CLAUDE.md, .github/copilot-instructions.md, AGENTS.md, or .cursorrules)\n');
  } else {
    console.log('  Regenerated:');
    regenerated.forEach((f) => console.log(`    + ${f}`));
    console.log('');
  }
}

main();
