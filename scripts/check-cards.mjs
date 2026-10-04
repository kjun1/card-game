/**
 * Card Definition の構造契約と fixture を検証する。ゲーム動作は実行しない。
 * invalid fixture は、外部 manifest に記録した keyword / JSON Pointer でも照合する。
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

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
 * valid / invalid を再帰的に検証する。返り値の件数は成功した fixture の件数。
 * JSON parse / read error は「期待どおりの invalid」には数えない。
 * manifest のキーは invalid/ からの相対パス（区切りは /）。
 */
export async function checkCardFixtures({
  schemaPath = path.join(repositoryRoot, 'schemas/card.schema.json'),
  fixturesRoot = path.join(repositoryRoot, 'test/fixtures/cards'),
} = {}) {
  const result = { validFiles: 0, invalidFiles: 0, errors: [] };
  let validate;
  try {
    validate = createCardValidator(await readJson(schemaPath));
  } catch (error) {
    result.errors.push(`${schemaPath}#: [schema] ${error.message}`);
    return result;
  }

  const manifest = path.join(fixturesRoot, 'invalid-expectations.json');
  let expectations;
  try {
    expectations = await readJson(manifest);
    validateExpectations(expectations, manifest);
  } catch (error) {
    result.errors.push(error.message);
    return result;
  }

  const validFiles = await discoverJson(path.join(fixturesRoot, 'valid'), result.errors);
  const invalidRoot = path.join(fixturesRoot, 'invalid');
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

export async function main(args = process.argv.slice(2)) {
  const options = {};
  const names = { '--schema': 'schemaPath', '--fixtures': 'fixturesRoot' };
  for (let index = 0; index < args.length; index += 2) {
    const name = Object.hasOwn(names, args[index]) ? names[args[index]] : undefined;
    const value = args[index + 1];
    if (!name || !value || value.startsWith('--') || Object.hasOwn(options, name)) {
      console.error('Usage: node scripts/check-cards.mjs [--schema PATH] [--fixtures PATH]');
      return 1;
    }
    options[name] = path.resolve(value);
  }
  try {
    const result = await checkCardFixtures(options);
    if (result.errors.length > 0) {
      for (const error of result.errors) console.error(error);
      console.error(`Card Schema 検証失敗: ${result.errors.length} 件`);
      return 1;
    }
    console.log(`Card Schema 検証成功: valid ${result.validFiles} 件 / invalid ${result.invalidFiles} 件（構造契約のみ。ゲーム動作は未検証）`);
    return 0;
  } catch (error) {
    console.error(`[card-validation] ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = await main();
}
