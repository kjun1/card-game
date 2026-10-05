import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkSemanticFixtures, createCardDefinitionValidator, createCardValidator } from '../scripts/check-cards.mjs';

const schema = JSON.parse(await readFile(new URL('../schemas/card.schema.json', import.meta.url), 'utf8'));
const structural = createCardValidator(schema);
const validate = createCardDefinitionValidator(schema);
const cli = fileURLToPath(new URL('../scripts/check-cards.mjs', import.meta.url));
const fixture = async (name) => JSON.parse(await readFile(new URL(`./fixtures/cards/valid/${name}.json`, import.meta.url), 'utf8'));
const support = await fixture('reaction-support');
const tactic = await fixture('action-tactic');
const unit = await fixture('ready-unit');
const selected = (selection = 'victim') => ({ type: 'selected', selection });
const step = (type, target) => ({ type: 'effect', effect: {
  type, target,
  ...(type === 'damage' && { amount: 1 }),
  ...(type === 'move_card' && { destination: { player: 'target_owner', zone: 'hand' } }),
} });
const cardSelection = (zone, extra = {}) => ({ type: 'card', player: 'self', zone, ...extra });
const document = (card, file = 'card.json') => ({ file, card });

function selectedCard(selection, effect = 'move_card') {
  const card = structuredClone(support);
  card.abilities[0].targets = { victim: selection };
  card.abilities[0].resolution = [step(effect, selected())];
  return card;
}

function semanticErrors(cards) {
  for (const card of cards) assert.equal(structural(card), true, JSON.stringify(structural.errors));
  return validate(cards.map((card, index) => document(card, `card-${index}.json`)));
}

test('技術 ID は入力集合内だけで一意、Ability ID は各 Card 内だけで一意', () => {
  const first = structuredClone(support);
  const second = structuredClone(support);
  second.id = 'another-definition';
  // 同じ表示名と同じ Ability ID を別 Card で使える。
  assert.deepEqual(semanticErrors([first, second]), []);
  assert.deepEqual(semanticErrors([first]), []);
  second.id = first.id;
  const [duplicate] = semanticErrors([first, second]);
  assert.equal(duplicate.keyword, 'semantic/duplicate-card-id');
  assert.equal(duplicate.file, 'card-1.json');
  assert.equal(duplicate.instancePath, '/id');
  assert.deepEqual(duplicate.params, { firstFile: 'card-0.json', firstInstancePath: '/id' });
  first.abilities.push(structuredClone(first.abilities[0]));
  assert.deepEqual(semanticErrors([first]).map((error) => [error.keyword, error.instancePath]), [
    ['semantic/duplicate-ability-id', '/abilities/1/id'],
  ]);
});

test('Selection は同じ Operation / Ability だけから解決し、隣の Scope を参照しない', () => {
  const card = structuredClone(tactic);
  card.operations.set = { cost: { energy: 0 } };
  card.abilities = [{
    id: 'reaction', name: '反応', activation: { type: 'reaction', source: 'set_card' }, cost: { energy: 0 },
    resolution: [step('damage', selected('enemy-core'))],
  }];
  assert.equal(semanticErrors([card])[0].instancePath, '/abilities/0/resolution/0/effect/target/selection');
  card.abilities[0].targets = { 'enemy-core': cardSelection('unit_zone') };
  assert.deepEqual(semanticErrors([card]), []);
  delete card.operations.play.targets;
  assert.equal(semanticErrors([card])[0].instancePath, '/operations/play/resolution/0/effect/target/selection');
  delete card.operations.play;
  card.abilities.push({ ...structuredClone(card.abilities[0]), id: 'second' });
  delete card.abilities[1].targets;
  assert.equal(semanticErrors([card])[0].instancePath, '/abilities/1/resolution/0/effect/target/selection');
});

test('prototype 由来の symbol を解決せず、明示した constructor は利用できる', () => {
  const card = selectedCard({ type: 'core', player: 'self' }, 'damage');
  card.abilities[0].resolution[0].effect.target.selection = 'constructor';
  assert.equal(semanticErrors([card])[0].keyword, 'semantic/unresolved-selection');
  card.abilities[0].targets.constructor = { type: 'core', player: 'self' };
  assert.deepEqual(semanticErrors([card]), []);
});

test('Effect と Selection の確定した不一致だけを拒否し、省略条件には互換候補を残す', () => {
  const core = { type: 'core', player: 'opponent' };
  for (const [selection, effects] of [
    [core, { damage: true, move_card: false, destroy: false, ready: false, exhaust: false, reveal: false }],
    [cardSelection('unit_zone'), { damage: true, move_card: true, destroy: true, ready: true, exhaust: true, reveal: false }],
    [cardSelection('unit_zone', { state: 'face_up' }), { damage: true, ready: true }],
    [cardSelection('hand', { cardType: 'unit' }), { damage: false, move_card: true, destroy: false, ready: false, exhaust: false, reveal: false }],
    [cardSelection('support_zone'), { damage: false, move_card: true, destroy: false, ready: false, exhaust: false, reveal: true }],
    [cardSelection('support_zone', { cardType: 'tactic' }), { move_card: true, reveal: true }],
    [cardSelection('support_zone', { state: 'set' }), { move_card: true, reveal: true }],
    [cardSelection('support_zone', { state: 'face_up' }), { move_card: true, reveal: false }],
    [cardSelection('support_zone', { cardType: 'support' }), { move_card: true, reveal: false }],
  ]) {
    for (const [effect, accepted] of Object.entries(effects)) {
      const errors = semanticErrors([selectedCard(selection, effect)]);
      assert.equal(errors.length === 0, accepted, `${effect}: ${JSON.stringify(selection)}`);
      if (!accepted) assert.equal(errors[0].keyword, 'semantic/effect-target-type');
    }
  }
});

