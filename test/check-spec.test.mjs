import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateSpecifications } from '../scripts/check-spec.mjs';

const requirementSource = `# Requirements

| ID | Requirement |
| --- | --- |
| GR-001 | 要求1 |
| IR-001 | 要求2 |
| PER-001 | 要求3 |

## Traceability

| Requirement | Primary downstream specification |
| --- | --- |
| GR-001 | rules.md |
`;
const scenario = `  @GR-001 @AC-TURN-001
  Scenario: 正常な操作
    Given Energy が 3
    When Cost 2 の操作を実行する
    Then Energy は 1
`;
const feature = (body = scenario) => `Feature: 検証用の仕様\n${body}`;
const validate = (source, requirements = [{ path: 'docs/requirements/test.md', source: requirementSource }]) => validateSpecifications({
  requirements,
  features: [{ path: 'docs/acceptance/test.feature', source }],
});
const codes = (result) => result.diagnostics.map((diagnostic) => diagnostic.code);
const expectCode = (source, code) => assert.ok(codes(validate(source)).includes(code), `Expected ${code}`);

test('validates direct tags against definition tables while ignoring traceability references', () => {
  const result = validate(feature());
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.counts, { requirements: 3, features: 1, scenarios: 1, examples: 1 });
});

test('compiles multiple Examples under a Rule without treating rows as duplicate Scenario IDs', () => {
  const result = validate(feature(`  Rule: Energy
    Background:
      Given Active Player がいる
    @IR-001 @PER-001 @AC-AR-001 @smoke
    Scenario Outline: Energy <before> からの支払い
      Given Energy が <before>
      When Cost 2 の操作を実行する
      Then Energy は <after>
      Examples: 通常
        | before | after |
        | 3      | 1     |
        | 4      | 2     |
      Examples: 境界
        | before | after |
        | 2      | 0     |
`));
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.counts.scenarios, 1);
  assert.equal(result.counts.examples, 3);
});

test('reports parser errors with the file and exact source location', () => {
  const result = validate(feature(`${scenario}      | invalid | table |\n      | only one cell |`));
  assert.equal(result.diagnostics[0].code, 'gherkin-syntax');
  assert.equal(result.diagnostics[0].path, 'docs/acceptance/test.feature');
  assert.ok(result.diagnostics[0].line > 1);
  assert.ok(result.diagnostics[0].column >= 1);
});

test('requires a Then on each Scenario even if Background has one', () => {
  expectCode(feature(`  Background:\n    Then 前提の結果\n${scenario.replace('    Then Energy は 1\n', '')}`), 'then-missing');
});

test('requires Scenario tags directly rather than inheriting Feature or Rule tags', () => {
  const source = `@GR-001 @AC-TURN-001\nFeature: 親タグ\n  @IR-001\n  Rule: 親タグ\n${scenario.replace('  @GR-001 @AC-TURN-001\n', '')}`;
  const result = validate(source);
  assert.ok(codes(result).includes('requirement-tag-missing'));
  assert.ok(codes(result).includes('scenario-id-count'));
});

for (const tag of ['@GR-01', '@gr-001', '@IR_001', '@PER-0001']) {
  test(`rejects malformed requirement tag ${tag}`, () => {
    expectCode(feature(scenario.replace('@GR-001', tag)), 'requirement-tag-format');
  });
}

test('rejects unknown requirements even on a parent or Examples block', () => {
  expectCode(`@IR-999\n${feature()}`, 'requirement-unknown');
  expectCode(feature(scenario.replace('@GR-001', '@GR-999')), 'requirement-unknown');
  expectCode(feature(`${scenario.replace('Scenario:', 'Scenario Outline:')}    @PER-999\n    Examples:\n      | value |\n      | 1 |\n`), 'requirement-unknown');
});

test('does not restrict unrelated tags', () => {
  assert.deepEqual(validate(feature(scenario.replace('@GR-001', '@GR-001 @performance @ACME @integration'))).diagnostics, []);
});

test('detects duplicate requirement definitions across tables and documents', () => {
  const requirements = [
    { path: 'first.md', source: requirementSource },
    { path: 'second.md', source: '| ID | Requirement |\n| --- | --- |\n| GR-001 | duplicate |' },
  ];
  const result = validate(feature(), requirements);
  const diagnostic = result.diagnostics.find((item) => item.code === 'requirement-definition-duplicate');
  assert.equal(diagnostic.path, 'second.md');
  assert.equal(diagnostic.line, 3);
  assert.match(diagnostic.message, /first\.md:5/);
});

test('rejects a recognized definition table with a broken separator instead of silently hiding definitions', () => {
  const result = validate(feature(), [
    { path: 'valid.md', source: requirementSource },
    { path: 'broken.md', source: '| ID | Requirement |\n| -- invalid -- | --- |\n| GR-001 | duplicate |\n' },
  ]);
  assert.equal(result.diagnostics.length, 1);
  assert.deepEqual(result.diagnostics[0], {
    path: 'broken.md',
    line: 1,
    column: 1,
    code: 'requirement-table-format',
    message: 'ID | Requirement 定義表の区切り行が不正です。',
  });
});

