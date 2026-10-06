/**
 * 仕様検証器そのもののテスト。ゲームの操作や勝敗判定は実行しない。
 *
 * 基本の流れは「検証用の文書を作る → 検証器に渡す → 結果を確認する」。
 * 最初に正常な文書を用意し、不正な箇所だけを書き換えて、意図した違反を
 * 検出できるか調べる。最後の CLI テストだけは一時ファイルと別プロセスを使い、
 * コマンドとして起動した場合の読み込み・表示・終了コードまで確認する。
 *
 * test('説明', () => { ... }) は、名前を付けてテストを登録する Node.js 標準機能。
 * 「() => { ... }」は、test 側が後で呼び出す関数（アロー関数）を表している。
 * assert は期待と結果が違うとテストを失敗させる。主に次の種類を使う。
 * - equal(実際, 期待): 数値や文字列などの値を厳密に比較する。
 * - deepEqual(実際, 期待): 配列やオブジェクトの中身まで比較する。
 * - ok(条件): 条件を真と評価できることを確認する（true 以外の真と扱う値も許可）。
 * - match(文字列, 正規表現): メッセージが指定したパターンを含むか確認する。
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateSpecifications } from '../../scripts/check-spec.mjs';

// 共通の検証用データ。バッククォートで囲むと、改行を含む文字列を書ける。
// 定義表には 3 件の要求があり、その下の対応表は同じ要求を参照している。
// この参照を「要求の重複定義」と誤判定しないことも、正常系で確認する。
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

// Scenario の本文に Feature の見出しを付け、文書全体の文字列を返す。
// 「body = scenario」は、引数を省略したときに共通の正常な Scenario を使う指定。
// 「${body}」は文字列への値の埋め込み、「\n」は改行を表す。
const feature = (body = scenario) => {
  return `Feature: 検証用の仕様\n${body}`;
};

// Feature の文字列を検証し、{ diagnostics: 違反の配列, counts: 件数 } を返す。
// requirements を省略した場合は共通の要求定義を使う。
// ここで渡す path は報告用の名前であり、実際のファイルは読み書きしない。
const validate = (
  source,
  requirements = [{ path: 'docs/requirements/test.md', source: requirementSource }],
) => {
  return validateSpecifications({
    requirements,
    // 「source」だけの記述は「source: source」の省略形。
    features: [{ path: 'docs/acceptance/test.feature', source }],
  });
};

// map は、配列の各要素を変換して新しい配列を返す。
// 場所や説明文を含む違反の一覧から、判定に使うコードだけを取り出す。
const codes = (result) => {
  return result.diagnostics.map((diagnostic) => diagnostic.code);
};

// 不正な Feature を渡し、期待する違反コードが含まれることを確認する。
// 同じ入力が複数の規約に違反してもよいので、違反の全件一致は求めない。
const expectCode = (source, code) => {
  const actualCodes = codes(validate(source));
  assert.ok(actualCodes.includes(code), `違反コード ${code} が報告されること`);
};

// --- 正常系と Gherkin の基本的な構造 ---

test('Scenario の直接タグを要求定義と照合し、対応表の参照は定義に数えない', () => {
  const result = validate(feature());
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.counts, { requirements: 3, features: 1, scenarios: 1, examples: 1 });
});

test('Rule 内の Outline を展開し、Examples の各行を Scenario ID の重複と扱わない', () => {
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
  // Outline 自体は 1 件だが、実行用の具体例は Examples の合計 3 行分になる。
  assert.equal(result.counts.scenarios, 1);
  assert.equal(result.counts.examples, 3);
});

test('Gherkin の構文エラーにファイル名とソース上の位置を付ける', () => {
  // 表の列数を行ごとに変え、公式パーサーが検出する構文エラーを作る。
  const result = validate(feature(`${scenario}      | invalid | table |\n      | only one cell |`));
  assert.equal(result.diagnostics[0].code, 'gherkin-syntax');
  assert.equal(result.diagnostics[0].path, 'docs/acceptance/test.feature');
  assert.ok(result.diagnostics[0].line > 1);
  assert.ok(result.diagnostics[0].column >= 1);
});

test('Background に Then があっても、各 Scenario に Then を要求する', () => {
  expectCode(feature(`  Background:\n    Then 前提の結果\n${scenario.replace('    Then Energy は 1\n', '')}`), 'then-missing');
});

test('Feature や Rule のタグで代用せず、Scenario への直接タグを要求する', () => {
  const source = `@GR-001 @AC-TURN-001\nFeature: 親タグ\n  @IR-001\n  Rule: 親タグ\n${scenario.replace('  @GR-001 @AC-TURN-001\n', '')}`;
  const result = validate(source);
  assert.ok(codes(result).includes('requirement-tag-missing'));
  assert.ok(codes(result).includes('scenario-id-count'));
});

// --- 要求タグと、参照先になる要求定義表 ---

// for...of は配列の要素を順に取り出す。ここでは不正なタグごとに
// 別々の test を登録し、失敗した場合にどの表記が原因か分かるようにする。
for (const tag of ['@GR-01', '@gr-001', '@IR_001', '@PER-0001']) {
  test(`要求タグの不正な形式 ${tag} を拒否する`, () => {
    // replace は元の文字列を変更せず、置き換え後の新しい文字列を返す。
    expectCode(feature(scenario.replace('@GR-001', tag)), 'requirement-tag-format');
  });
}

test('未定義の要求は Scenario だけでなく親要素や Examples のタグでも拒否する', () => {
  expectCode(`@IR-999\n${feature()}`, 'requirement-unknown');
  expectCode(feature(scenario.replace('@GR-001', '@GR-999')), 'requirement-unknown');
  expectCode(feature(`${scenario.replace('Scenario:', 'Scenario Outline:')}    @PER-999\n    Examples:\n      | value |\n      | 1 |\n`), 'requirement-unknown');
});

test('要求 ID や Scenario ID と無関係なタグは制限しない', () => {
  assert.deepEqual(validate(feature(scenario.replace('@GR-001', '@GR-001 @performance @ACME @integration'))).diagnostics, []);
});

test('別の定義表や文書にある要求定義の重複を検出する', () => {
  const requirements = [
    { path: 'first.md', source: requirementSource },
    { path: 'second.md', source: '| ID | Requirement |\n| --- | --- |\n| GR-001 | duplicate |' },
  ];
  const result = validate(feature(), requirements);
  // find は条件を満たす最初の要素を返す。後から見つかった定義の場所を報告し、
  // 説明文には最初の定義の場所も載せることで、両方を確認できるようにする。
  const diagnostic = result.diagnostics.find((item) => item.code === 'requirement-definition-duplicate');
  assert.equal(diagnostic.path, 'second.md');
  assert.equal(diagnostic.line, 3);
  assert.match(diagnostic.message, /first\.md:5/);
});

test('要求定義表の区切り行が壊れている場合は、読み飛ばさず違反を報告する', () => {
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

test('コードブロック内の定義表は無視し、実際の定義表では ID の形式を検証する', () => {
  // ~~~ で囲んだ Markdown は説明用のコードブロック。ここにある ID は定義に数えない。
  const source = `${requirementSource}\n~~~markdown\n| ID | Requirement |\n| --- | --- |\n| GR-001 | example |\n~~~\n`;
  assert.deepEqual(validate(feature(), [{ path: 'requirements.md', source }]).diagnostics, []);
  const invalid = validate(feature(), [{ path: 'requirements.md', source: requirementSource.replace('| IR-001 |', '| IR-01 |') }]);
  assert.ok(codes(invalid).includes('requirement-definition-format'));
});

test('要求定義と Feature がどちらも存在しない場合は、それぞれの不足を報告する', () => {
  const result = validateSpecifications({ requirements: [], features: [] });
  assert.deepEqual(codes(result), ['requirements-empty', 'features-empty']);
});

// --- Scenario ID の形式、一意性、将来の Capability 追加 ---

test('初期の 3 Feature 以外の Capability 名でも Scenario ID を受け入れる', () => {
  const capabilities = ['DECK', 'MULLIGAN', 'RESOURCE', 'OTHER', 'A', 'SETUP2', 'DECK-V2'];
  // Capability ごとの Scenario を作り、join('') で 1 つの Feature 本文に連結する。
  // 末尾の番号がすべて 001 でも、Capability が違えば別の ID になる。
  const body = capabilities
    .map((capability) => scenario.replace('@AC-TURN-001', `@AC-${capability}-001`))
    .join('');
  const result = validate(feature(body));
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.counts.scenarios, capabilities.length);
  assert.equal(result.counts.examples, capabilities.length);
});

for (const tag of [
  '@AC-TURN-01',       // 番号が 3 桁未満。
  '@AC-DECK-000',      // 000 は採番に使わない。
  '@ac-turn-001',      // 接頭辞は大文字の AC。
  '@AC-deck-001',      // Capability に小文字は使えない。
  '@AC--001',          // Capability が空。
  '@AC-DECK-0001',     // 番号が 3 桁を超える。
  '@AC-2DECK-001',     // Capability の先頭は英大文字。
  '@AC-DECK_SETUP-001', // 区切りにはハイフンを使い、アンダースコアは使わない。
]) {
  test(`Scenario ID の不正な形式 ${tag} を拒否する`, () => {
    expectCode(feature(scenario.replace('@AC-TURN-001', tag)), 'scenario-id-format');
  });
}

test('各 Scenario に ID をちょうど 1 個要求する', () => {
  expectCode(feature(scenario.replace('@AC-TURN-001', '')), 'scenario-id-count');
  expectCode(feature(scenario.replace('@AC-TURN-001', '@AC-DECK-001 @AC-RESOURCE-001')), 'scenario-id-count');
});

test('同じファイル内でも別ファイル間でも Scenario ID の重複を検出する', () => {
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

// --- 空の仕様と、Outline の具体例の不足 ---

test('コメントだけの文書と、説明や Background しかない Feature を拒否する', () => {
  expectCode('# comment only', 'feature-missing');
  expectCode('Feature: 空\n  説明だけ', 'feature-empty');
  expectCode('Feature: 空\n  Background:\n    Given 前提だけ', 'feature-empty');
});

test('Outline のすべての Examples に列見出しと実例の行を要求する', () => {
  // Examples 自体がない場合、空の場合、見出しだけの場合、
  // 正常な Examples の後に空の Examples がある場合をそれぞれ確認する。
  const outline = scenario.replace('Scenario:', 'Scenario Outline:');
  expectCode(feature(outline), 'examples-missing');
  expectCode(feature(`${outline}    Examples:\n`), 'examples-empty');
  expectCode(feature(`${outline}    Examples:\n      | value |\n`), 'examples-empty');
  expectCode(feature(`${outline}    Examples: 正常\n      | value |\n      | 1 |\n    Examples: 空\n      | value |\n`), 'examples-empty');
});

test('Outline の名前・ステップ・複数行文字列・表・Background の置換値に対応する列を要求する', () => {
  // <...> は Examples の値で置き換える箇所。5 箇所で使っている名前を
  // 列見出しに用意せず、それぞれの不足を個別に検出できるか調べる。
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
    // some は「条件を満たす要素が 1 つ以上あるか」を true / false で返す。
    assert.ok(diagnostics.some((item) => item.message.includes(`<${name}>`)));
  }
});

test('Examples の列見出しの重複を拒否する', () => {
  expectCode(feature(`${scenario.replace('Scenario:', 'Scenario Outline:')}    Examples:\n      | value | value |\n      | 1 | 2 |\n`), 'examples-header-duplicate');
});

// --- CLI（ターミナルから起動するコマンド）の入出力 ---

test('CLI が下位フォルダも読み、終了コードと違反の位置を返す', async (context) => {
  // async は非同期処理を含む関数、await はその処理の完了を待つ指定。
  // OS の一時領域に専用フォルダを作り、実際のリポジトリを変更せず検証する。
  const root = await mkdtemp(path.join(tmpdir(), 'card-game-spec-'));
  // after に片付け処理を登録しておくと、途中の assert が失敗しても削除される。
  // 削除対象は、このテスト自身が作った一時フォルダだけ。
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'docs/requirements'), { recursive: true });
  await mkdir(path.join(root, 'docs/acceptance/nested'), { recursive: true });
  await writeFile(path.join(root, 'docs/requirements/requirements.md'), requirementSource);
  const featurePath = path.join(root, 'docs/acceptance/nested/turn.feature');
  await writeFile(featurePath, feature());

  // import.meta.url はこのテストファイルの URL。そこを基準に検証器を見つけ、
  // fileURLToPath で Node.js の起動に渡せるファイルパスへ変換する。
  const script = fileURLToPath(new URL('../../scripts/check-spec.mjs', import.meta.url));
  const run = () => {
    // process.execPath はテストを実行している Node.js 本体のパス。
    // 同じ Node.js で別プロセスを起動し、spawnSync は終了まで待つ。
    // cwd は作業フォルダ、encoding は出力を文字列として受け取るための指定。
    return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  };

  // status は終了コード（0 が成功）。stdout は通常の表示、stderr はエラー出力。
  const success = run();
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /仕様検証成功: 1 Feature \/ 1 Scenario \/ 1 展開例/);
  assert.match(success.stdout, /ゲーム動作の受入テストは未実行/);

  // 同じ一時ファイルを不正な要求タグに書き換え、今度は失敗を確認する。
  await writeFile(featurePath, feature(scenario.replace('@GR-001', '@GR-999')));
  const failure = run();
  assert.equal(failure.status, 1);
  assert.match(failure.stderr, /docs\/acceptance\/nested\/turn\.feature:2:3: \[requirement-unknown\]/);
});
