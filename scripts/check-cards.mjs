/**
 * Card Definition の構造契約・静的意味と fixture を検証する。ゲーム動作は実行しない。
 * invalid fixture は、外部 manifest に記録した keyword / JSON Pointer でも照合する。
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import cardSchema from '../schemas/card.schema.json' with { type: 'json' };
import { validateCardSemantics } from './card-static-semantics.mjs';

const dialect = 'https://json-schema.org/draft/2020-12/schema';
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const defaultFixturesRoot = path.join(repositoryRoot, 'test/fixtures/card-definitions');
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** 新しい責任別配置と、--fixtures で指定する従来の配置を解決する。 */
function fixtureDirectories(fixturesRoot) {
  const structuralRoot = path.join(fixturesRoot, 'structural');
  if (fixturesRoot === defaultFixturesRoot || existsSync(structuralRoot)) {
    return { structuralRoot, staticSemanticRoot: path.join(fixturesRoot, 'static-semantic') };
  }
  // 従来の任意ルートは valid/・invalid/・semantic/ の契約を維持する。
  return { structuralRoot: fixturesRoot, staticSemanticRoot: path.join(fixturesRoot, 'semantic') };
}

/** Ajv のエラーを、ファイル名と JSON Pointer を含む診断へ変換する。 */
export function formatValidationErrors(file, errors) {
  return errors.map((error) => `${file}#${error.instancePath}: [${error.keyword}] ${error.message} ${JSON.stringify(error.params)}`);
}

/** Schema 自体を検証してからコンパイルする。入力データは変更しない。 */
export function createCardValidator(schema) {
  if (!isObject(schema) || schema.$schema !== dialect || schema.type !== 'object') {
    throw new Error(`Card Schema must declare $schema "${dialect}" and root type "object"`);
  }
  if (Object.hasOwn(schema, '$async')) {
    throw new Error('Card Schema does not support asynchronous validation');
  }
  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    validateSchema: true,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
  });
  if (!ajv.validateSchema(schema)) {
    throw new Error(formatValidationErrors('schema', ajv.errors).join('\n'));
  }
  // strict compile は未知の keyword や未解決の $ref も失敗させる。
  return ajv.compile(schema);
}

/**
 * 実際の Card Definition 集合の入口。構造不正があれば意味検証へ進まない。
 * カスタム Schema は追加の構造契約とし、現版 Card Schema を緩めて意味検証を
 * 迂回することはできない。diagnostic は入力の file / instancePath を保持する。
 */
export function createCardDefinitionValidator(schema = cardSchema) {
  const validators = [createCardValidator(cardSchema)];
  if (schema !== cardSchema) validators.push(createCardValidator(schema));
  return (documents) => {
    const errors = [];
    for (const { file, card, instancePath = '' } of documents) {
      for (const validate of validators) {
        if (!validate(card)) {
          errors.push(...validate.errors.map((error) => ({
            ...error, file, instancePath: `${instancePath}${error.instancePath}`,
          })));
          break;
        }
      }
    }
    return errors.length > 0 ? errors : validateCardSemantics(documents);
  };
}

function formatDefinitionErrors(errors) {
  return errors.flatMap((error) => formatValidationErrors(error.file, [error]));
}

async function readJson(file) {
  let source;
  try {
    source = await readFile(file, 'utf8');
  } catch (error) {
    throw new Error(`${file}#: [read] ${error.message}`);
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${file}#: [json] ${error.message}`);
  }
}

async function discoverJson(directory, errors) {
  const files = [];
  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      errors.push(`${current}#: [read] ${error.message}`);
      return;
    }
    for (const entry of entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(file);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(file);
      } else if (entry.isSymbolicLink()) {
        errors.push(`${file}#: [fixture-path] symbolic links are not fixture files or directories`);
      }
    }
  }
  await walk(directory);
  if (files.length === 0) {
    errors.push(`${directory}#: [empty-fixtures] at least one JSON fixture is required`);
  }
  return files;
}

function validateExpectations(expectations, manifest) {
  if (!isObject(expectations)) {
    throw new Error(`${manifest}#: [expectations] expected a filename-to-error object`);
  }
  for (const [file, expected] of Object.entries(expectations)) {
    const parts = file.split('/');
    if (!file.endsWith('.json') || file.includes('\\') || parts.some((part) => !part || part === '.' || part === '..')) {
      throw new Error(`${manifest}#: [expectations] invalid relative fixture path ${JSON.stringify(file)}`);
    }
    if (!isObject(expected)
      || typeof expected.keyword !== 'string' || expected.keyword.length === 0
      || typeof expected.instancePath !== 'string' || !/^(?:\/(?:[^~]|~[01])*)*$/.test(expected.instancePath)
      || Object.keys(expected).some((key) => !['keyword', 'instancePath', 'params'].includes(key))
      || (Object.hasOwn(expected, 'params') && !isObject(expected.params))) {
      throw new Error(`${manifest}#: [expectations] invalid error expectation for ${file}`);
    }
  }
}

