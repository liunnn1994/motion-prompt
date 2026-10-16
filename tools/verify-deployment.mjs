#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../.tmp/site/', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Compare served bytes with the staged release, including frontend-only changes.
export async function verifyDeployment({ siteRoot = defaultRoot, base, attempts = 3, retryDelayMs = 5000 } = {}) {
  const catalog = JSON.parse(fs.readFileSync(path.join(siteRoot, 'api/v1/catalog.json'), 'utf8'));
  base ||= catalog.site;
  const files = ['index.html', 'found.html', 'api/v1/catalog.json'];
  const prompt = catalog.elements.find(el => el.id === '069') || catalog.elements[0];
  files.push(`api/v1/zh-CN/p/${prompt.id}.txt`);
  function frontendFiles(relative) {
    for (const entry of fs.readdirSync(path.join(siteRoot, relative), { withFileTypes: true })) {
      const name = `${relative}/${entry.name}`;
      if (entry.isDirectory()) frontendFiles(name);
      else if (/\.(js|css)$/.test(entry.name)) files.push(name);
    }
  }
  frontendFiles('assets');
  for (const pack of catalog.packs || []) files.push(`packs/${pack.pack}/pack.js`);
  const expected = files.map(relative => ({
    relative,
    digest: sha256(fs.readFileSync(path.join(siteRoot, relative))),
  }));

  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      // Finish every request before rejecting or retrying. Otherwise callers can
      // clean up files while other checks are still reading them.
      const results = await Promise.allSettled(expected.map(async ({ relative, digest }) => {
        // Check the actual resource URL, without a cache-busting query string.
        const response = await fetch(new URL(relative === 'index.html' ? '' : relative, base), {
          cache: 'no-store', signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error(`${relative}: HTTP ${response.status}`);
        if (sha256(Buffer.from(await response.arrayBuffer())) !== digest) {
          throw new Error(`${relative}: SHA-256 does not match this deployment`);
        }
      }));
      const failure = results.find(result => result.status === 'rejected');
      if (failure) throw failure.reason;
      return { base, version: catalog.version, count: catalog.count, files: expected.length };
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
  throw lastError;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyDeployment();
  console.log(`Verified ${result.base}: ${result.files} file hashes, catalog ${result.version}, ${result.count} elements.`);
}
