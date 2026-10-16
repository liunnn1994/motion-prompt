import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { verifyDeployment } from './verify-deployment.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-prompt-deployment-'));
  t.after(() => {
    const relative = path.relative(os.tmpdir(), root);
    assert.ok(relative.startsWith('motion-prompt-deployment-') && !relative.includes(path.sep));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const write = (name, text) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  };
  fs.mkdirSync(path.join(root, 'tools'));
  fs.copyFileSync(fileURLToPath(new URL('./package-site.mjs', import.meta.url)), path.join(root, 'tools/package-site.mjs'));
  for (const dir of ['assets', 'packs', 'examples', 'make-your-own', 'skills']) fs.mkdirSync(path.join(root, dir));
  write('index.html', '<!doctype html><title>Motion Prompt</title>');
  write('found.html', '<!doctype html><title>Examples</title>');
  write('README.zh-CN.md', '# 中文说明');
  write('assets/site.js', '// site');
  write('assets/site.css', 'body { color: black; }');
  write('packs/example/pack.js', '// drawing implementation');
  write('skills/motion-prompt/SKILL.md', '# Motion Prompt');
  write('api/v1/catalog.json', JSON.stringify({ site: 'https://motion-prompt.2077tech.com/', version: 'fixture', count: 1, packs: [{ pack: 'example' }], elements: [{ id: '001' }] }));
  for (const lang of ['zh-CN', 'en', 'ja']) for (const kind of ['e', 'p']) write(`api/v1/${lang}/${kind}/001.txt`, 'example');
  const run = () => spawnSync(process.execPath, [path.join(root, 'tools/package-site.mjs')], { encoding: 'utf8' });
  return { root, write, run, output: path.join(root, '.tmp/site') };
}

test('stages public files while excluding repository credentials and local build artifacts', t => {
  const { root, output, write, run } = fixture(t);
  for (const file of ['.env', '.github/workflows/deploy.yml', '.git/config', 'make-your-own/.env.local', 'make-your-own/node_modules/private.txt', 'make-your-own/out/video.mp4', 'make-your-own/frames001/frame.png']) write(file, 'private fixture');
  write('make-your-own/examples/demo/index.html', '<canvas></canvas>');
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(output, 'index.html')));
  assert.ok(fs.existsSync(path.join(output, 'api/v1/zh-CN/p/001.txt')));
  assert.ok(fs.existsSync(path.join(output, 'skills/motion-prompt/SKILL.md')));
  assert.ok(fs.existsSync(path.join(output, 'make-your-own/examples/demo/index.html')));
  for (const file of ['.env', '.github', '.git', 'tools', 'make-your-own/.env.local', 'make-your-own/node_modules', 'make-your-own/out', 'make-your-own/frames001']) assert.equal(fs.existsSync(path.join(output, file)), false, file);
  assert.equal(fs.readFileSync(path.join(root, '.env'), 'utf8'), 'private fixture');
});

test('fails before deployment when a localized API file is missing', t => {
  const { root, run } = fixture(t);
  fs.unlinkSync(path.join(root, 'api/v1/zh-CN/p/001.txt'));
  assert.notEqual(run().status, 0);
});

test('rejects a symlink in public content instead of publishing its target', t => {
  const { root, write, run } = fixture(t);
  write('private/secret.txt', 'not public');
  fs.symlinkSync(path.join(root, 'private'), path.join(root, 'assets/leak'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must not be symlinks/);
});

test('rejects a redirected staging directory without deleting its contents', t => {
  const { root, write, run } = fixture(t);
  write('private/keep.txt', 'keep');
  fs.symlinkSync(path.join(root, 'private'), path.join(root, '.tmp'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must not be a symlink/);
  assert.equal(fs.readFileSync(path.join(root, 'private/keep.txt'), 'utf8'), 'keep');
});

async function publishedFixture(t, overrides = {}) {
  const local = fixture(t);
  const result = local.run();
  assert.equal(result.status, 0, result.stderr);
  const requested = new Set();
  const server = http.createServer((req, res) => {
    const relative = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    requested.add(relative);
    if (Object.hasOwn(overrides, relative)) {
      res.statusCode = overrides[relative] === null ? 404 : 200;
      res.end(overrides[relative]);
    } else {
      res.end(fs.readFileSync(path.join(local.output, relative)));
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return { siteRoot: local.output, base: `http://127.0.0.1:${server.address().port}/`, attempts: 1, requested };
}

test('verifies the actual homepage, CSS, JS and drawing code as well as APIs', async t => {
  const { requested, ...options } = await publishedFixture(t);
  const result = await verifyDeployment(options);
  assert.equal(result.files, 7);
  for (const file of ['index.html', 'found.html', 'assets/site.js', 'assets/site.css', 'packs/example/pack.js', 'api/v1/catalog.json', 'api/v1/zh-CN/p/001.txt']) assert.ok(requested.has(file), file);
});

test('rejects a truncated homepage even when the install command and APIs are correct', async t => {
  const options = await publishedFixture(t, { 'index.html': 'npx skills add liunnn1994/motion-prompt' });
  await assert.rejects(verifyDeployment(options), /index\.html: SHA-256/);
});

for (const file of ['assets/site.js', 'assets/site.css', 'packs/example/pack.js', 'found.html']) {
  test(`rejects stale ${file} with an unchanged catalog and prompt`, async t => {
    const options = await publishedFixture(t, { [file]: 'previous release' });
    await assert.rejects(verifyDeployment(options), /SHA-256 does not match/);
  });
}

test('rejects a missing frontend resource', async t => {
  const options = await publishedFixture(t, { 'assets/site.js': null });
  await assert.rejects(verifyDeployment(options), /assets\/site\.js: HTTP 404/);
});