function includesSubset(actual, expected) {
  if (isObject(expected)) {
    return isObject(actual) && Object.entries(expected).every(([key, value]) => Object.hasOwn(actual, key) && includesSubset(actual[key], value));
  }
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length && expected.every((value, index) => includesSubset(actual[index], value));
  }
  return actual === expected;
}

/**
 * Structural valid / invalid を再帰的に検証する。件数は成功した fixture の件数。
 * JSON parse / read error は「期待どおりの invalid」には数えない。
 * manifest のキーは invalid/ からの相対パス（区切りは /）。
 */
export async function checkCardFixtures({
  schemaPath = path.join(repositoryRoot, 'schemas/card.schema.json'),
  fixturesRoot = defaultFixturesRoot,
} = {}) {
  const { structuralRoot } = fixtureDirectories(fixturesRoot);
  const result = { validFiles: 0, invalidFiles: 0, errors: [] };
  let validate;
  try {
    validate = createCardValidator(await readJson(schemaPath));
  } catch (error) {
    result.errors.push(`${schemaPath}#: [schema] ${error.message}`);
    return result;
  }

  const manifest = path.join(structuralRoot, 'invalid-expectations.json');
  let expectations;
  try {
    expectations = await readJson(manifest);
    validateExpectations(expectations, manifest);
  } catch (error) {
    result.errors.push(error.message);
    return result;
  }

  const validFiles = await discoverJson(path.join(structuralRoot, 'valid'), result.errors);
  const invalidRoot = path.join(structuralRoot, 'invalid');
  const invalidFiles = await discoverJson(invalidRoot, result.errors);
  const invalidNames = new Set(invalidFiles.map((file) => path.relative(invalidRoot, file).split(path.sep).join('/')));
  for (const name of Object.keys(expectations).sort()) {
    if (!invalidNames.has(name)) {
      result.errors.push(`${manifest}#: [stale-expectation] no invalid fixture for ${name}`);
    }
  }

  for (const [category, files] of [['valid', validFiles], ['invalid', invalidFiles]]) {
    for (const file of files) {
      let card;
      try {
        card = await readJson(file);
      } catch (error) {
        result.errors.push(error.message);
        continue;
      }
      const accepted = validate(card);
      if (category === 'valid') {
        if (accepted) {
          result.validFiles += 1;
        } else {
          result.errors.push(...formatValidationErrors(file, validate.errors));
        }
        continue;
      }

      const name = path.relative(invalidRoot, file).split(path.sep).join('/');
      if (!Object.hasOwn(expectations, name)) {
        result.errors.push(`${file}#: [missing-expectation] add an intended error to ${manifest}`);
      } else if (accepted) {
        result.errors.push(`${file}#: [unexpected-valid] invalid fixture passed Schema validation`);
      } else {
        const expected = expectations[name];
        const matches = validate.errors.some((error) => error.keyword === expected.keyword
          && error.instancePath === expected.instancePath
          && (!expected.params || includesSubset(error.params, expected.params)));
        if (matches) {
          result.invalidFiles += 1;
        } else {
          result.errors.push(`${file}#${expected.instancePath}: [wrong-failure] expected ${JSON.stringify(expected)}`);
          result.errors.push(...formatValidationErrors(file, validate.errors));
        }
      }
    }
  }
  return result;
}

/**
 * Structural valid 全体を 1 定義集合として検証し、Static Semantic の各 JSON
 * 配列を独立した集合として検証する。静的意味 invalid は構造検証を通る必要がある。
 */
