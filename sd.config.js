// sd.config.js
// Figma 스타일(텍스트·효과)은 여러 속성을 묶은 객체 값이라 그대로 두면 CSS에
// "--title-2: [object Object]"로 나온다. 빌드 전에 CSS에서 바로 쓸 수 있는 속성별
// 토큰으로 푼다.
//   텍스트 스타일 → --title-2-font-size / -font-weight / -line-height / -letter-spacing
//   효과 스타일   → --bottom-sheet-shadow / --floating-button-backdrop-filter 등
const FONT_WEIGHTS = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };

const round = (n, digits = 2) => Number(n.toFixed(digits));
const px = (n) => (n === 0 ? "0" : `${round(n)}px`);

const isTextStyleValue = (value) =>
  value !== null &&
  typeof value === "object" &&
  "fontSize" in value &&
  "lineHeight" in value;

const isEffectStyleValue = (value) =>
  value !== null && typeof value === "object" && Array.isArray(value.effects);

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
  "letter-spacing": { $value: px(value.letterSpacing), $type: "dimension" },
});

const toRgba = ({ r, g, b, a }) =>
  `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${round(a)})`;

// Figma 그림자의 radius는 CSS box-shadow의 blur 반경과 같다.
// Figma 배경 흐림(BACKGROUND_BLUR)의 radius는 CSS blur()의 2배라 절반으로 옮긴다
// (Figma Dev Mode 코드 출력과 동일: 20 → blur(10px)).
const expandEffectStyle = (value) => {
  const visible = value.effects.filter((effect) => effect.visible !== false);
  const shadows = visible
    .filter((e) => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW")
    .map((e) =>
      [
        e.type === "INNER_SHADOW" ? "inset" : null,
        px(e.offset.x),
        px(e.offset.y),
        px(e.radius),
        px(e.spread ?? 0),
        toRgba(e.color),
      ]
        .filter(Boolean)
        .join(" "),
    );
  const backgroundBlur = visible.find((e) => e.type === "BACKGROUND_BLUR");
  const layerBlur = visible.find((e) => e.type === "LAYER_BLUR");

  const expanded = {};
  if (shadows.length > 0) {
    expanded.shadow = { $value: shadows.join(", "), $type: "shadow" };
  }
  if (backgroundBlur) {
    expanded["backdrop-filter"] = {
      $value: `blur(${px(backgroundBlur.radius / 2)})`,
      $type: "string",
    };
  }
  if (layerBlur) {
    expanded.filter = {
      $value: `blur(${px(layerBlur.radius / 2)})`,
      $type: "string",
    };
  }
  return expanded;
};

// elevation.1처럼 한 단계 안에 들어 있는 스타일도 있어 트리 전체를 훑는다
const expandFigmaStyles = (node) => {
  if (node === null || typeof node !== "object") return node;
  if ("$value" in node) {
    if (isTextStyleValue(node.$value)) return expandTextStyle(node.$value);
    if (isEffectStyleValue(node.$value)) return expandEffectStyle(node.$value);
    return node;
  }
  return Object.fromEntries(
    Object.entries(node).map(([key, child]) => [key, expandFigmaStyles(child)]),
  );
};

export default {
  hooks: {
    preprocessors: {
      "figma-styles/expand": expandFigmaStyles,
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
  preprocessors: ["figma-styles/expand"],
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
