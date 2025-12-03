import formatjs from 'eslint-plugin-formatjs';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      formatjs,
    },
    rules: {
      'formatjs/enforce-description': ['error', 'literal'],
      'formatjs/enforce-default-message': 'error',
      'formatjs/enforce-placeholders': 'error',
      'formatjs/no-multiple-whitespaces': 'error',
      'formatjs/no-offset': 'error',
      'formatjs/no-emoji': 'warn',
      'formatjs/no-complex-selectors': ['error', { limit: 3 }],
      'formatjs/no-id': 'off',
      'formatjs/no-literal-string-in-jsx': ['warn', {
        noStrings: true,
        ignoreProps: ['className', 'style', 'type', 'role', 'aria-label', 'aria-describedby', 'id', 'name', 'href', 'src', 'alt', 'key', 'data-testid'],
        ignore: [' ', '—', '·', '/', '+', ':', '#', '★', '✓', '−', '%'],
      }],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '*.config.*'],
  },
];
