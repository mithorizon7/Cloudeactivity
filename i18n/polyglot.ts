// A simplified Polyglot implementation for handling nested keys and interpolation.
type PhraseValue = string | Record<string, PhraseValue>;
type PhraseMap = Record<string, PhraseValue>;
type InterpolationOptions = Record<string, string | number>;

class Polyglot {
  private phrases: PhraseMap;

  constructor(phrases: PhraseMap) {
    this.phrases = phrases;
  }

  t(key: string, options?: InterpolationOptions): string {
    const keys = key.split('.');
    let value: PhraseValue | undefined = this.phrases;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as PhraseMap)[k];
      } else {
        // Key not found, return the key itself as a fallback
        return key;
      }
    }

    if (typeof value === 'string' && options) {
      // Basic interpolation
      return value.replace(/\{(\w+)\}/g, (match, placeholder) => {
        return options[placeholder] !== undefined ? String(options[placeholder]) : match;
      });
    }

    return typeof value === 'string' ? value : key;
  }
}

export default Polyglot;
