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
  ],
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
    /**
     * REVIEW: [Issue] Import Node Code in Front-end Testing
     * the issue is from here: ./src/hooks/usePrismaTaskModel.integration.test.ts
     * 
     * ### transform:
     * Add mjs because create-t3-app use mjs in some where
     * Add @babel/plugin-proposal-private-methods to solve some problem
     * 
     * ### transformIgnorePatterns:
     * We need transform some ESM libraries.
     * So transform all from node_modules, not by default because of performance.
     * 
     * TODO: Study Vitest
     * An example of t3 app testing is using Vitest and is much easier to set up 
     * and seems to have better performance.
     * 
     * @see https://github.com/briangwaltney/t3-testing-example
     * @see https://vitest.dev/
     */
    {
      ...commonConfig,
      displayName: 'client',
      rootDir: "<rootDir>",
      testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/src/server/"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleDirectories: ["node_modules", "<rootDir>/"],
      testEnvironment: "jest-environment-jsdom",
      transform: {
        // Use babel-jest to transpile tests with the next/babel preset
        // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
        '^.+\\.(mjs|js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'], "plugins": ["@babel/plugin-proposal-private-methods"] }],
      },
      transformIgnorePatterns: [
        // '<rootDir>/node_modules/',
      ],
    }
  ],
};

export default createJestConfig(config);