test('未使用 Selection も静的に成立しない型・Zone・状態の組合せなら拒否する', () => {
  for (const selection of [
    cardSelection('unit_zone', { cardType: 'support' }),
    cardSelection('unit_zone', { cardType: 'tactic' }),
    cardSelection('unit_zone', { state: 'set' }),
    cardSelection('support_zone', { cardType: 'unit' }),
    cardSelection('support_zone', { cardType: 'support', state: 'set' }),
    cardSelection('hand', { state: 'set' }),
    cardSelection('hand', { state: 'face_up' }),
  ]) {
    const card = selectedCard(selection);
    card.abilities[0].resolution = [step('damage', { type: 'core', player: 'opponent' })];
    const errors = semanticErrors([card]);
    assert.equal(errors.length, 1, JSON.stringify(selection));
    assert.equal(errors[0].keyword, 'semantic/impossible-selection');
    assert.equal(errors[0].instancePath, '/abilities/0/targets/victim');
  }
  // Reveal 後の Tactic が Support Zone にある条件は成立し得る。
  assert.deepEqual(semanticErrors([selectedCard(cardSelection('support_zone', { cardType: 'tactic', state: 'face_up' }))]), []);
});

test('source の型は Card / Activation から確認するが、Effect 列を実行しない', async () => {
  for (const [base, effect, accepted] of [
    [unit, 'ready', true], [unit, 'destroy', true], [unit, 'reveal', false],
    [support, 'ready', false], [support, 'destroy', false], [support, 'reveal', false],
  ]) {
    const card = structuredClone(base);
    card.abilities[0].resolution = [step(effect, { type: 'source' })];
    assert.equal(semanticErrors([card]).length === 0, accepted, `${card.cardType}: ${effect}`);
  }
  const play = structuredClone(tactic);
  play.operations.play.resolution = [step('reveal', { type: 'source' })];
  assert.equal(semanticErrors([play])[0].keyword, 'semantic/effect-target-type');
  const set = await fixture('reaction-set-card');
  set.abilities[0].resolution = [step('reveal', { type: 'source' })];
  // set_card は利用元の種類。使用時に既に Reveal されたかはここで推論しない。
  assert.deepEqual(semanticErrors([set]), []);
  const moved = structuredClone(unit);
  moved.abilities[0].resolution.unshift(step('move_card', { type: 'source' }));
  assert.deepEqual(semanticErrors([moved]), []);
});

test('declared_action_source は Reaction 内だけで使える', async () => {
  const card = await fixture('confiscation-support');
  assert.deepEqual(semanticErrors([card]), []);
  card.abilities[0].activation.type = 'operation';
  assert.equal(semanticErrors([card])[0].keyword, 'semantic/reference-scope');
  const play = structuredClone(tactic);
  play.operations.play.resolution = card.abilities[0].resolution;
  assert.equal(semanticErrors([play])[0].keyword, 'semantic/reference-scope');
});

test('構造不正の集合は意味検証へ進まず、null や欠落 field でも例外にしない', () => {
  const duplicate = structuredClone(support);
  duplicate.abilities.push(structuredClone(duplicate.abilities[0]));
  for (const invalid of [null, {}, { ...support, abilities: null }, { ...support, operations: null }]) {
    const errors = validate([document(duplicate), document(invalid, 'invalid.json')]);
    assert.ok(errors.length > 0);
    assert.ok(errors.every((error) => !error.keyword.startsWith('semantic/')));
    assert.ok(errors.every((error) => error.file === 'invalid.json'));
  }
});

test('入力と派生元の定義を変更せず、JSON 配列内の位置も診断へ含める', () => {
  const cards = [structuredClone(support), structuredClone(support)];
  const freeze = (value) => {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
  };
  const before = structuredClone(cards);
  freeze(cards);
  const errors = validate(cards.map((card, index) => ({ file: 'collection.json', instancePath: `/${index}`, card })));
  assert.deepEqual(cards, before);
  assert.equal(errors[0].instancePath, '/1/id');
  assert.equal(errors[0].params.firstInstancePath, '/0/id');
});

