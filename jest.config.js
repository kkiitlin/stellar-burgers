const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  modulePathIgnorePatterns: ['<rootDir>/e2e/'],
  transform: {
    ...tsJestTransformCfg,
  },
};
