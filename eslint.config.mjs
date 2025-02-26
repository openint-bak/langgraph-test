// much more complicated version of
// {
//     "parser": "@typescript-eslint/parser",
//     "plugins": ["@typescript-eslint"],
//     "extends": [
//       "eslint:recommended",
//       "plugin:@typescript-eslint/recommended"
//     ],
//     "rules": {
//       "@typescript-eslint/consistent-type-imports": "error"
//     }
//   }

import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import js from '@eslint/js'
import {FlatCompat} from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      // This is needed for node 22's --experimental-strip-types to work
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
]
