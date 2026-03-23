/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/src/e2e/", "<rootDir>/src/__tests__/store-setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/store-setup.ts"],
};

module.exports = config;
