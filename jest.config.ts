import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  moduleFileExtensions: ["ts", "tsx", "js"],
  rootDir: "./",
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>",
  }),
};
