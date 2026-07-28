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
    // Stats Hub feature surfaces - enforce semantic design tokens over raw Tailwind
    // palette classes. Raw classes (bg-blue-100, text-red-600, ...) have no dark-mode
    // variant in this codebase, so they silently break in the "Modern War Room" dark
    // theme. See docs/solutions/patterns/critical-patterns.md and src/lib/stat-colors.ts.
    files: [
      'src/features/waiver-analysis/**/*.{ts,tsx}',
      'src/features/transactions/**/*.{ts,tsx}',
      'src/features/start-sit/**/*.{ts,tsx}',
      'src/components/stats/StartSitEfficiencyTab.tsx',
      'src/app/stats/components/ManagerRankings.tsx',
      'src/app/stats/components/ManagerDetailModal.tsx',
    ],
    ignores: ['**/*.test.{ts,tsx}', '**/*.test.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/(^|\\s)(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|shadow)-(red|blue|green|purple|orange|yellow|pink|indigo|cyan|teal|slate|gray|grey|zinc|neutral|stone|lime|emerald|sky|violet|fuchsia|rose|amber)-[0-9]{2,3}(\\s|$)/]',
          message:
            'Raw Tailwind palette classes have no dark-mode variant here. Use semantic tokens (text-success, text-destructive, text-primary, text-secondary, bg-muted, ...) or the helpers in src/lib/stat-colors.ts instead. See docs/solutions/patterns/critical-patterns.md.',
        },
        {
          selector:
            'TemplateElement[value.raw=/(^|\\s)(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|shadow)-(red|blue|green|purple|orange|yellow|pink|indigo|cyan|teal|slate|gray|grey|zinc|neutral|stone|lime|emerald|sky|violet|fuchsia|rose|amber)-[0-9]{2,3}(\\s|$)/]',
          message:
            'Raw Tailwind palette classes have no dark-mode variant here. Use semantic tokens (text-success, text-destructive, text-primary, text-secondary, bg-muted, ...) or the helpers in src/lib/stat-colors.ts instead. See docs/solutions/patterns/critical-patterns.md.',
        },
      ],
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
