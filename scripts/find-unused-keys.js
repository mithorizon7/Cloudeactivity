import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const localesDir = join(rootDir, 'locales');
const componentsDir = join(rootDir, 'components');
const appFile = join(rootDir, 'App.tsx');

function getAllFiles(dir, extensions) {
  const files = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

const enMessages = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf-8'));

const messageKeys = Object.keys(enMessages).filter((k) => !k.startsWith('@'));

const sourceFiles = [...getAllFiles(componentsDir, ['.tsx', '.ts']), appFile];

const allSourceCode = sourceFiles.map((f) => readFileSync(f, 'utf-8')).join('\n');

const usedKeys = new Set();
const unusedKeys = [];
const dynamicPatterns = [];

for (const key of messageKeys) {
  const patterns = [`"${key}"`, `'${key}'`, `\`${key}\``];

  const isUsed = patterns.some((p) => allSourceCode.includes(p));

  if (isUsed) {
    usedKeys.add(key);
  } else {
    const keyParts = key.split('.');
    const lastPart = keyParts[keyParts.length - 1];
    const dynamicPattern = key.replace(lastPart, '${');

    if (
      allSourceCode.includes(dynamicPattern) ||
      allSourceCode.includes(`\`${keyParts.slice(0, -1).join('.')}.\${`)
    ) {
      dynamicPatterns.push(key);
    } else {
      unusedKeys.push(key);
    }
  }
}

console.log('=== i18n Key Usage Analysis ===\n');
console.log(`Total message keys: ${messageKeys.length}`);
console.log(`Keys found in source: ${usedKeys.size}`);
console.log(`Potentially dynamic keys: ${dynamicPatterns.length}`);
console.log(`Potentially unused keys: ${unusedKeys.length}`);

if (dynamicPatterns.length > 0) {
  console.log('\n--- Dynamic Keys (verify manually) ---');
  dynamicPatterns.slice(0, 10).forEach((k) => console.log(`  ${k}`));
  if (dynamicPatterns.length > 10) {
    console.log(`  ... and ${dynamicPatterns.length - 10} more`);
  }
}

if (unusedKeys.length > 0) {
  console.log('\n--- Potentially Unused Keys ---');
  unusedKeys.forEach((k) => console.log(`  ${k}`));
  console.log('\nNote: Some keys may be used dynamically. Review before removing.');
}

if (unusedKeys.length === 0 && dynamicPatterns.length === 0) {
  console.log('\nAll keys appear to be in use.');
}

process.exit(unusedKeys.length > 0 ? 1 : 0);
