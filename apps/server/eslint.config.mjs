import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'src/generated/**',
      'generated/**',
      'prisma/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '**/__tests__/**',
      '**/*.test.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Web globals (Node 18+)
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        RequestInit: 'readonly',
        AbortSignal: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Code conventions enforcement
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression'],
      // Disable no-console - we use structured logging (logger)
      // Only console statements remaining are in JSDoc examples
      'no-console': 'off',
      // Disable base rule - TypeScript version handles this
      'no-unused-vars': 'off',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Import rules
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
];
