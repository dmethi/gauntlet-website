module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    // General rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',

    // Import rules
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
  },
  overrides: [
    // Next.js specific rules
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: ['next/core-web-vitals'],
      rules: {
        '@next/next/no-html-link-for-pages': 'off',
      },
    },
    // Node.js specific rules
    {
      files: ['apps/api/**/*.ts', 'apps/scraper/**/*.ts'],
      env: {
        node: true,
        browser: false,
      },
    },
    // Test files
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
  ignorePatterns: ['node_modules/', '.next/', 'dist/', 'build/', '*.config.js'],
};
