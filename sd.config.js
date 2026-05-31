// sd.config.js
export default {
  hooks: {
    transforms: {
      // 1. 숫자로 된 크기/간격 토큰에 자동으로 'px' 단위를 붙여주는 커스텀 트랜스폼 정의
      "size/add-px": {
        type: "value",
        filter: (token) => {
          return (
            token.$type === "number" || 
            ["space", "radius", "padding"].includes(token.path[0])
          );
        },
        transform: (token) => `${token.$value}px`,
      },
    },
  },
  // tokens 폴더 안의 모든 .tokens.json 파일을 대상으로 지정
  source: ["tokens/**/*.tokens.json"],
  platforms: {
    css: {
      // 2. 기본 'css' 그룹 대신 개별 트랜스폼을 적용하여 px 변환을 수행합니다.
      transforms: ["attribute/cti", "name/kebab", "size/add-px", "color/css"],
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
