import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import formatjs from 'eslint-plugin-formatjs';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      formatjs,
    },
    rules: {
      'formatjs/enforce-description': 'off',
      'formatjs/enforce-default-message': 'off',
      'formatjs/enforce-placeholders': 'error',
      'formatjs/no-multiple-whitespaces': 'error',
      'formatjs/no-offset': 'error',
      'formatjs/no-emoji': 'warn',
      'formatjs/no-complex-selectors': ['error', { limit: 3 }],
      'formatjs/no-id': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '*.config.*', 'scripts/**'],
  },
  prettier
);
