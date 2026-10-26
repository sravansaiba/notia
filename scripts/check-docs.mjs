import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import ts from 'typescript';

process.argv.push('--check');
const { standaloneSource } = await import('./docs-examples.mjs');

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'apps/docs/examples');
const javascript = new Map(
  readdirSync(directory)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => [
      join(directory, file.replace(/\.tsx$/, '.jsx')),
      ts.transpileModule(
        standaloneSource(readFileSync(join(directory, file), 'utf8')),
        {
          compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.Preserve,
          },
        },
      ).outputText,
    ]),
);
const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  skipLibCheck: true,
  esModuleInterop: true,
  paths: { notia: [join(root, 'packages/echo/src/index.ts')] },
};
const host = ts.createCompilerHost(options);
const read = host.readFile.bind(host);
const exists = host.fileExists.bind(host);
host.readFile = (file) => javascript.get(resolve(file)) ?? read(file);
host.fileExists = (file) => javascript.has(resolve(file)) || exists(file);
host.getSourceFile = (file, languageVersion) => {
  const text = host.readFile(file);
  return text === undefined
    ? undefined
    : ts.createSourceFile(file, text, languageVersion, true);
};
const program = ts.createProgram([...javascript.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
  process.exitCode = 1;
} else
  console.log(
    `${javascript.size} JavaScript examples pass TypeScript's JavaScript checking against the real Notia API.`,
  );
