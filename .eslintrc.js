module.exports = {
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2015,
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    "no-console": "off",
    "dot-notation": "error",
    "no-var": "error",
    "prefer-const": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
  },
};
