import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const localesDir = join(rootDir, 'locales');
const inputFile = join(localesDir, 'en.json');
const outputFile = join(localesDir, 'pseudo.json');

const PSEUDO_MAP = {
  a: 'à',
  b: 'ƀ',
  c: 'ç',
  d: 'ð',
  e: 'è',
  f: 'ƒ',
  g: 'ĝ',
  h: 'ĥ',
  i: 'ì',
  j: 'ĵ',
  k: 'ķ',
  l: 'ĺ',
  m: 'ɱ',
  n: 'ñ',
  o: 'ò',
  p: 'þ',
  q: 'ǫ',
  r: 'ŕ',
  s: 'š',
  t: 'ţ',
  u: 'ù',
  v: 'ṽ',
  w: 'ŵ',
  x: 'ẋ',
  y: 'ý',
  z: 'ž',
  A: 'À',
  B: 'Ɓ',
  C: 'Ç',
  D: 'Ð',
  E: 'È',
  F: 'Ƒ',
  G: 'Ĝ',
  H: 'Ĥ',
  I: 'Ì',
  J: 'Ĵ',
  K: 'Ķ',
  L: 'Ĺ',
  M: 'Ṁ',
  N: 'Ñ',
  O: 'Ò',
  P: 'Þ',
  Q: 'Ǫ',
  R: 'Ŕ',
  S: 'Š',
  T: 'Ţ',
  U: 'Ù',
  V: 'Ṽ',
  W: 'Ŵ',
  X: 'Ẋ',
  Y: 'Ý',
  Z: 'Ž',
};

function pseudoLocalize(text) {
  if (typeof text !== 'string') return text;

  let result = '';
  let inPlaceholder = false;
  let braceDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '{') {
      braceDepth++;
      inPlaceholder = true;
      result += char;
    } else if (char === '}') {
      braceDepth--;
      if (braceDepth === 0) inPlaceholder = false;
      result += char;
    } else if (inPlaceholder) {
      result += char;
    } else if (PSEUDO_MAP[char]) {
      result += PSEUDO_MAP[char];
    } else {
      result += char;
    }
  }

  const expansion = Math.ceil(result.length * 0.35);
  const padding = '~'.repeat(expansion);

  return `[${result}${padding}]`;
}

const content = JSON.parse(readFileSync(inputFile, 'utf-8'));

const pseudoMessages = {};
for (const [key, value] of Object.entries(content)) {
  if (key.startsWith('@')) {
    pseudoMessages[key] = value;
  } else if (typeof value === 'string') {
    pseudoMessages[key] = pseudoLocalize(value);
  } else {
    pseudoMessages[key] = value;
  }
}

writeFileSync(outputFile, JSON.stringify(pseudoMessages, null, 2));

const messageCount = Object.keys(pseudoMessages).filter((k) => !k.startsWith('@')).length;
console.log(`Generated pseudo-localization for ${messageCount} messages`);
console.log(`Output: ${outputFile}`);
console.log('');
console.log('Pseudo-localization features:');
console.log('  - Accented characters to test Unicode rendering');
console.log('  - 35% text expansion to test layout flexibility');
console.log('  - Brackets [ ] to spot hardcoded strings');
console.log('  - Preserved ICU placeholders {like, this}');
