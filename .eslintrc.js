export default {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // Code quality
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    
    // Accessibility rules
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Performance
    'no-await-in-loop': 'warn',
    'prefer-template': 'error'
  },
  globals: {
    'globalThis': 'readonly'
  }
}