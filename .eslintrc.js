module.exports = {
  env: {
    node: true,
    es2022: true,
    commonjs: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // Errori
    'no-console': 'off', // Permesso per logging
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Prettier integration
    'prettier/prettier': 'error',
    
    // Stile del codice (gestito da Prettier)
    // Rimuoviamo le regole di stile che confliggono con Prettier
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-throw-literal': 'error',
    'no-unused-expressions': 'error',
    'radix': 'error',
    'wrap-iife': 'error',
    
    // Async/await
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // Node.js specifiche
    'no-process-exit': 'warn',
    'no-path-concat': 'error',
    
    // Sicurezza
    'no-new-require': 'error',
    
    // Performance
    'no-loop-func': 'error',
    
    // Accessibilità e leggibilità
    'max-len': ['warn', { 
      code: 120, 
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    'max-lines': ['warn', {
      max: 500,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-lines-per-function': ['warn', {
      max: 100,
      skipBlankLines: true,
      skipComments: true
    }],
    'complexity': ['warn', 15],
    'max-depth': ['warn', 4],
    'max-nested-callbacks': ['warn', 4],
    'max-params': ['warn', 5]
  },
  overrides: [
    {
      files: ['scripts/**/*.js'],
      rules: {
        'no-console': 'off',
        'no-process-exit': 'off'
      }
    },
    {
      files: ['src/web/**/*.js'],
      env: {
        browser: false,
        node: true
      }
    },
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'max-lines-per-function': 'off',
        'max-lines': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'logs/',
    'cache/',
    'backups/',
    '*.min.js'
  ],
  globals: {
    // Discord.js globals se necessario
  }
};