export async function checkSemanticFixtures({
  schemaPath = path.join(repositoryRoot, 'schemas/card.schema.json'),
  fixturesRoot = defaultFixturesRoot,
} = {}) {
  const { structuralRoot, staticSemanticRoot } = fixtureDirectories(fixturesRoot);
  const result = { validCollections: 0, invalidCollections: 0, errors: [] };
  const validate = createCardDefinitionValidator(await readJson(schemaPath));
  const documents = [];
  for (const file of await discoverJson(path.join(structuralRoot, 'valid'), result.errors)) {
    try {
      documents.push({ file, card: await readJson(file) });
    } catch (error) {
      result.errors.push(error.message);
    }
  }
  const existingErrors = validate(documents);
  result.errors.push(...formatDefinitionErrors(existingErrors));
  if (documents.length > 0 && result.errors.length === 0) result.validCollections += 1;

  const manifest = path.join(staticSemanticRoot, 'invalid-expectations.json');
  let expectations;
  try {
    expectations = await readJson(manifest);
    validateExpectations(expectations, manifest);
    if (Object.values(expectations).some((expected) => !expected.keyword.startsWith('semantic/'))) {
      throw new Error(`${manifest}#: [expectations] semantic fixtures must expect a semantic/ diagnostic`);
    }
  } catch (error) {
    result.errors.push(error.message);
    return result;
  }
  const validFiles = await discoverJson(path.join(staticSemanticRoot, 'valid'), result.errors);
  const invalidRoot = path.join(staticSemanticRoot, 'invalid');
  const invalidFiles = await discoverJson(invalidRoot, result.errors);
  const invalidNames = new Set(invalidFiles.map((file) => path.relative(invalidRoot, file).split(path.sep).join('/')));
  for (const name of Object.keys(expectations).sort()) {
    if (!invalidNames.has(name)) result.errors.push(`${manifest}#: [stale-expectation] no invalid fixture for ${name}`);
  }
  for (const [category, files] of [['valid', validFiles], ['invalid', invalidFiles]]) {
    for (const file of files) {
      let cards;
      try {
        cards = await readJson(file);
        if (!Array.isArray(cards) || cards.length === 0) {
          throw new Error(`${file}#: [fixture-collection] expected a nonempty array of Card Definitions`);
        }
      } catch (error) {
        result.errors.push(error.message);
        continue;
      }
      const errors = validate(cards.map((card, index) => ({ file, card, instancePath: `/${index}` })));
      if (category === 'valid') {
        if (errors.length === 0) result.validCollections += 1;
        else result.errors.push(...formatDefinitionErrors(errors));
        continue;
      }
      const name = path.relative(invalidRoot, file).split(path.sep).join('/');
      const expected = expectations[name];
      if (!Object.hasOwn(expectations, name)) {
        result.errors.push(`${file}#: [missing-expectation] add an intended error to ${manifest}`);
      } else if (errors.length === 0) {
        result.errors.push(`${file}#: [unexpected-valid] invalid fixture passed static semantic validation`);
      } else if (errors.some((error) => !error.keyword.startsWith('semantic/'))) {
        result.errors.push(`${file}#: [structural-failure] semantic invalid fixture must pass structural validation`);
        result.errors.push(...formatDefinitionErrors(errors));
      } else if (errors.some((error) => error.keyword === expected.keyword
        && error.instancePath === expected.instancePath
        && (!expected.params || includesSubset(error.params, expected.params)))) {
        result.invalidCollections += 1;
      } else {
        result.errors.push(`${file}#${expected.instancePath}: [wrong-failure] expected ${JSON.stringify(expected)}`);
        result.errors.push(...formatDefinitionErrors(errors));
      }
    }
  }
  return result;
}

export async function main(args = process.argv.slice(2)) {
  const options = {};
  const cardFiles = [];
  const names = { '--schema': 'schemaPath', '--fixtures': 'fixturesRoot' };
  const usage = 'Usage: node scripts/check-cards.mjs [--schema PATH] [--fixtures PATH | --cards FILE [--cards FILE ...]]';
  for (let index = 0; index < args.length; index += 2) {
    const value = args[index + 1];
    if (args[index] === '--cards' && value && !value.startsWith('--')) {
      cardFiles.push(path.resolve(value));
      continue;
    }
    const name = Object.hasOwn(names, args[index]) ? names[args[index]] : undefined;
    if (!name || !value || value.startsWith('--') || Object.hasOwn(options, name)) {
      console.error(usage);
      return 1;
    }
    options[name] = path.resolve(value);
  }
  if (cardFiles.length > 0 && options.fixturesRoot) {
    console.error(usage);
    return 1;
  }
  try {
    if (cardFiles.length > 0) {
      const validate = createCardDefinitionValidator(options.schemaPath ? await readJson(options.schemaPath) : cardSchema);
      const documents = [];
      for (const file of cardFiles) documents.push({ file, card: await readJson(file) });
      const errors = validate(documents);
      if (errors.length > 0) {
        for (const error of formatDefinitionErrors(errors)) console.error(error);
        console.error(`Card Definition 検証失敗: ${errors.length} 件`);
        return 1;
      }
      console.log(`Card Definition 検証成功: ${documents.length} 定義（構造契約・静的意味を検証。ゲーム動作は未検証）`);
      return 0;
    }
    const result = await checkCardFixtures(options);
    if (result.errors.length > 0) {
      for (const error of result.errors) console.error(error);
      console.error(`Card Schema 検証失敗: ${result.errors.length} 件`);
      return 1;
    }
    const semantic = await checkSemanticFixtures(options);
    if (semantic.errors.length > 0) {
      for (const error of semantic.errors) console.error(error);
      console.error(`Card Definition 静的意味検証失敗: ${semantic.errors.length} 件`);
      return 1;
    }
    console.log(`Card Definition 検証成功: 構造 valid ${result.validFiles} 件 / invalid ${result.invalidFiles} 件、静的意味 valid ${semantic.validCollections} 集合 / invalid ${semantic.invalidCollections} 集合（ゲーム動作は未検証）`);
    return 0;
  } catch (error) {
    console.error(`[card-validation] ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = await main();
}
