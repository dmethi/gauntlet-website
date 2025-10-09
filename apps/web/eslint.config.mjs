import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        // Browser Observer APIs
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        PerformanceObserver: 'readonly',
        // HTML Element types
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLVideoElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableSectionElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLTableCellElement: 'readonly',
        HTMLTableCaptionElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLLabelElement: 'readonly',
        Element: 'readonly',
        // SVG Element types
        SVGElement: 'readonly',
        SVGSVGElement: 'readonly',
        SVGPathElement: 'readonly',
        SVGCircleElement: 'readonly',
        SVGRectElement: 'readonly',
        SVGLineElement: 'readonly',
        SVGGElement: 'readonly',
        // Event types
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Node.js Web APIs
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        AbortSignal: 'readonly',
        AbortController: 'readonly',
        // Node.js timers
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        // Node.js crypto
        crypto: 'readonly',
        // Testing globals (from vitest)
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        // React types
        JSX: 'readonly',
        React: 'readonly',
        // WebAssembly
        WebAssembly: 'readonly',
        // Encoding
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
      react: react,
      'react-hooks': reactHooks,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Arrow functions enforcement (CODING_CONVENTIONS.MD)
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off', // Disable base rule as it conflicts with @typescript-eslint/no-unused-vars
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Import organization
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    // Scripts directory - allow console statements and regular functions
    files: ['src/scripts/**/*.{ts,js}', 'scripts/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
      'func-style': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'dist/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      'scripts/**',
      'data/**',
    ],
  },
];