test('Runtime の存在・Visibility・Timing・Resource・戦闘結果は静的検証の対象外', async () => {
  for (const name of ['reaction-timing-self', 'zero-parameters', 'simultaneous-resolution', 'both-player-discard']) {
    assert.deepEqual(semanticErrors([await fixture(name)]), []);
  }
  const hidden = selectedCard({ ...cardSelection('hand'), player: 'opponent' });
  hidden.abilities[0].cost = { energy: 999 };
  assert.deepEqual(semanticErrors([hidden]), []);
});

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value)}\n`);
}

async function fixtureTree(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'card-semantics-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bad = selectedCard({ type: 'core', player: 'self' });
  await writeJson(path.join(root, 'valid/base.json'), support);
  await writeJson(path.join(root, 'semantic/valid/card.json'), [support]);
  await writeJson(path.join(root, 'semantic/invalid/card.json'), [bad]);
  await writeJson(path.join(root, 'semantic/invalid-expectations.json'), {
    'card.json': { keyword: 'semantic/effect-target-type', instancePath: '/0/abilities/0/resolution/0/effect/target' },
  });
  return root;
}

test('既存 valid 集合と静的意味 fixture の正例・負例を検証する', async (t) => {
  const root = await fixtureTree(t);
  assert.deepEqual(await checkSemanticFixtures({ fixturesRoot: root }), { validCollections: 2, invalidCollections: 1, errors: [] });
  const repository = await checkSemanticFixtures();
  assert.deepEqual(repository.errors, []);
  assert.ok(repository.validCollections >= 2);
  assert.ok(repository.invalidCollections >= 6);
  await writeJson(path.join(root, 'valid/duplicate.json'), support);
  const duplicate = await checkSemanticFixtures({ fixturesRoot: root });
  assert.ok(duplicate.errors.some((error) => error.includes('duplicate.json#/id: [semantic/duplicate-card-id]')));
});

test('意味 invalid の構造不正・JSON 破損・空集合を期待どおりの拒否に数えない', async (t) => {
  const root = await fixtureTree(t);
  const file = path.join(root, 'semantic/invalid/card.json');
  for (const [contents, diagnostic] of [
    [JSON.stringify([null]), '[structural-failure]'], ['{', '[json]'], ['[]', '[fixture-collection]'],
  ]) {
    await writeFile(file, contents);
    const result = await checkSemanticFixtures({ fixturesRoot: root });
    assert.equal(result.invalidCollections, 0);
    assert.ok(result.errors.some((error) => error.includes(diagnostic)));
  }
});

test('意味 fixture の誤った期待値・期待漏れ・想定外成功・欠落を失敗にする', async (t) => {
  const root = await fixtureTree(t);
  const manifest = path.join(root, 'semantic/invalid-expectations.json');
  const expected = { keyword: 'semantic/effect-target-type', instancePath: '/wrong' };
  await writeJson(manifest, { 'card.json': expected });
  assert.ok((await checkSemanticFixtures({ fixturesRoot: root })).errors.some((error) => error.includes('[wrong-failure]')));
  await writeJson(path.join(root, 'semantic/invalid/card.json'), [support]);
  assert.ok((await checkSemanticFixtures({ fixturesRoot: root })).errors.some((error) => error.includes('[unexpected-valid]')));
  await writeJson(manifest, { 'old.json': expected });
  const missing = await checkSemanticFixtures({ fixturesRoot: root });
  assert.ok(missing.errors.some((error) => error.includes('[missing-expectation]')));
  assert.ok(missing.errors.some((error) => error.includes('[stale-expectation]')));
  await rm(path.join(root, 'semantic'), { recursive: true });
  assert.ok((await checkSemanticFixtures({ fixturesRoot: root })).errors.some((error) => error.includes('[read]')));
});

test('CLI は指定ファイルを 1 定義集合として扱い重複 ID を検出する', async (t) => {
  const root = await fixtureTree(t);
  const file = path.join(root, 'valid/base.json');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  const success = run('--cards', file);
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /1 定義（構造契約・静的意味を検証。ゲーム動作は未検証）/);
  const duplicate = run('--cards', file, '--cards', file);
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /base\.json#\/id: \[semantic\/duplicate-card-id\]/);
  assert.equal(run('--cards', file, '--fixtures', root).status, 1);
  await writeJson(file, null);
  const malformed = run('--cards', file);
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /base\.json#: \[type\]/);
  assert.doesNotMatch(malformed.stderr, /TypeError/);
});

test('カスタム Schema は現版の構造契約を緩めたり意味検証をスキップしたりしない', async (t) => {
  const root = await fixtureTree(t);
  const schemaPath = path.join(root, 'loose.schema.json');
  const loose = { $schema: schema.$schema, type: 'object' };
  await writeJson(schemaPath, loose);
  const card = selectedCard({ type: 'core', player: 'self' });
  const file = path.join(root, 'card.json');
  await writeJson(file, card);
  const semantic = spawnSync(process.execPath, [cli, '--schema', schemaPath, '--cards', file], { encoding: 'utf8' });
  assert.equal(semantic.status, 1);
  assert.match(semantic.stderr, /semantic\/effect-target-type/);
  await writeJson(file, {});
  const structural = spawnSync(process.execPath, [cli, '--schema', schemaPath, '--cards', file], { encoding: 'utf8' });
  assert.equal(structural.status, 1);
  assert.match(structural.stderr, /\[required\]/);
  assert.doesNotMatch(structural.stderr, /TypeError/);
});
