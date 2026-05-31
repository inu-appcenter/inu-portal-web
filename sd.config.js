// sd.config.js
export default {
  // tokens 폴더 안의 모든 .tokens.json 파일을 대상으로 지정
  source: ["tokens/**/*.tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
    ts: {
      transformGroup: "js",
      buildPath: "src/constants/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/esm",
        },
        {
          destination: "tokens.d.ts",
          format: "typescript/module-declarations",
        },
      ],
    },
  },
};
