import nextJest from "next/jest";
import type { Config } from "jest";

/**
 * setup jest config with Next.js
 * @see https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler
 */
const createJestConfig = nextJest({
  dir: "./",
});

/**
 * setup jest config with create-t3-app
 * @see https://www.youtube.com/watch?v=YRGo1H-qNQs
 */
const commonConfig: Config = {
  clearMocks: true,
  preset: "ts-jest/presets/js-with-ts",
  transform: {
    "^.+\\.mjs$": "ts-jest",
  },
  coveragePathIgnorePatterns: [
    "<rootDir>/build/",
    "<rootDir>/node_modules/",
    "<rootDir>/src/utils/"
  ]
};

/**
 * separate diff configs for server code and client code
 * main diff is testEnvironment
 * @see https://stackoverflow.com/questions/41318115/testing-two-environments-with-jest
 */
const config: Config = {
  coverageProvider: "v8",
  projects: [
    {
      ...commonConfig,
      displayName: 'server:unit',
      rootDir: "<rootDir>/src/server",
      testEnvironment: "node",
      // default testMatch: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ]
      testMatch: [ "**/__tests__/**/*.unit.[jt]s?(x)", "**/?(*.unit.)+(spec|test).[jt]s?(x)" ]
    },
    {
      ...commonConfig,
      displayName: 'server:integration',
      rootDir: "<rootDir>/src/server",
      testEnvironment: "node",
      // default testMatch: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ]
      testMatch: [ "**/__tests__/**/*.integration.[jt]s?(x)", "**/?(*.integration.)+(spec|test).[jt]s?(x)" ]
    },
    {
      ...commonConfig,
      displayName: 'client',
      rootDir: "<rootDir>",
      testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/src/server/"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleDirectories: ["node_modules", "<rootDir>/"],
      testEnvironment: "jest-environment-jsdom",
    }
  ],
};

export default createJestConfig(config);