// sd.config.js
// Figma 텍스트 스타일(tokens.json의 title-2 등)은 fontSize·fontWeight·lineHeight를 묶은
// 객체 값이라 그대로 두면 CSS에 "--title-2: [object Object]"로 나온다. 빌드 전에 속성별
// 토큰(--title-2-font-size 등)으로 풀어 CSS에서 바로 쓸 수 있게 한다.
const FONT_WEIGHTS = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };

const round = (n, digits = 2) => Number(n.toFixed(digits));

const isTextStyleValue = (value) =>
  value !== null &&
  typeof value === "object" &&
  "fontSize" in value &&
  "lineHeight" in value;

const expandTextStyle = (value) => ({
  "font-size": { $value: `${value.fontSize}px`, $type: "dimension" },
  "font-weight": {
    $value: FONT_WEIGHTS[value.fontWeight] ?? value.fontWeight,
    $type: "fontWeight",
  },
  // Figma PERCENT(139.99…) → 배수(1.4), PIXELS → px
  "line-height": {
    $value:
      value.lineHeightUnit === "PERCENT"
        ? round(value.lineHeight / 100)
        : `${round(value.lineHeight)}px`,
    $type: "lineHeight",
  },
  "letter-spacing": {
    $value: value.letterSpacing === 0 ? "0" : `${round(value.letterSpacing)}px`,
    $type: "dimension",
  },
});

const expandTextStyles = (tokens) =>
  Object.fromEntries(
    Object.entries(tokens).map(([key, token]) => [
      key,
      token && isTextStyleValue(token.$value)
        ? expandTextStyle(token.$value)
        : token,
    ]),
  );

export default {
  hooks: {
    preprocessors: {
      "text-style/expand": expandTextStyles,
    },
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
  source: ["tokens/tokens.json"],
  preprocessors: ["text-style/expand"],
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
