#!/usr/bin/env node

/**
 * Secret Hygiene Validation Script
 * 
 * Scans the repository for accidentally committed secrets.
 * Run via: node scripts/validate-secrets.cjs
 * 
 * Exit codes:
 *   0 — No secrets found
 *   1 — Secrets detected (commit blocked)
 *   2 — Script error
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SENSITIVE_PATTERNS = [
  {
    name: 'Private Key (RSA/EC/DSA)',
    pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/,
    severity: 'critical',
  },
  {
    name: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    severity: 'high',
  },
  {
    name: 'AWS Secret Access Key',
    pattern: /(?:aws_secret_access_key|aws_secret_key)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/i,
    severity: 'high',
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /ghp_[A-Za-z0-9]{36,}/,
    severity: 'high',
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /gho_[A-Za-z0-9]{36,}/,
    severity: 'high',
  },
  {
    name: 'GitHub App Token',
    pattern: /(?:ghu|ghs)_[A-Za-z0-9]{36,}/,
    severity: 'high',
  },
  {
    name: 'GitLab Personal Access Token',
    pattern: /glpat-[A-Za-z0-9\-_]{20,}/,
    severity: 'high',
  },
  {
    name: 'Slack Bot Token',
    pattern: /xox[bpsar]-[0-9]{10,}-[A-Za-z0-9\-]+/,
    severity: 'high',
  },
  {
    name: 'Stripe API Key',
    pattern: /(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{24,}/,
    severity: 'high',
  },
  {
    name: 'Resend API Key',
    pattern: /re_[A-Za-z0-9]{40,}/,
    severity: 'high',
  },
  {
    name: 'Cloudflare API Token',
    pattern: /[A-Za-z0-9_-]{40,}/i,
    // Only flag specific patterns, not general strings
    severity: 'medium',
    minMatch: 60, // Only flag if 60+ chars and looks like a token
  },
  {
    name: 'OpenAI API Key',
    pattern: /sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}/,
    severity: 'high',
  },
  {
    name: 'Anthropic API Key',
    pattern: /sk-ant-[A-Za-z0-9\-]{20,}/,
    severity: 'high',
  },
  {
    name: 'Generic Secret Pattern',
    pattern: /(?:secret|password|passwd|pwd|token|api_key|apikey|api-key)\s*[=:]\s*['"]?[^\s'"]{16,}['"]?/i,
    severity: 'medium',
  },
];

// Files/dirs to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.wrangler',
  'pnpm-lock.yaml',
  'CHANGELOG.md', // May contain example values in docs
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some((skip) => filePath.includes(skip));
}

function scanFile(filePath) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments and markdown links
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('<!--') || trimmed.startsWith('*')) {
        continue;
      }

      for (const rule of SENSITIVE_PATTERNS) {
        // Skip the generic Cloudflare pattern unless we have a strong match
        if (rule.name === 'Cloudflare API Token' && (!rule.minMatch || line.length < rule.minMatch)) {
          continue;
        }

        if (rule.pattern.test(line)) {
          findings.push({
            file: filePath,
            line: i + 1,
            rule: rule.name,
            severity: rule.severity,
            content: trimmed.substring(0, 80),
          });
        }
      }
    }
  } catch {
    // Skip binary/permission errors
  }
  return findings;
}

function walkDir(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (shouldSkip(fullPath)) continue;
      if (entry.isDirectory()) {
        results.push(...walkDir(fullPath));
      } else {
        results.push(fullPath);
      }
    }
  } catch {
    // Skip unreadable dirs
  }
  return results;
}

function main() {
  const root = path.resolve(__dirname, '..');
  console.log('🔍 Scanning for secrets...\n');

  const files = walkDir(root);
  let allFindings = [];

  for (const file of files) {
    // Skip node_modules entirely (walkDir should already skip, but safety)
    if (file.includes('node_modules')) continue;

    const findings = scanFile(file);
    allFindings.push(...findings);
  }

  if (allFindings.length === 0) {
    console.log('✅ No secrets detected.\n');
    process.exit(0);
  }

  // Report
  const critical = allFindings.filter((f) => f.severity === 'critical');
  const high = allFindings.filter((f) => f.severity === 'high');
  const medium = allFindings.filter((f) => f.severity === 'medium');

  console.log(`⚠️  Found ${allFindings.length} potential secret(s):\n`);

  for (const f of allFindings) {
    const icon = f.severity === 'critical' ? '🔴' : f.severity === 'high' ? '🟠' : '🟡';
    console.log(`  ${icon} [${f.severity.toUpperCase()}] ${f.rule}`);
    console.log(`     ${f.file}:${f.line}`);
    console.log(`     ${f.content}`);
    console.log('');
  }

  if (critical.length > 0 || high.length > 0) {
    console.log(`❌ ${critical.length} critical + ${high.length} high severity findings — commit blocked.\n`);
    console.log('Fix by:');
    console.log('  1. Remove the secret from the file');
    console.log('  2. Add it to .dev.vars (local) or Cloudflare Pages secrets (production)');
    console.log('  3. If it was committed, rotate the secret immediately');
    process.exit(1);
  } else {
    console.log(`⚠️  ${medium.length} medium severity findings — review recommended.\n`);
    process.exit(0);
  }
}

main();