module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Reglas de estilo
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Reglas de variables
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Reglas de funciones
    'no-empty-function': 'warn',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    
    // Reglas de objetos
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    
    // Reglas de control de flujo
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    
    // Reglas de Three.js específicas
    'no-new': 'off', // Permitir new THREE.Object()
    
    // Reglas de rendimiento
    'no-loop-func': 'error',
    'no-implied-eval': 'error',
    
    // Reglas de seguridad
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  },
  globals: {
    // Variables globales de Three.js
    'THREE': 'readonly',
    
    // Variables globales del navegador
    'window': 'readonly',
    'document': 'readonly',
    'console': 'readonly',
    
    // Variables globales del editor
    'Editor3D': 'writable'
  }
}; 