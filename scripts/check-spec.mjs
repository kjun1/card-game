/**
 * `npm run check:spec` で実行する、仕様文書の検証スクリプト。
 * Gherkin の構文と、このリポジトリの要求タグ・Scenario ID 規約を確認する。
 * Given / When / Then のゲーム処理や、日本語で書いた期待結果の正しさは検証しない。
 *
 * 全体の流れを読むときは、末尾近くの main() からたどると分かりやすい。
 *   main()                   : 文書を読み、検証結果を表示して終了コードを返す。
 *   readDocuments()          : 指定フォルダー以下のファイルを文字列として読む。
 *   validateSpecifications() : 文字列を検証し、違反一覧と集計を返す。
 *
 * ファイル操作と検証を分けることで、テストでは短い文字列だけを渡して検証できる。
 */

// node: で始まるものは Node.js の標準機能。Cucumber の2つは npm で導入する依存。
// fs/promises は、ファイルの読み取り完了を await で待てる API を提供する。
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateMessages } from '@cucumber/gherkin';
import { IdGenerator, SourceMediaType } from '@cucumber/messages';

// /.../ は正規表現。^ と $ で文字列全体、\d{3} で数字3桁を指定する。
// 要求表には GR-001、Gherkin のタグには @GR-001 のように書くため、別々に定義する。
const requirementId = /^(GR|IR|PER)-\d{3}$/;
const requirementTag = /^@(GR|IR|PER)-\d{3}$/;
// Capability は英大文字で始まり、続きは英大文字・数字・ハイフンを許可する。
// (?!000) は「ここから先が 000 ではない」という条件。番号は 001〜999 になる。
const scenarioTag = /^@AC-[A-Z][A-Z0-9-]*-(?!000)\d{3}$/;

// 以下の2つは「正しいタグか」ではなく「検証対象のタグらしいか」を調べる関数。
// (name) => 式 は、引数 name を受け取って式の結果を返す短い関数の書き方。
// i は大文字・小文字を区別しない指定。@gr-001 なども拾い、上の厳密な形式で拒否する。
// 一方、@integration や @ACME など、別用途のタグは検証対象に含めない。
const isRequirementTag = (name) => /^@(GR|IR|PER)(?:[^a-z]|$)/i.test(name);
const isScenarioTag = (name) => /^@AC(?:[^a-z]|$)/i.test(name);

/**
 * 読み取り済みの要求文書と Feature を検証する。ファイルの読み書きは行わない。
 *
 * 引数は { requirements, features } という1つのオブジェクト。
 * どちらも [{ path: 'ファイル名', source: '文書の全文' }, ...] という配列で渡す。
 * 関数の引数にある { requirements, features } は、この2項目を取り出す「分割代入」。
 *
 * 戻り値の diagnostics は違反の配列（空なら成功）、counts は文書・例などの件数。
 * 違反には path / line / column と、種別を表す code、説明文の message を含める。
 * 最初の違反で止めず、分かる範囲をまとめて報告して修正しやすくする。
 */
