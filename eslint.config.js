import js from '@eslint/js'
import globals from 'globals'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// `@typescript-eslint/eslint-plugin`의 flat/recommended는 일부 조각(parser 설정,
// 규칙)이 파일 범위(files) 제한 없이 정의되어 있다. 기존 .eslintrc.cjs는
// `--ext ts,tsx`로 대상 파일을 CLI에서 제한했으므로, 그 역할을 여기서
// `files: ['**/*.{ts,tsx}']`로 명시적으로 옮긴다.
const tsRecommended = tsPlugin.configs['flat/recommended'].map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx}'],
}))

export default [
  {
    // node_modules는 flat config 기본 무시 목록에도 포함되지만, 요구사항에
    // 따라 명시적으로 남겨둔다. packages/intip-bridge는 별도 git 서브모듈
    // 레포이므로 이 프로젝트의 lint 대상이 아니다.
    ignores: ['dist', 'node_modules', 'packages/intip-bridge'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...js.configs.recommended,
  },
  ...tsRecommended,
  {
    // 기존 env: { browser: true, es2020: true } 대응
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 기존 plugin:react-hooks/recommended 대응
      ...reactHooks.configs.flat.recommended.rules,
      // 기존 rules.react-refresh/only-export-components 대응 (그대로 유지)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Cloudflare Pages Functions: HTMLRewriter/PagesFunction 등 워커 런타임
    // 전역은 브라우저 env에 없다. 타입 검증은 functions/tsconfig.json이 맡으므로
    // (해당 파일들은 이 저장소 build의 `tsc`에는 포함되지 않는다) 여기서는
    // no-type-aware no-undef의 오탐만 끈다.
    files: ['functions/**/*.ts'],
    rules: {
      'no-undef': 'off',
    },
  },
]
