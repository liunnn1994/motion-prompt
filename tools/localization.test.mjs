import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = path.join(root, 'skills/motion-prompt/scripts/motion-prompt.mjs');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'api/v1/catalog.json'), 'utf8'));
const env = { ...process.env, MOTION_PROMPT_BASE: path.join(root, 'api/v1') };
const kana = /[ぁ-んァ-ヶ]/;

function checkChinese(value, location, demoQuotes = false) {
  if (Array.isArray(value)) {
    assert.ok(value.length, `${location} must not be empty`);
    value.forEach((item, i) => checkChinese(item, `${location}[${i}]`, demoQuotes));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => checkChinese(item, `${location}.${key}`));
  } else {
    assert.equal(typeof value, 'string', `${location} must have a Chinese translation`);
    assert.ok(value.trim(), `${location} must not be blank`);
    const text = demoQuotes ? value.replace(/“[^”]*”/g, '') : value;
    assert.equal(kana.test(text), false, `${location} contains untranslated Japanese kana: ${value}`);
  }
}

test('Chinese gallery and examples UI cover every English key', () => {
  for (const file of ['assets/site.js', 'assets/found.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const start = source.indexOf('var I18N = ') + 'var I18N = '.length;
    const end = source.indexOf('\n  };', start) + '\n  }'.length;
    const translations = vm.runInNewContext(`(${source.slice(start, end)})`);
    for (const key of Object.keys(translations.en)) {
      assert.ok(Object.hasOwn(translations['zh-CN'], key), `${file}: missing ${key}`);
    }
    checkChinese(translations['zh-CN'], file);
  }
});

test('all catalog text and generated Chinese specs and prompts are translated', () => {
  for (const pack of catalog.packs) {
    checkChinese(pack.title['zh-CN'], `${pack.pack}.title`);
    for (const category of pack.categories) checkChinese(category['zh-CN'], `${pack.pack}.${category.slug}`);
  }
  for (const element of catalog.elements) {
    for (const key of ['name', 'meaning', 'ask', 'summary', 'spec', 'use']) {
      checkChinese(element[key]?.['zh-CN'], `${element.id}.${key}`, key === 'spec');
    }
    assert.equal(element.spec['zh-CN'].length, element.spec.en.length, `${element.id}: missing spec lines`);
    const spec = fs.readFileSync(path.join(root, `api/v1/zh-CN/e/${element.id}.txt`), 'utf8');
    // Drawing code can contain original demo text; audit its translated spec header.
    checkChinese(spec.split('\n// @')[0], `${element.id}.spec header`, true);
    for (const line of element.spec['zh-CN']) assert.ok(spec.includes(line), `${element.id}: missing ${line}`);
    checkChinese(fs.readFileSync(path.join(root, `api/v1/zh-CN/p/${element.id}.txt`), 'utf8'), `${element.id}.prompt`, true);
  }
});

async function pick(t, args, browseLang) {
  let stdout = '', stderr = '';
  const child = spawn(process.execPath, [cli, 'pick', '--local', '--no-open', '--timeout', '8', ...args], { cwd: root, env });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  const completed = new Promise(resolve => child.once('close', code => resolve(code)));
  child.stderr.on('data', data => { stderr += data; });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CLI did not become ready: ${stderr}`)), 5000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', data => {
      stdout += data;
      if (stdout.includes('Waiting for the user')) { clearTimeout(timer); resolve(); }
    });
  });
  const gallery = new URL(/^Gallery: (.+)$/m.exec(stdout)[1]);
  const waiting = stdout;
  const callback = new URL(gallery.searchParams.get('cb'));
  callback.searchParams.set('ids', '001');
  callback.searchParams.set('lang', browseLang);
  const response = await fetch(callback, { signal: AbortSignal.timeout(5000) });
  const html = await response.text();
  assert.equal(response.status, 200, html);
  assert.equal(await completed, 0, stderr);
  return { gallery, waiting, html, stdout };
}

for (const lang of ['zh-CN', 'en', 'ja']) {
  test(`pick opens and returns ${lang} content with matching button guidance`, async t => {
    const result = await pick(t, lang === 'zh-CN' ? [] : ['--lang', lang], lang);
    assert.equal(result.gallery.searchParams.get('lang'), lang);
    assert.ok(result.html.includes(`<html lang="${lang}">`));
    assert.ok(result.stdout.includes(catalog.elements[0].name[lang]));
    if (lang === 'zh-CN') {
      assert.ok(result.waiting.includes('选择 / Pick'));
      assert.ok(result.waiting.includes('发送给 AI / Send to AI'));
      assert.equal(kana.test(result.stdout), false);
      // An existing Japanese browser preference must not override the CLI default.
      const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
      const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
      const document = { documentElement: {} };
      vm.runInNewContext(script, {
        document, location: result.gallery, localStorage: { getItem: key => key === 'mp-lang' ? 'ja' : null },
        matchMedia: () => ({ matches: false }),
      });
      assert.equal(document.documentElement.lang, 'zh-CN');
    }
  });
}

test('pick respects a language changed in the gallery when no language was forced', async t => {
  const result = await pick(t, [], 'ja');
  assert.equal(result.gallery.searchParams.get('lang'), 'zh-CN');
  assert.ok(result.html.includes('<html lang="ja">'));
  assert.ok(result.stdout.includes(catalog.elements[0].name.ja));
});

test('Chinese exact names outrank partial names with partially matching tags', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-prompt-search-'));
  t.after(() => {
    const relative = path.relative(os.tmpdir(), fixture);
    assert.ok(relative.startsWith('motion-prompt-search-') && !relative.includes(path.sep));
    fs.rmSync(fixture, { recursive: true, force: true });
  });
  const first = catalog.elements[0];
  const second = catalog.elements[1];
  fs.writeFileSync(path.join(fixture, 'catalog.json'), JSON.stringify({ ...catalog, elements: [
    { ...first, name: { 'zh-CN': '测试目标附加', en: 'Other', ja: 'その他' }, tags: ['测试目标附加'] },
    { ...second, name: { 'zh-CN': '测试目标', en: 'Exact target', ja: '正確' }, tags: [] },
  ] }));
  const result = spawnSync(process.execPath, [cli, 'search', '测试目标'], { env: { ...env, MOTION_PROMPT_BASE: fixture }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.startsWith(`#${second.id} `), result.stdout);
});