export function validateSpecifications({ requirements, features }) {
  const diagnostics = [];
  // Map は「キー → 値」を記録する入れ物。ID → 最初の定義位置を保存する。
  // 全ファイルで同じ Map を使うため、別ファイルにある ID の重複も検出できる。
  const registry = new Map();
  const scenarioIds = new Map();
  const counts = { requirements: 0, features: 0, scenarios: 0, examples: 0 };

  // 違反を共通の形式にそろえて追加する。
  // ?. は location がない場合も安全に項目を読み、?? は値が null / undefined のとき
  // 右側の値を使う。位置が分からない違反は、ファイルの1行目・1列目として表示する。
  const report = (file, location, code, message) => {
    diagnostics.push({
      path: file,
      line: location?.line ?? 1,
      column: location?.column ?? 1,
      code,
      message,
    });
  };

  // 1. 要求文書の「ID | Requirement」定義表から、参照可能な要求 ID を集める。
  // 文書中の ID をすべて検索すると、対応表での参照まで重複定義と誤認してしまう。
  for (const document of requirements) {
    // Unix の改行 LF と Windows の改行 CRLF の両方で、1行ずつに分ける。
    const lines = document.source.split(/\r?\n/);
    let inDefinitions = false;
    // fence はコードブロック開始時の ``` や ~~~ を保持する。未設定なら本文の中。
    let fence;
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const marker = line.trim().match(/^(`{3,}|~{3,})/);
      if (marker) {
        // コード例の表は正式な要求定義として数えない。
        // match の [0] は一致全体、[1] は最初の丸括弧で取り出した文字列。
        if (!fence) {
          fence = marker[1];
        } else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) {
          fence = undefined;
        }
        inDefinitions = false;
        continue;
      }
      // continue は、この行の処理を終えて次の行へ進む。
      if (fence) {
        continue;
      }
      if (!line.trim().startsWith('|')) {
        inDefinitions = false;
        continue;
      }

      // 「| GR-001 | 説明 |」から、前後の | と空白を除き ['GR-001', '説明'] を作る。
      // map は配列の各要素を変換し、その結果を新しい配列にする。
      const cells = line.trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim());
      if (cells[0] === 'ID' && cells[1] === 'Requirement') {
        // 表の見出しに続く「| --- | --- |」を確認する。:--- や ---: も許可する。
        // every は、すべての列が条件を満たすときだけ true を返す。
        const separator = lines[index + 1]?.trim().replace(/^\||\|$/g, '').split('|');
        inDefinitions = separator?.length >= 2 && separator.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
        if (inDefinitions) {
          index += 1; // 区切り行は確認済みなので、次の繰り返しでは定義行から読む。
        } else {
          report(document.path, { line: index + 1 }, 'requirement-table-format', 'ID | Requirement 定義表の区切り行が不正です。');
        }
        continue;
      }
      if (!inDefinitions) {
        continue;
      }
      const id = cells[0];
      // JavaScript の配列・文字位置は0始まり、表示する行・列番号は1始まり。
      const location = { line: index + 1, column: line.indexOf(id) + 1 };
      if (!requirementId.test(id)) {
        report(document.path, location, 'requirement-definition-format', `要求IDの形式が不正です: ${id}`);
      } else if (registry.has(id)) {
        const first = registry.get(id);
        report(document.path, location, 'requirement-definition-duplicate', `要求 ${id} が重複しています（最初の定義: ${first.path}:${first.line}）。`);
      } else {
        registry.set(id, { path: document.path, line: location.line });
      }
    }
  }
  counts.requirements = registry.size;
  if (registry.size === 0) {
    report('docs/requirements', null, 'requirements-empty', 'ID | Requirement 定義表に要求がありません。');
  }
  if (features.length === 0) {
    report('docs/acceptance', null, 'features-empty', '.feature ファイルがありません。');
  }

  // 2. タグの形式と要求の実在を調べる共通処理を用意する。
  // Feature / Rule / Scenario / Examples のどこに書いたタグでも、誤りを見逃さない。
  // 「Scenario 自身に必要なタグがあるか」は、後で別途確認する。
  const checkTags = (file, tags) => {
    for (const tag of tags) {
      if (isRequirementTag(tag.name)) {
        if (!requirementTag.test(tag.name)) {
          report(file, tag.location, 'requirement-tag-format', `要求タグの形式が不正です: ${tag.name}`);
        } else if (!registry.has(tag.name.slice(1))) {
          // slice(1) で先頭の @ を除き、要求表の ID と照合する。
          report(file, tag.location, 'requirement-unknown', `要求の定義がありません: ${tag.name}`);
        }
      }
      if (isScenarioTag(tag.name) && !scenarioTag.test(tag.name)) {
        report(file, tag.location, 'scenario-id-format', `Scenario IDの形式が不正です: ${tag.name}`);
      }
    }
  };

  // 3. 各 Feature を公式パーサーで読み、その構造に沿って検証する。
  for (const document of features) {
    // generateMessages は複数種類の結果を、envelope（メッセージの入れ物）の配列で返す。
    // gherkinDocument は元の Feature / Rule / Scenario の構造を持つ解析結果。
    // pickle は実行用に展開した例。通常の Scenario は1件、Outline は Examples の
    // 各行につき1件になる。ここでは生成するだけで、ゲーム処理は実行しない。
    const envelopes = generateMessages(document.source, document.path, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN, {
      // パーサー内部の ID。文書に手書きする @AC-... の Scenario ID とは別物。
      newId: IdGenerator.incrementing(),
      includeSource: false,
      includeGherkinDocument: true,
      includePickles: true,
    });
    // filter は条件に合う要素だけを残す。構文エラーがある文書は構造を信用できないため、
    // エラーを報告して次のファイルへ進む。他の Feature の検証は続ける。
    const errors = envelopes.filter((envelope) => envelope.parseError);
    for (const { parseError } of errors) {
      report(document.path, parseError.source.location, 'gherkin-syntax', parseError.message);
    }
    if (errors.length > 0) {
      continue;
    }
    // find は条件に合う最初の要素を返す。空文書やコメントだけの文書には Feature がない。
    const feature = envelopes.find((envelope) => envelope.gherkinDocument)?.gherkinDocument.feature;
    if (!feature) {
      report(document.path, null, 'feature-missing', 'Feature がありません。');
      continue;
    }
    counts.features += 1;
    counts.examples += envelopes.filter((envelope) => envelope.pickle).length;
    const scenariosBeforeFeature = counts.scenarios;

    // Feature と、その中の Rule は、どちらも子要素 children を持つ。
    // 同じ関数で両方を読むため、Rule を見つけたら visit() 自身を呼ぶ（再帰）。
    // inheritedSteps は親の Background。引数を省略した最初の呼び出しでは [] になる。
    const visit = (container, inheritedSteps = []) => {
      checkTags(document.path, container.tags);
      // flatMap は各要素から得た配列を1つにつなぐ。... は配列の中身を展開する記法。
      // 親と現在の Background を合わせ、Outline の置換変数を後で漏れなく検証する。
      const ownBackgroundSteps = container.children.flatMap((child) => child.background?.steps ?? []);
      const backgroundSteps = [...inheritedSteps, ...ownBackgroundSteps];
      for (const child of container.children) {
        if (child.rule) {
          visit(child.rule, backgroundSteps);
          continue;
        }
        if (!child.scenario) {
          continue;
        }
        const scenario = child.scenario;
        counts.scenarios += 1;
        checkTags(document.path, scenario.tags);
        // some は1つでも条件を満たすと true。親のタグを合流させず、Scenario 自身を見る。
        // これにより、各 Scenario から要求と ID を直接たどれる状態を保つ。
        if (!scenario.tags.some((tag) => requirementTag.test(tag.name))) {
          report(document.path, scenario.location, 'requirement-tag-missing', 'Scenario自身に要求タグ（@GR-001 / @IR-001 / @PER-001 形式）が必要です。');
        }
        const ids = scenario.tags.filter((tag) => scenarioTag.test(tag.name));
        if (ids.length !== 1) {
          report(document.path, scenario.location, 'scenario-id-count', 'Scenario自身に有効なScenario IDがちょうど1つ必要です。');
        }
        // ID の重複は元の Scenario 単位で調べる。展開後の pickle を使うと、
        // Outline の複数行が同じ Scenario ID を持つことまで重複と誤認してしまう。
        for (const id of ids) {
          const first = scenarioIds.get(id.name);
          if (first) {
            report(document.path, id.location, 'scenario-id-duplicate', `${id.name} が重複しています（最初の定義: ${first.path}:${first.line}）。`);
          } else {
            scenarioIds.set(id.name, { path: document.path, line: id.location.line });
          }
        }
        // 規約は英語キーワード。Background の Then や Scenario 内の And だけでは、
        // その Scenario が確認する期待結果を明示したことにはしない。
        if (!scenario.steps.some((step) => step.keyword.trim() === 'Then')) {
          report(document.path, scenario.location, 'then-missing', 'Scenario自身に期待結果を示す Then が必要です。');
        }

        // Scenario Template も Gherkin で使える Outline の別名。
        // Examples がある場合もここで扱い、各表にデータと必要な列があるか確認する。
        const isOutline = /^(Scenario Outline|Scenario Template)$/.test(scenario.keyword) || scenario.examples.length > 0;
        if (!isOutline) {
          continue;
        }
        if (scenario.examples.length === 0) {
          report(document.path, scenario.location, 'examples-missing', 'Scenario Outline に Examples が必要です。');
        }
        // <energy> のような置換変数は Step 本文以外にも書けるため、名前、Background、
        // DocString（複数行テキスト）、DataTable（Step に添えた表）も集める。
        const texts = [scenario.name];
        for (const step of [...backgroundSteps, ...scenario.steps]) {
          texts.push(step.text, step.docString?.content ?? '', step.docString?.mediaType ?? '');
          for (const row of step.dataTable?.rows ?? []) {
            texts.push(...row.cells.map((cell) => cell.value));
          }
        }
        // matchAll は g 付き正規表現に一致する箇所をすべて返す。
        // 正規表現の丸括弧で <energy> の中の変数名 energy を取り出す。
        // Set は重複しない値の集合。同じ変数を何度使っても、
        // 「列がない」という違反は各 Examples で1件にまとめる。
        const parameters = new Set();
        for (const value of texts) {
          for (const match of value.matchAll(/<([^<>]+)>/g)) {
            parameters.add(match[1]);
          }
        }
        for (const examples of scenario.examples) {
          checkTags(document.path, examples.tags);
          if (!examples.tableHeader || examples.tableBody.length === 0) {
            report(document.path, examples.location, 'examples-empty', 'Examples に見出しと1行以上の実例が必要です。');
          }
          const headers = examples.tableHeader?.cells.map((cell) => cell.value) ?? [];
          // Set にすると同名の列が1つになるため、元の列数との差で重複を見つけられる。
          if (new Set(headers).size !== headers.length) {
            report(document.path, examples.tableHeader.location, 'examples-header-duplicate', 'Examples の列名が重複しています。');
          }
          for (const parameter of parameters) {
            if (!headers.includes(parameter)) {
              report(document.path, examples.location, 'examples-parameter-missing', `Examples に <${parameter}> の列がありません。`);
            }
          }
        }
      }
    };
    visit(feature);
    // この Feature を読む前後で件数が増えていなければ、実際の Scenario がない。
    if (counts.scenarios === scenariosBeforeFeature) {
      report(document.path, feature.location, 'feature-empty', 'Feature に Scenario / Scenario Outline がありません。');
    }
  }
  return { diagnostics, counts };
}

/**
 * root を基準に directory 以下を再帰的に読み、指定拡張子の文書を返す。
 * 例: readDocuments(root, 'docs/acceptance', '.feature')
 * 戻り値は validateSpecifications() にそのまま渡せる { path, source } の配列。
 * path は表示用の相対パス、source は UTF-8 として読み取った全文になる。
 */
async function readDocuments(root, directory, extension) {
  const documents = [];
  async function walk(relative) {
    let entries;
    try {
      // await は読み取りの完了を待つ。withFileTypes により、名前だけでなく
      // 「フォルダーかファイルか」を判別できる情報も受け取る。
      entries = await readdir(path.join(root, relative), { withFileTypes: true });
    } catch (error) {
      // 対象が存在しない場合は文書0件として扱い、検証側の「文書なし」で報告する。
      // 権限不足など、ほかの読み取りエラーは握りつぶさず main() へ渡す。
      if (error.code === 'ENOENT') {
        return;
      }
      throw error;
    }
    // 読み取り順を名前でそろえ、「最初の定義」と違反の表示順を安定させる。
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        await walk(file);
      } else if (entry.isFile() && file.endsWith(extension)) {
        documents.push({ path: file, source: await readFile(path.join(root, file), 'utf8') });
      }
    }
  }
  await walk(directory);
  return documents;
}

/**
 * コマンド実行の入口。root を省略するとコマンドを実行したフォルダーを基準にする。
 * async 関数なので、呼び出し側は await main() で結果を受け取る。
 * 終了コードは 0 = 成功、1 = 失敗。CI もこの値で成功・失敗を判断する。
 */
export async function main(root = process.cwd()) {
  try {
    // 2種類の文書は独立して読めるため同時に開始し、Promise.all で両方の完了を待つ。
    // [requirements, features] は配列の分割代入。結果は完了順ではなく、渡した順に並ぶ。
    const [requirements, features] = await Promise.all([
      readDocuments(root, 'docs/requirements', '.md'),
      readDocuments(root, 'docs/acceptance', '.feature'),
    ]);
    const { diagnostics, counts } = validateSpecifications({ requirements, features });
    if (diagnostics.length > 0) {
      for (const diagnostic of diagnostics) {
        // console.error は標準エラー出力。ファイル:行:列を付けて修正箇所を示す。
        // バッククォートで囲む文字列では、${...} の値を文字列へ埋め込める。
        console.error(`${diagnostic.path}:${diagnostic.line}:${diagnostic.column}: [${diagnostic.code}] ${diagnostic.message}`);
      }
      console.error(`仕様検証失敗: ${diagnostics.length} 件`);
      return 1;
    }
    console.log(`仕様検証成功: ${counts.features} Feature / ${counts.scenarios} Scenario / ${counts.examples} 展開例 / ${counts.requirements} 要求定義（ゲーム動作の受入テストは未実行）`);
    return 0;
  } catch (error) {
    // 読み取りなどで例外が起きた場合も、成功扱いにせず場所と理由を報告する。
    console.error(`${error.path ?? root}:1:1: [spec-read-error] ${error.message}`);
    return 1;
  }
}

// import.meta.url はこのファイル自身の URL、process.argv[1] は直接実行されたファイル。
// 両者をパスにして比較し、「node scripts/check-spec.mjs」のときだけ main() を呼ぶ。
// テストから import しただけでは、リポジトリの読み取りや結果表示を始めない。
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // process.exit() で即終了させず、出力を終えてから指定の終了コードで終了する。
  process.exitCode = await main();
}
