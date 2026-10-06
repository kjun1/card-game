/** Markdown checker の探索・診断・終了コードを検証する。ゲーム仕様は扱わない。 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checkerUrl = new URL('../../scripts/check-markdown.mjs', import.meta.url);
const configSource = await readFile(new URL('../../.markdownlint.json', import.meta.url), 'utf8');
const validMarkdown = '# Fixture\n\nValid paragraph.\n';
const invalidMarkdown = '# Fixture\n\nText \n';

async function writeFixture(root, name, source) {
  const file = path.join(root, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, source);
  return file;
}

async function fixtureTree(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'markdown-validator-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const configPath = await writeFixture(root, '.markdownlint.json', configSource);
  return { root, configPath };
}

// CLI option を増やさず、同じ入口へ一時 directory を渡して別プロセスで検証する。
function runChecker({ root, configPath }) {
  const source = `
    import { main } from ${JSON.stringify(checkerUrl.href)};
    process.exitCode = await main({ root: process.argv[1], configPath: process.argv[2] });
  `;
  const args = ['--input-type=module', '--eval', source, root];
  if (configPath !== undefined) args.push(configPath);
  return spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
}

function expectSuccess(result, count) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, `Markdown 検証成功: ${count} ファイル / 警告 0 件\n`);
}

function expectFailure(result) {
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.stdout, '');
}

test('正常な Markdown を下位 directory まで発見し、対象件数と警告 0 件を表示する', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'README.md', validMarkdown);
  await writeFixture(tree.root, 'docs/nested/guide.md', validMarkdown);
  await writeFixture(tree.root, 'docs/ignored.txt', invalidMarkdown);
  expectSuccess(runChecker({ root: tree.root }), 2);
});

test('通常 directory の不正な Markdown を拒否し、file / line / column / rule を stderr へ出す', async (t) => {
  const tree = await fixtureTree(t);
  const file = await writeFixture(tree.root, 'docs/nested/broken.md', invalidMarkdown);
  const result = runChecker(tree);
  expectFailure(result);
  // description 全文には依存せず、位置と安定した rule ID を確認する。
  const diagnostic = result.stderr.match(/^(.*):(\d+):(\d+) \[(MD\d+)\] .+$/m);
  assert.ok(diagnostic, result.stderr);
  assert.equal(diagnostic[1], file);
  assert.equal(Number(diagnostic[2]), 3);
  assert.equal(Number(diagnostic[3]), 5);
  assert.equal(diagnostic[4], 'MD009');
  assert.match(result.stderr, /Markdown 検証失敗: 1 件/);
});

test('JSON として壊れた .markdownlint.json を成功扱いしない', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'README.md', validMarkdown);
  await writeFile(tree.configPath, '{ invalid JSON');
  const result = runChecker(tree);
  expectFailure(result);
  assert.match(result.stderr, /^\[markdown-validation\] .+/);
});

test('読み込めない設定ファイルを成功扱いしない', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'README.md', validMarkdown);
  await rm(tree.configPath);
  const result = runChecker(tree);
  expectFailure(result);
  assert.match(result.stderr, /^\[markdown-validation\] .*ENOENT/);
  assert.ok(result.stderr.includes(tree.configPath));
});

test('Markdown が 0 件の場合は失敗する', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'docs/notes.txt', validMarkdown);
  const result = runChecker(tree);
  expectFailure(result);
  assert.match(result.stderr, /\[markdown-validation\] Markdown files not found/);
});

for (const excluded of ['.git', 'node_modules']) {
  test(`${excluded} は root 直下でも下位 directory でも探索対象から除外する`, async (t) => {
    const tree = await fixtureTree(t);
    await writeFixture(tree.root, 'README.md', validMarkdown);
    await writeFixture(tree.root, `${excluded}/nested/broken.md`, invalidMarkdown);
    await writeFixture(tree.root, `docs/${excluded}/broken.md`, invalidMarkdown);
    expectSuccess(runChecker(tree), 1);
  });
}

test('除外 directory にしか Markdown がない場合も対象 0 件として失敗する', async (t) => {
  const tree = await fixtureTree(t);
  for (const excluded of ['.git', 'node_modules']) {
    await writeFixture(tree.root, `${excluded}/broken.md`, invalidMarkdown);
  }
  const result = runChecker(tree);
  expectFailure(result);
  assert.match(result.stderr, /Markdown files not found/);
});

test('内部引数で指定した設定を読み、root の既定設定と区別する', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'README.md', validMarkdown);
  await writeFile(tree.configPath, '{ invalid JSON');
  const configPath = await writeFixture(tree.root, 'config/custom.json', configSource);
  expectSuccess(runChecker({ root: tree.root, configPath }), 1);
});

test('同じプロセスで再実行しても対象ファイルを重複して数えない', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'README.md', validMarkdown);
  const source = `
    import { main } from ${JSON.stringify(checkerUrl.href)};
    for (let index = 0; index < 2; index++) {
      process.exitCode = await main({ root: process.argv[1] });
      if (process.exitCode !== 0) break;
    }
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', source, tree.root], { cwd: tree.root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, 'Markdown 検証成功: 1 ファイル / 警告 0 件\n'.repeat(2));
});

test('import だけでは Check や結果表示を実行しない', async (t) => {
  const tree = await fixtureTree(t);
  const source = `import ${JSON.stringify(checkerUrl.href)};`;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', source], { cwd: tree.root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('既存 CLI は cwd に依存せず repository の Markdown と設定を検証する', async (t) => {
  const tree = await fixtureTree(t);
  await writeFixture(tree.root, 'broken.md', invalidMarkdown);
  await writeFile(tree.configPath, '{ invalid JSON');
  const result = spawnSync(process.execPath, [fileURLToPath(checkerUrl)], { cwd: tree.root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /^Markdown 検証成功: \d+ ファイル \/ 警告 0 件\n$/);
});
