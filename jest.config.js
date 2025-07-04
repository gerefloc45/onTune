module.exports = {
  // Ambiente di test
  testEnvironment: 'node',
  
  // Pattern per i file di test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Directory da ignorare
  testPathIgnorePatterns: [
    '/node_modules/',
    '/logs/',
    '/cache/',
    '/temp/',
    '/backups/',
    '/dist/',
    '/build/'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Coverage
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/web/public/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Timeout per i test
  testTimeout: 30000,
  
  // Variabili d'ambiente per i test
  setupFiles: [
    '<rootDir>/tests/env.js'
  ],
  
  // Transform
  transform: {},
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@managers/(.*)$': '<rootDir>/src/managers/$1',
    '^@web/(.*)$': '<rootDir>/src/web/$1'
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Globals
  globals: {
    'NODE_ENV': 'test'
  },
  
  // Reporter
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml'
      }
    ]
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Notify
  notify: false,
  
  // Bail on first failure in CI
  bail: process.env.CI ? 1 : 0,
  
  // Force exit
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max workers
  maxWorkers: process.env.CI ? 2 : '50%'
};