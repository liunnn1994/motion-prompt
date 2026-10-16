#!/usr/bin/env node
// Stage only public website files; never upload the repository or CI credentials.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.tmp', 'site');
const directories = ['assets', 'api', 'packs', 'examples', 'make-your-own', 'skills'];
const documents = fs.readdirSync(root).filter(name =>
  /^(README|CONTRIBUTING)(\.[\w-]+)?\.md$/.test(name) ||
  ['index.html', 'found.html', 'FORMAT.md', 'LICENSE', 'THIRD-PARTY-NOTICES.md', '.nojekyll'].includes(name));

// The removal target is fixed, not supplied by an environment variable or CLI argument.
if (path.relative(root, output) !== path.join('.tmp', 'site')) throw new Error('Invalid staging directory');
fs.mkdirSync(path.dirname(output), { recursive: true });
if (fs.lstatSync(path.dirname(output)).isSymbolicLink()) throw new Error('.tmp must not be a symlink');
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw new Error('Staging directory must not be a symlink');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);

const exclude = name => ['node_modules', 'out', '.git', '.env', '.DS_Store'].includes(name) ||
  name.startsWith('.env.') || name.startsWith('frames') || name.endsWith('.tmp.mp4');
for (const name of [...documents, ...directories]) {
  fs.cpSync(path.join(root, name), path.join(output, name), {
    recursive: true,
    filter: source => {
      if (exclude(path.basename(source))) return false;
      if (fs.lstatSync(source).isSymbolicLink()) throw new Error(`Public files must not be symlinks: ${source}`);
      return true;
    },
  });
}
const catalog = JSON.parse(fs.readFileSync(path.join(output, 'api/v1/catalog.json'), 'utf8'));
if (catalog.site !== 'https://motion-prompt.2077tech.com/') throw new Error('Catalog has the wrong public URL');
for (const el of catalog.elements) {
  for (const lang of ['zh-CN', 'en', 'ja']) {
    for (const kind of ['e', 'p']) {
      if (!fs.statSync(path.join(output, `api/v1/${lang}/${kind}/${el.id}.txt`)).size) throw new Error(`Empty ${lang}/${kind}/${el.id}`);
    }
  }
}
console.log(`Staged ${catalog.count} elements and public website files in ${output}`);
