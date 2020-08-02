module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:import/warnings'
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    'import'
  ],
  rules: {
    indent: [2, 2],
    semi: [2, 'always']
  }
}
