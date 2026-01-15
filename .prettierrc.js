/**
 * Prettier Configuration
 * Consistent code formatting for Lovendo
 */
module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,

  // JSX
  jsxSingleQuote: false,
  bracketSameLine: false,

  // Other
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',

  // Overrides for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 100,
      },
    },
  ],
};
