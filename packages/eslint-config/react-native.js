import { config as reactInternalConfig } from "./react-internal.js";

/**
 * A custom ESLint configuration for React Native applications.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactNativeConfig = [
  ...reactInternalConfig,
  {
    languageOptions: {
      globals: {
        __DEV__: "readonly",
      },
    },
  },
];
