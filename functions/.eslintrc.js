const path = require("path");

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {allowTemplateLiterals: true}],
    "max-len": ["error", {code: 160}], // Aumenta o limite de 80 para 160
    "require-jsdoc": "off", // Desabilita obrigatoriedade de JSDoc
  },
  overrides: [
    {
      files: ["test/**/*.ts", "**/*.test.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        // No project option for test files to avoid tsconfig issues
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "google",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "max-len": ["error", {code: 160}],
        "require-jsdoc": "off",
      },
    },
    {
      files: ["src/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: [path.resolve(__dirname, "tsconfig.json")], // Absolute path to tsconfig.json
        sourceType: "module",
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "google",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "warn", // Warnings ao invés de errors
        "max-len": ["error", {code: 160}],
        "require-jsdoc": "off",
      },
    },
  ],
};
