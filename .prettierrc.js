module.exports = {
  // Indentazione
  tabWidth: 2,
  useTabs: false,
  
  // Virgolette
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // Punto e virgola
  semi: true,
  
  // Virgole finali
  trailingComma: 'none',
  
  // Spazi
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Lunghezza linea
  printWidth: 120,
  
  // Interruzioni di riga
  endOfLine: 'lf',
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // Prose wrap
  proseWrap: 'preserve',
  
  // HTML
  htmlWhitespaceSensitivity: 'css',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Override per file specifici
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        trailingComma: 'none'
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80
      }
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    }
  ]
};