test('ignores fenced example definition tables and rejects invalid definition IDs', () => {
  const source = `${requirementSource}\n~~~markdown\n| ID | Requirement |\n| --- | --- |\n| GR-001 | example |\n~~~\n`;
  assert.deepEqual(validate(feature(), [{ path: 'requirements.md', source }]).diagnostics, []);
  const invalid = validate(feature(), [{ path: 'requirements.md', source: requirementSource.replace('| IR-001 |', '| IR-01 |') }]);
  assert.ok(codes(invalid).includes('requirement-definition-format'));
});

test('requires definition tables and Feature files', () => {
  const result = validateSpecifications({ requirements: [], features: [] });
  assert.deepEqual(codes(result), ['requirements-empty', 'features-empty']);
});

test('accepts Scenario IDs for capabilities beyond the initial three Features', () => {
  const capabilities = ['DECK', 'MULLIGAN', 'RESOURCE', 'OTHER', 'A', 'SETUP2', 'DECK-V2'];
  const body = capabilities.map((capability) => scenario.replace('@AC-TURN-001', `@AC-${capability}-001`)).join('');
  const result = validate(feature(body));
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.counts.scenarios, capabilities.length);
  assert.equal(result.counts.examples, capabilities.length);
});

for (const tag of [
  '@AC-TURN-01',
  '@AC-DECK-000',
  '@ac-turn-001',
  '@AC-deck-001',
  '@AC--001',
  '@AC-DECK-0001',
  '@AC-2DECK-001',
  '@AC-DECK_SETUP-001',
]) {
  test(`rejects malformed Scenario ID ${tag}`, () => {
    expectCode(feature(scenario.replace('@AC-TURN-001', tag)), 'scenario-id-format');
  });
}

test('requires exactly one Scenario ID', () => {
  expectCode(feature(scenario.replace('@AC-TURN-001', '')), 'scenario-id-count');
  expectCode(feature(scenario.replace('@AC-TURN-001', '@AC-DECK-001 @AC-RESOURCE-001')), 'scenario-id-count');
});

test('detects duplicate Scenario IDs in the same file and across files', () => {
  const deckScenario = scenario.replace('@AC-TURN-001', '@AC-DECK-001');
  expectCode(feature(`${deckScenario}${deckScenario}`), 'scenario-id-duplicate');
  const result = validateSpecifications({
    requirements: [{ path: 'requirements.md', source: requirementSource }],
    features: [{ path: 'a.feature', source: feature(deckScenario) }, { path: 'nested/b.feature', source: feature(deckScenario) }],
  });
  const diagnostic = result.diagnostics.find((item) => item.code === 'scenario-id-duplicate');
  assert.equal(diagnostic.path, 'nested/b.feature');
  assert.match(diagnostic.message, /a\.feature:2/);
});

test('rejects empty source and Features with only descriptions or backgrounds', () => {
  expectCode('# comment only', 'feature-missing');
  expectCode('Feature: 空\n  説明だけ', 'feature-empty');
  expectCode('Feature: 空\n  Background:\n    Given 前提だけ', 'feature-empty');
});

test('requires every Outline Examples block to have a header and body', () => {
  const outline = scenario.replace('Scenario:', 'Scenario Outline:');
  expectCode(feature(outline), 'examples-missing');
  expectCode(feature(`${outline}    Examples:\n`), 'examples-empty');
  expectCode(feature(`${outline}    Examples:\n      | value |\n`), 'examples-empty');
  expectCode(feature(`${outline}    Examples: 正常\n      | value |\n      | 1 |\n    Examples: 空\n      | value |\n`), 'examples-empty');
});

test('requires placeholder columns for outline names, steps, doc strings, tables, and inherited backgrounds', () => {
  const result = validate(feature(`  Background:
    Given <background> の状態
  @GR-001 @AC-TURN-001
  Scenario Outline: <name> の例
    Given 値 <step>
      | value |
      | <table> |
    When テキストを読む
      """
      <document>
      """
    Then 値を保持する
    Examples:
      | other |
      | 1 |
`));
  const diagnostics = result.diagnostics.filter((item) => item.code === 'examples-parameter-missing');
  assert.equal(diagnostics.length, 5);
  for (const name of ['background', 'name', 'step', 'table', 'document']) {
    assert.ok(diagnostics.some((item) => item.message.includes(`<${name}>`)));
  }
});

test('rejects duplicate Examples columns', () => {
  expectCode(feature(`${scenario.replace('Scenario:', 'Scenario Outline:')}    Examples:\n      | value | value |\n      | 1 | 2 |\n`), 'examples-header-duplicate');
});

test('CLI recursively reads source files, returns status, and prints source locations', async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), 'card-game-spec-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'docs/requirements'), { recursive: true });
  await mkdir(path.join(root, 'docs/acceptance/nested'), { recursive: true });
  await writeFile(path.join(root, 'docs/requirements/requirements.md'), requirementSource);
  const featurePath = path.join(root, 'docs/acceptance/nested/turn.feature');
  await writeFile(featurePath, feature());
  const script = fileURLToPath(new URL('../scripts/check-spec.mjs', import.meta.url));
  const run = () => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  const success = run();
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /仕様検証成功: 1 Feature \/ 1 Scenario \/ 1 展開例/);
  assert.match(success.stdout, /ゲーム動作の受入テストは未実行/);
  await writeFile(featurePath, feature(scenario.replace('@GR-001', '@GR-999')));
  const failure = run();
  assert.equal(failure.status, 1);
  assert.match(failure.stderr, /docs\/acceptance\/nested\/turn\.feature:2:3: \[requirement-unknown\]/);
});
