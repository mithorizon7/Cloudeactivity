import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const localesDir = join(__dirname, '..', 'locales');

const baseLocale = 'en';
const targetLocales = ['lv', 'ru', 'pseudo'];

function loadKeys(locale) {
  const data = JSON.parse(readFileSync(join(localesDir, `${locale}.json`), 'utf8'));
  return new Set(Object.keys(data).filter((k) => !k.startsWith('@')));
}

const baseKeys = loadKeys(baseLocale);
let failed = false;

for (const locale of targetLocales) {
  const keys = loadKeys(locale);
  const missing = [...baseKeys].filter((k) => !keys.has(k)).sort();
  const extra = [...keys].filter((k) => !baseKeys.has(k)).sort();

  if (missing.length) {
    failed = true;
    console.error(`\n[i18n] Missing keys in ${locale}: ${missing.length}`);
    console.error(missing.join('\n'));
  }

  if (extra.length) {
    console.warn(`\n[i18n] Extra keys in ${locale}: ${extra.length}`);
    console.warn(extra.join('\n'));
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('[i18n] Key parity check passed.');
}
