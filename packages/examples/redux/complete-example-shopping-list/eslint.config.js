import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import vitestPlugin from "@vitest/eslint-plugin";
import prettierConfig from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import { configs } from "typescript-eslint";

const tsconfigRootDir = new URL(".", import.meta.url).pathname;

const eslintConfig = defineConfig(
  {
    name: "global-ignores",
    ignores: [
      "**/*.snap",
      "**/vite.config.ts",
      "**/lib/",
      "**/dist/",
      "**/.yalc/",
      "**/build/",
      "**/temp/",
      "**/.temp/",
      "**/.tmp/",
      "**/.yarn/",
      "**/coverage/",
    ],
  },
  {
    name: `${js.meta.name}/recommended`,
    ...js.configs.recommended,
  },
  configs.strictTypeChecked,
  configs.stylisticTypeChecked,
  vitestPlugin.configs.recommended,
  {
    name: "eslint-plugin-react/jsx-runtime",
    ...reactPlugin.configs.flat["jsx-runtime"],
  },
  reactHooksPlugin.configs["recommended-latest"],
  {
    name: "main",
    linterOptions: {
      reportUnusedDisableDirectives: 2,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir,
      },
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    rules: {
      "no-undef": [0],
      "@typescript-eslint/require-await": [0],
      "@typescript-eslint/restrict-template-expressions": [0],
      "@typescript-eslint/consistent-type-definitions": [2, "type"],
      "@typescript-eslint/consistent-type-imports": [
        2,
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      "no-restricted-imports": [
        2,
        {
          paths: [
            {
              name: "react-redux",
              importNames: ["useSelector", "useStore", "useDispatch"],
              message:
                "Please use pre-typed versions from `src/app/hooks.ts` instead.",
            },
          ],
        },
      ],
    },
  },

  prettierConfig,
);

export default eslintConfig;
