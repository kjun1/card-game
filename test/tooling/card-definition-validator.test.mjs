/** Validator の構造検証・fixture 判定・CLI を検証する。ゲーム動作は扱わない。 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkCardFixtures, createCardValidator, formatValidationErrors } from '../../scripts/check-cards.mjs';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    energy: { type: 'integer', minimum: 0, default: 2 },
  },
  required: ['name', 'energy'],
  additionalProperties: false,
};
const card = { name: 'Fixture', energy: 1 };
const expectation = { instancePath: '/energy', keyword: 'minimum', params: { limit: 0 } };
const cliPath = fileURLToPath(new URL('../../scripts/check-cards.mjs', import.meta.url));

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value));
}

async function fixtureTree(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'card-schema-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const schemaPath = path.join(root, 'card.schema.json');
  const fixturesRoot = path.join(root, 'cards');
  await writeJson(schemaPath, schema);
  await writeJson(path.join(fixturesRoot, 'valid/card.json'), card);
  await writeJson(path.join(fixturesRoot, 'invalid/cost.json'), { ...card, energy: -1 });
  await writeJson(path.join(fixturesRoot, 'invalid-expectations.json'), { 'cost.json': expectation });
  return { root, schemaPath, fixturesRoot };
}

test('Schema を自己検証してコンパイルし、正常な Card を受け入れる', () => {
  const validate = createCardValidator(schema);
  assert.equal(validate(card), true);
  assert.equal(validate.errors, null);
});

test('不正な Schema keyword 値・未知の keyword・未解決 ref を拒否する', () => {
  assert.throws(() => createCardValidator({ ...schema, properties: { energy: { type: 'number', minimum: 'zero' } } }), /minimum.*number/);
  assert.throws(() => createCardValidator({ ...schema, properteis: {} }), /unknown keyword.*properteis/);
  assert.throws(() => createCardValidator({ ...schema, properties: { ...schema.properties, energy: { $ref: '#/$defs/missing' } } }), /resolve reference/);
  assert.throws(() => createCardValidator({ ...schema, $async: true }), /asynchronous validation/);
});

test('Boolean Schema・型のない Schema・異なる dialect を拒否する', () => {
  for (const candidate of [true, false, null, [], {}, { ...schema, type: 'string' }, { ...schema, type: undefined }, { ...schema, $schema: 'http://json-schema.org/draft-07/schema#' }]) {
    assert.throws(() => createCardValidator(candidate), /Card Schema must declare/);
  }
});

test('型変換・default の補完・未知 field の削除をせず入力を保持する', () => {
  const validate = createCardValidator(schema);
  for (const candidate of [card, { name: 'Fixture', energy: '1' }, { name: 'Fixture' }, { ...card, typo: 3 }]) {
    const input = structuredClone(candidate);
    const before = structuredClone(input);
    assert.equal(validate(input), candidate === card);
    assert.deepEqual(input, before);
  }
});

test('全エラーを収集しファイルと JSON Pointer と詳細を表示する', () => {
  const validate = createCardValidator(schema);
  assert.equal(validate({ name: '', energy: -1, extra: true }), false);
  const formatted = formatValidationErrors('card.json', validate.errors);
  assert.equal(formatted.length, 3);
  assert.ok(formatted.some((line) => line.includes('card.json#/energy: [minimum]')));
  assert.ok(formatted.some((line) => line.includes('card.json#/name: [minLength]')));
  assert.ok(formatted.some((line) => line.includes('card.json#: [additionalProperties]') && line.includes('"additionalProperty":"extra"')));
});

test('valid の成功と意図した invalid の失敗を件数に数える', async (t) => {
  const tree = await fixtureTree(t);
  assert.deepEqual(await checkCardFixtures(tree), { validFiles: 1, invalidFiles: 1, errors: [] });
});

test('invalid は keyword と instancePath と params の部分一致をすべて要求する', async (t) => {
  const tree = await fixtureTree(t);
  for (const expected of [
    { ...expectation, keyword: 'type' },
    { ...expectation, instancePath: '/name' },
    { ...expectation, params: { limit: 1 } },
  ]) {
    await writeJson(path.join(tree.fixturesRoot, 'invalid-expectations.json'), { 'cost.json': expected });
    const result = await checkCardFixtures(tree);
    assert.equal(result.invalidFiles, 0);
    assert.ok(result.errors.some((error) => error.includes('[wrong-failure]')));
    assert.ok(result.errors.some((error) => error.includes('cost.json#/energy: [minimum]')));
  }
  await writeJson(path.join(tree.fixturesRoot, 'invalid-expectations.json'), { 'cost.json': { instancePath: '/energy', keyword: 'minimum' } });
  assert.deepEqual((await checkCardFixtures(tree)).errors, []);
});

test('valid の違反と invalid の予期しない成功を失敗にする', async (t) => {
  const tree = await fixtureTree(t);
  await writeJson(path.join(tree.fixturesRoot, 'valid/card.json'), { ...card, energy: -1 });
  await writeJson(path.join(tree.fixturesRoot, 'invalid/cost.json'), card);
  const result = await checkCardFixtures(tree);
  assert.equal(result.validFiles, 0);
  assert.equal(result.invalidFiles, 0);
  assert.ok(result.errors.some((error) => error.includes('valid/card.json#/energy: [minimum]')));
  assert.ok(result.errors.some((error) => error.includes('[unexpected-valid]')));
});

test('invalid fixture の malformed JSON は期待どおりの拒否に数えない', async (t) => {
  const tree = await fixtureTree(t);
  await writeFile(path.join(tree.fixturesRoot, 'invalid/cost.json'), '{');
  const result = await checkCardFixtures(tree);
  assert.equal(result.invalidFiles, 0);
  assert.ok(result.errors.some((error) => error.includes('invalid/cost.json#: [json]')));
});

test('valid fixture・Schema・expectation manifest の malformed JSON も失敗にする', async (t) => {
  for (const name of ['valid/card.json', 'schema', 'invalid-expectations.json']) {
    const tree = await fixtureTree(t);
    const file = name === 'schema' ? tree.schemaPath : path.join(tree.fixturesRoot, name);
    await writeFile(file, '{');
    const result = await checkCardFixtures(tree);
    assert.ok(result.errors.some((error) => error.includes(file) && error.includes('[json]')));
  }
});

test('Schema と manifest の読み取り失敗を成功にしない', async (t) => {
  for (const name of ['schema', 'invalid-expectations.json']) {
    const tree = await fixtureTree(t);
    const file = name === 'schema' ? tree.schemaPath : path.join(tree.fixturesRoot, name);
    await rm(file);
    const result = await checkCardFixtures(tree);
    assert.equal(result.invalidFiles, 0);
    assert.ok(result.errors.some((error) => error.includes(file) && error.includes('[read]')));
  }
});

test('Schema の自己検証・コンパイル失敗を fixture 検証前に報告する', async (t) => {
  const tree = await fixtureTree(t);
  await writeJson(tree.schemaPath, { ...schema, minProperties: -1 });
  const result = await checkCardFixtures(tree);
  assert.equal(result.validFiles, 0);
  assert.equal(result.invalidFiles, 0);
  assert.ok(result.errors.some((error) => error.includes('[schema]') && error.includes('/minProperties')));
});

test('valid / invalid のどちらも、欠落または JSON fixture 0 件なら失敗にする', async (t) => {
  for (const category of ['valid', 'invalid']) {
    for (const missing of [false, true]) {
      const tree = await fixtureTree(t);
      const directory = path.join(tree.fixturesRoot, category);
      await rm(directory, { recursive: true });
      if (!missing) {
        await mkdir(directory);
        await writeFile(path.join(directory, 'README.md'), 'not a fixture');
      }
      const result = await checkCardFixtures(tree);
      assert.ok(result.errors.some((error) => error.includes(directory) && error.includes('[empty-fixtures]')));
      if (missing) assert.ok(result.errors.some((error) => error.includes('[read]')));
    }
  }
});

test('下位 directory の fixture を再帰的に発見し、非 JSON ファイルを除外する', async (t) => {
  const tree = await fixtureTree(t);
  await writeJson(path.join(tree.fixturesRoot, 'valid/nested/second.json'), { ...card, name: 'Nested' });
  await mkdir(path.join(tree.fixturesRoot, 'invalid/nested'));
  await rename(path.join(tree.fixturesRoot, 'invalid/cost.json'), path.join(tree.fixturesRoot, 'invalid/nested/cost.json'));
  await writeFile(path.join(tree.fixturesRoot, 'invalid/nested/README.md'), 'not JSON');
  await writeJson(path.join(tree.fixturesRoot, 'invalid-expectations.json'), { 'nested/cost.json': expectation });
  assert.deepEqual(await checkCardFixtures(tree), { validFiles: 2, invalidFiles: 1, errors: [] });
});

test('fixture の symlink を黙って見逃さず、通常の invalid には数えない', async (t) => {
  const tree = await fixtureTree(t);
  await rm(path.join(tree.fixturesRoot, 'invalid/cost.json'));
  await symlink(path.join(tree.root, 'missing.json'), path.join(tree.fixturesRoot, 'invalid/cost.json'));
  const result = await checkCardFixtures(tree);
  assert.equal(result.invalidFiles, 0);
  assert.ok(result.errors.some((error) => error.includes('[fixture-path]')));
});

test('expectation の欠落・古いキーを検出する', async (t) => {
  const tree = await fixtureTree(t);
  await writeJson(path.join(tree.fixturesRoot, 'invalid-expectations.json'), { 'old.json': expectation });
  const result = await checkCardFixtures(tree);
  assert.equal(result.invalidFiles, 0);
  assert.ok(result.errors.some((error) => error.includes('[missing-expectation]')));
  assert.ok(result.errors.some((error) => error.includes('[stale-expectation]') && error.includes('old.json')));
});

test('不正な manifest 構造や path を拒否する', async (t) => {
  const tree = await fixtureTree(t);
  for (const invalid of [
    [], null,
    { 'cost.json': { keyword: 'minimum' } },
    { 'cost.json': { ...expectation, instancePath: 'energy' } },
    { 'cost.json': { ...expectation, instancePath: '/~wrong' } },
    { 'cost.json': { ...expectation, keyword: '' } },
    { 'cost.json': { ...expectation, typo: true } },
    { 'cost.json': { ...expectation, params: [] } },
    { '../cost.json': expectation },
    { '/cost.json': expectation },
    { 'nested\\cost.json': expectation },
  ]) {
    await writeJson(path.join(tree.fixturesRoot, 'invalid-expectations.json'), invalid);
    const result = await checkCardFixtures(tree);
    assert.equal(result.invalidFiles, 0);
    assert.ok(result.errors.some((error) => error.includes('[expectations]')), JSON.stringify(invalid));
  }
});

test('エラーの出力順序をファイル名で安定させる', async (t) => {
  const tree = await fixtureTree(t);
  await writeJson(path.join(tree.fixturesRoot, 'valid/z.json'), { ...card, energy: -1 });
  await writeJson(path.join(tree.fixturesRoot, 'valid/a.json'), { ...card, energy: -1 });
  const result = await checkCardFixtures(tree);
  assert.equal(result.errors.length, 2);
  assert.match(result.errors[0], /a\.json#\/energy/);
  assert.match(result.errors[1], /z\.json#\/energy/);
});

test('CLI は成功時に件数を表示し、ゲーム動作の検証とは区別する', async (t) => {
  const tree = await fixtureTree(t);
  const fixturesRoot = fileURLToPath(new URL('../fixtures/card-definitions', import.meta.url));
  const schemaPath = fileURLToPath(new URL('../../schemas/card.schema.json', import.meta.url));
  let defaultOutput;
  for (const args of [[], ['--fixtures', fixturesRoot], ['--fixtures', fixturesRoot, '--schema', schemaPath]]) {
    const result = spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8', cwd: tree.root });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.match(result.stdout, /構造 valid \d+ 件 \/ invalid \d+ 件/);
    assert.match(result.stdout, /静的意味 valid \d+ 集合 \/ invalid \d+ 集合/);
    assert.match(result.stdout, /ゲーム動作は未検証/);
    defaultOutput ??= result.stdout;
    assert.equal(result.stdout, defaultOutput);
  }
});

test('CLI は違反をファイル・JSON Pointer とともに stderr へ出し、非 0 で終了する', async (t) => {
  const tree = await fixtureTree(t);
  await writeJson(path.join(tree.fixturesRoot, 'valid/card.json'), { ...card, energy: -1 });
  const result = spawnSync(process.execPath, [cliPath, '--schema', tree.schemaPath, '--fixtures', tree.fixturesRoot], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /valid\/card\.json#\/energy: \[minimum\]/);
});

test('CLI は不明な option・値不足・重複指定を拒否する', () => {
  for (const args of [['--unknown'], ['toString', 'value'], ['--schema'], ['--schema', '--fixtures'], ['--schema', 'one', '--schema', 'two']]) {
    const result = spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage:/);
  }
});

test('repository の実際の Schema と全 fixture が構造契約を満たす', async () => {
  const result = await checkCardFixtures();
  assert.deepEqual(result.errors, []);
  assert.ok(result.validFiles >= 10);
  assert.ok(result.invalidFiles >= 10);
});

async function repositoryValidator() {
  return createCardValidator(JSON.parse(await readFile(new URL('../../schemas/card.schema.json', import.meta.url), 'utf8')));
}

async function repositoryFixture(name) {
  return JSON.parse(await readFile(new URL(`../fixtures/card-definitions/structural/valid/${name}.json`, import.meta.url), 'utf8'));
}

test('Action Tag・別 Operation・別 Ability から Action 指定を補完しない', async () => {
  const validate = await repositoryValidator();
  for (const name of ['tag-action-tactic', 'settable-tactic', 'independent-abilities']) {
    const input = await repositoryFixture(name);
    const before = structuredClone(input);
    assert.equal(validate(input), true, JSON.stringify(validate.errors));
    assert.deepEqual(input, before);
  }
  const tactic = await repositoryFixture('settable-tactic');
  tactic.operations.play.action = false;
  tactic.operations.set.action = true;
  assert.equal(validate(tactic), true, JSON.stringify(validate.errors));
  const support = await repositoryFixture('independent-abilities');
  support.abilities[0].action = false;
  support.abilities[1].action = true;
  support.operations.deploy.action = true;
  assert.equal(validate(support), true, JSON.stringify(validate.errors));
});

test('Runtime field は Card の内側の Parameter・Operation・Ability にも混在できない', async () => {
  const validate = await repositoryValidator();
  for (const [name, pointer, field, value, container] of [
    ['vanilla-unit', '/parameters', 'currentHp', 2, (input) => input.parameters],
    ['settable-tactic', '/operations/set', 'currentZone', 'support_zone', (input) => input.operations.set],
    ['reaction-support', '/abilities/0', 'selectedObjectId', 'runtime-123', (input) => input.abilities[0]],
    ['reaction-support', '/abilities/0/activation', 'exhausted', true, (input) => input.abilities[0].activation],
  ]) {
    const input = await repositoryFixture(name);
    container(input)[field] = value;
    assert.equal(validate(input), false, `${name}: ${field}`);
    assert.ok(validate.errors.some((error) => error.instancePath === pointer
      && error.keyword === 'additionalProperties'
      && error.params.additionalProperty === field), JSON.stringify(validate.errors));
  }
});

test('Reaction Source は Card Type と一致し、Set Card の Reaction は Set を必要とする', async () => {
  const validate = await repositoryValidator();
  const sources = ['unit', 'face_up_support', 'set_card'];
  for (const [name, source] of [
    ['reaction-unit', 'unit'],
    ['reaction-support', 'face_up_support'],
    ['reaction-set-card', 'set_card'],
  ]) {
    for (const candidate of sources) {
      const input = await repositoryFixture(name);
      input.abilities[0].activation.source = candidate;
      assert.equal(validate(input), candidate === source, `${name}: ${candidate}`);
    }
  }
  const input = await repositoryFixture('reaction-set-card');
  input.operations = (await repositoryFixture('non-action-tactic')).operations;
  assert.equal(validate(input), false);
  assert.ok(validate.errors.some((error) => error.instancePath === '/operations'
    && error.keyword === 'required' && error.params.missingProperty === 'set'));
});

test('SimultaneousGroup は両 Core への Damage 1 件ずつを順序に依存せず表現する', async () => {
  const validate = await repositoryValidator();
  const input = await repositoryFixture('simultaneous-resolution');
  input.abilities[0].resolution[0].effects.reverse();
  assert.equal(validate(input), true, JSON.stringify(validate.errors));
  // 値が異なる同一 Core の 2 件も拒否し、uniqueItems だけには依存しない。
  const duplicateCore = structuredClone(input);
  const effects = duplicateCore.abilities[0].resolution[0].effects;
  effects[1].target.player = effects[0].target.player;
  effects[1].amount += 1;
  assert.equal(validate(duplicateCore), false);
  assert.ok(validate.errors.some((error) => error.instancePath === '/abilities/0/resolution/0/effects'
    && error.keyword === 'contains'));
  const extra = structuredClone(input);
  extra.abilities[0].resolution[0].effects.push({ type: 'damage', target: { type: 'core', player: 'self' }, amount: 3 });
  assert.equal(validate(extra), false);
  assert.ok(validate.errors.some((error) => error.instancePath === '/abilities/0/resolution/0/effects'
    && error.keyword === 'maxItems'));
});

test('selected の未解決 symbol は構造検証を通過し、別層の static semantic validation が参照を解決する', async () => {
  const validate = await repositoryValidator();
  const input = await repositoryFixture('action-tactic');
  const target = input.operations.play.resolution[0].effect.target;
  target.selection = 'unresolved-target';
  // この成功は対象の存在や効果適用の合法性を保証しない。
  assert.equal(validate(input), true, JSON.stringify(validate.errors));
  assert.equal(Object.hasOwn(input.operations.play.targets, target.selection), false);
  target.selection = '';
  assert.equal(validate(input), false);
  assert.ok(validate.errors.some((error) => error.instancePath === '/operations/play/resolution/0/effect/target/selection'
    && error.keyword === 'pattern'));
});
