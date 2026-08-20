module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
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
  ],
}
