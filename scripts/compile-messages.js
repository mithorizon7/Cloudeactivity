import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const localesDir = join(rootDir, 'locales');
const inputFile = join(localesDir, 'en.json');
const tempFile = join(localesDir, '.en.temp.json');
const outputFile = join(localesDir, 'en.compiled.json');

const content = JSON.parse(readFileSync(inputFile, 'utf-8'));

const messagesForCompile = {};
for (const [key, value] of Object.entries(content)) {
  if (!key.startsWith('@') && typeof value === 'string') {
    messagesForCompile[key] = {
      defaultMessage: value,
    };
  }
}

writeFileSync(tempFile, JSON.stringify(messagesForCompile, null, 2));

console.log(`Validating and compiling ${Object.keys(messagesForCompile).length} messages...`);

try {
  execSync(`npx formatjs compile ${tempFile} --ast --out-file ${outputFile}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log(`Successfully compiled to ${outputFile}`);
  console.log('All ICU message syntax validated.');
} catch (error) {
  console.error('Compilation failed - check ICU syntax errors above');
  process.exit(1);
} finally {
  try {
    unlinkSync(tempFile);
  } catch (e) {}
}
