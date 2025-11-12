// A simplified Polyglot implementation for handling nested keys and interpolation.
class Polyglot {
  private phrases: Record<string, any>;

  constructor(phrases: Record<string, any>) {
    this.phrases = phrases;
  }

  t(key: string, options?: any): string {
    const keys = key.split('.');
    let value: any = this.phrases;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
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
