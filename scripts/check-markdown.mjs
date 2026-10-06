/** VSCode と共通のルール設定で、リポジトリ内の Markdown を検証する。 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lint } from 'markdownlint/promise';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const files = [];

async function discover(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name)) {
      await discover(file);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(file);
    }
  }
}

try {
  await discover(repositoryRoot);
  if (files.length === 0) throw new Error('Markdown files not found');
  const config = JSON.parse(await readFile(new URL('../.markdownlint.json', import.meta.url), 'utf8'));
  const result = await lint({ files: files.sort(), config });
  const count = Object.values(result).reduce((sum, diagnostics) => sum + diagnostics.length, 0);
  if (count > 0) {
    for (const [file, diagnostics] of Object.entries(result)) {
      for (const error of diagnostics) {
        const column = error.errorRange?.[0] ?? 1;
        const detail = error.errorDetail ? ` (${error.errorDetail})` : '';
        console.error(`${file}:${error.lineNumber}:${column} [${error.ruleNames[0]}] ${error.ruleDescription}${detail}`);
      }
    }
    console.error(`Markdown 検証失敗: ${count} 件`);
    process.exitCode = 1;
  } else {
    console.log(`Markdown 検証成功: ${files.length} ファイル / 警告 0 件`);
  }
} catch (error) {
  console.error(`[markdown-validation] ${error.message}`);
  process.exitCode = 1;
}
