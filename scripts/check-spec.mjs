import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateMessages } from '@cucumber/gherkin';
import { IdGenerator, SourceMediaType } from '@cucumber/messages';

const requirementId = /^(GR|IR|PER)-\d{3}$/;
const requirementTag = /^@(GR|IR|PER)-\d{3}$/;
const scenarioTag = /^@AC-(TURN|AR|ATK)-(?!000)\d{3}$/;
const isRequirementTag = (name) => /^@(GR|IR|PER)(?:[^a-z]|$)/i.test(name);
const isScenarioTag = (name) => /^@AC(?:[^a-z]|$)/i.test(name);

/** Validate in-memory documents without touching the repository or executing steps. */
export function validateSpecifications({ requirements, features }) {
  const diagnostics = [];
  const registry = new Map();
  const scenarioIds = new Map();
  const counts = { requirements: 0, features: 0, scenarios: 0, examples: 0 };
  const report = (file, location, code, message) => diagnostics.push({
    path: file,
    line: location?.line ?? 1,
    column: location?.column ?? 1,
    code,
    message,
  });

  for (const document of requirements) {
    const lines = document.source.split(/\r?\n/);
    let inDefinitions = false;
    let fence;
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const marker = line.trim().match(/^(`{3,}|~{3,})/);
      if (marker) {
        if (!fence) fence = marker[1];
        else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
        inDefinitions = false;
        continue;
      }
      if (fence) continue;
      if (!line.trim().startsWith('|')) {
        inDefinitions = false;
        continue;
      }
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
      if (cells[0] === 'ID' && cells[1] === 'Requirement') {
        const separator = lines[index + 1]?.trim().replace(/^\||\|$/g, '').split('|');
        inDefinitions = separator?.length >= 2 && separator.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
        if (inDefinitions) index += 1;
        else report(document.path, { line: index + 1 }, 'requirement-table-format', 'ID | Requirement 定義表の区切り行が不正です。');
        continue;
      }
      if (!inDefinitions) continue;
      const id = cells[0];
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
  if (registry.size === 0) report('docs/requirements', null, 'requirements-empty', 'ID | Requirement 定義表に要求がありません。');
  if (features.length === 0) report('docs/acceptance', null, 'features-empty', '.feature ファイルがありません。');

  const checkTags = (file, tags) => {
    for (const tag of tags) {
      if (isRequirementTag(tag.name)) {
        if (!requirementTag.test(tag.name)) {
          report(file, tag.location, 'requirement-tag-format', `要求タグの形式が不正です: ${tag.name}`);
        } else if (!registry.has(tag.name.slice(1))) {
          report(file, tag.location, 'requirement-unknown', `要求の定義がありません: ${tag.name}`);
        }
      }
      if (isScenarioTag(tag.name) && !scenarioTag.test(tag.name)) {
        report(file, tag.location, 'scenario-id-format', `Scenario IDの形式が不正です: ${tag.name}`);
      }
    }
  };

  for (const document of features) {
    const envelopes = generateMessages(document.source, document.path, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN, {
      newId: IdGenerator.incrementing(),
      includeSource: false,
      includeGherkinDocument: true,
      includePickles: true,
    });
    const errors = envelopes.filter((envelope) => envelope.parseError);
    for (const { parseError } of errors) report(document.path, parseError.source.location, 'gherkin-syntax', parseError.message);
    if (errors.length > 0) continue;
    const feature = envelopes.find((envelope) => envelope.gherkinDocument)?.gherkinDocument.feature;
    if (!feature) {
      report(document.path, null, 'feature-missing', 'Feature がありません。');
      continue;
    }
    counts.features += 1;
    counts.examples += envelopes.filter((envelope) => envelope.pickle).length;
    const before = counts.scenarios;

    const visit = (container, inheritedSteps = []) => {
      checkTags(document.path, container.tags);
      const backgroundSteps = [...inheritedSteps, ...container.children.flatMap((child) => child.background?.steps ?? [])];
      for (const child of container.children) {
        if (child.rule) {
          visit(child.rule, backgroundSteps);
          continue;
        }
        if (!child.scenario) continue;
        const scenario = child.scenario;
        counts.scenarios += 1;
        checkTags(document.path, scenario.tags);
        if (!scenario.tags.some((tag) => requirementTag.test(tag.name))) {
          report(document.path, scenario.location, 'requirement-tag-missing', 'Scenario自身に要求タグ（@GR-001 / @IR-001 / @PER-001 形式）が必要です。');
        }
        const ids = scenario.tags.filter((tag) => scenarioTag.test(tag.name));
        if (ids.length !== 1) {
          report(document.path, scenario.location, 'scenario-id-count', 'Scenario自身に有効なScenario IDがちょうど1つ必要です。');
        }
        for (const id of ids) {
          const first = scenarioIds.get(id.name);
          if (first) {
            report(document.path, id.location, 'scenario-id-duplicate', `${id.name} が重複しています（最初の定義: ${first.path}:${first.line}）。`);
          } else {
            scenarioIds.set(id.name, { path: document.path, line: id.location.line });
          }
        }
        if (!scenario.steps.some((step) => step.keyword.trim() === 'Then')) {
          report(document.path, scenario.location, 'then-missing', 'Scenario自身に期待結果を示す Then が必要です。');
        }

        const isOutline = /^(Scenario Outline|Scenario Template)$/.test(scenario.keyword) || scenario.examples.length > 0;
        if (!isOutline) continue;
        if (scenario.examples.length === 0) {
          report(document.path, scenario.location, 'examples-missing', 'Scenario Outline に Examples が必要です。');
        }
        const texts = [scenario.name];
        for (const step of [...backgroundSteps, ...scenario.steps]) {
          texts.push(step.text, step.docString?.content ?? '', step.docString?.mediaType ?? '');
          for (const row of step.dataTable?.rows ?? []) texts.push(...row.cells.map((cell) => cell.value));
        }
        const parameters = new Set(texts.flatMap((value) => [...value.matchAll(/<([^<>]+)>/g)].map((match) => match[1])));
        for (const examples of scenario.examples) {
          checkTags(document.path, examples.tags);
          if (!examples.tableHeader || examples.tableBody.length === 0) {
            report(document.path, examples.location, 'examples-empty', 'Examples に見出しと1行以上の実例が必要です。');
          }
          const headers = examples.tableHeader?.cells.map((cell) => cell.value) ?? [];
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
    if (counts.scenarios === before) report(document.path, feature.location, 'feature-empty', 'Feature に Scenario / Scenario Outline がありません。');
  }
  return { diagnostics, counts };
}

async function readDocuments(root, directory, extension) {
  const documents = [];
  async function walk(relative) {
    let entries;
    try {
      entries = await readdir(path.join(root, relative), { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && file.endsWith(extension)) {
        documents.push({ path: file, source: await readFile(path.join(root, file), 'utf8') });
      }
    }
  }
  await walk(directory);
  return documents;
}

export async function main(root = process.cwd()) {
  try {
    const [requirements, features] = await Promise.all([
      readDocuments(root, 'docs/requirements', '.md'),
      readDocuments(root, 'docs/acceptance', '.feature'),
    ]);
    const { diagnostics, counts } = validateSpecifications({ requirements, features });
    if (diagnostics.length > 0) {
      for (const diagnostic of diagnostics) {
        console.error(`${diagnostic.path}:${diagnostic.line}:${diagnostic.column}: [${diagnostic.code}] ${diagnostic.message}`);
      }
      console.error(`仕様検証失敗: ${diagnostics.length} 件`);
      return 1;
    }
    console.log(`仕様検証成功: ${counts.features} Feature / ${counts.scenarios} Scenario / ${counts.examples} 展開例 / ${counts.requirements} 要求定義（ゲーム動作の受入テストは未実行）`);
    return 0;
  } catch (error) {
    console.error(`${error.path ?? root}:1:1: [spec-read-error] ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = await main();
}
