import CodeX from 'eslint-config-codex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...CodeX,
  {
    files: ['eslint.config.mjs'],
    rules: {
      'n/no-unpublished-import': 'off',
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js', 'types/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.json'),
      },
    },
  },
  {
    files: ['create-packages.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
      },
      sourceType: 'script',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'playground/**', 'example/**'],
  },
];
