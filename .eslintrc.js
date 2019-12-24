// http://eslint.org/docs/user-guide/configuring
const path = require('path')

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    "ecmaVersion": 2020
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier'
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    // Solution: https://github.com/ilearnio/module-alias/issues/48#issuecomment-541357005
    "node/no-missing-require": ["error", {
      "allowModules": ["models", "plugins", "utilities", "policies", "services", "routes", "schemas", "api"],
      "resolvePaths": ["./server"],
      "tryExtensions": [".js", ".json", ".node"]
    }],
    "node/exports-style": ["error", "module.exports"],
    "node/file-extension-in-import": ["error", "always"],
    "node/prefer-global/buffer": ["error", "always"],
    "node/prefer-global/console": ["error", "always"],
    "node/prefer-global/process": ["error", "always"],
    "node/prefer-global/url-search-params": ["error", "always"],
    "node/prefer-global/url": ["error", "always"],
    "node/prefer-promises/dns": "error",
    "node/prefer-promises/fs": "error",
    "no-empty": "off",
    "no-process-exit": "off",
    "no-unused-vars": "warn",
  }
};
