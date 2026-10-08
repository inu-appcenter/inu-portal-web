// Figma Tokens Studio export(tokens/) → src/styles/variables.css + src/styles/tokens.ts
//
// tokens/ 폴더는 Tokens Studio "Export to file/folder" 결과를 그대로 덮어쓰는 자리다.
// 새로 export하면 tokens/ 를 통째로 교체하고 `npm run build:tokens` 만 다시 돌리면 된다.
//
// - 세트 순서는 $metadata.json 의 tokenSetOrder 를 따른다.
// - "Timetable Theme/*" 세트는 같은 토큰명(tt.color-N.bg/text)을 테마마다 다시 정의하므로
//   한꺼번에 합치지 않고, 기본 테마는 :root 에, 나머지는 [data-tt-theme="..."] 스코프로 낸다.
// - 시맨틱(Alias) 색상은 var(--primitive) 참조를 유지해 출처가 드러나게 한다.
import fs from "node:fs";
import path from "node:path";
import StyleDictionary from "style-dictionary";
import { register, expandTypesMap } from "@tokens-studio/sd-transforms";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TOKENS_DIR = path.join(ROOT, "tokens");
const CSS_OUT = path.join(ROOT, "src/styles/variables.css");
const TS_OUT = path.join(ROOT, "src/styles/tokens.ts");

const TIMETABLE_SET_PREFIX = "Timetable Theme/";
// Tokens Studio 세트명 → 앱의 TimetableTheme["colorTheme"] 키
const TIMETABLE_THEME_KEYS = {
  기본: "default",
  파스텔웜: "pastelWarm",
  파스텔쿨: "pastelCool",
  모노톤: "monotone",
};
const DEFAULT_TIMETABLE_SET = "기본";

// 타이포그래피 composite 를 풀어 쓰므로, 그 재료가 되는 원시 토큰은 CSS 로 내보내지 않는다.
const TYPOGRAPHY_PRIMITIVE_GROUPS = new Set([
  "fontFamilies",
  "fontWeights",
  "lineHeights",
  "fontSize",
  "letterSpacing",
  "paragraphSpacing",
  "paragraphIndent",
  "textCase",
  "textDecoration",
]);
// 풀어 쓴 타이포그래피 중 CSS 에서 의미 있는 속성만 남긴다
// (font-family 는 CommonStyles 의 폴백 스택을 덮어쓰지 않도록 제외).
const TYPOGRAPHY_PROPS = new Set([
  "fontWeight",
  "fontSize",
  "lineHeight",
  "letterSpacing",
]);

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const readSet = (name) => readJson(path.join(TOKENS_DIR, `${name}.json`));

const deepMerge = (target, source) => {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !("$value" in value) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
};

const { tokenSetOrder } = readJson(path.join(TOKENS_DIR, "$metadata.json"));
const baseSets = tokenSetOrder.filter((s) => !s.startsWith(TIMETABLE_SET_PREFIX));
const timetableSets = tokenSetOrder
  .filter((s) => s.startsWith(TIMETABLE_SET_PREFIX))
  .map((s) => s.slice(TIMETABLE_SET_PREFIX.length));

for (const name of timetableSets) {
  if (!TIMETABLE_THEME_KEYS[name]) {
    throw new Error(
      `알 수 없는 시간표 테마 세트 "${name}" — scripts/build-tokens.mjs 의 TIMETABLE_THEME_KEYS 에 매핑을 추가하세요.`,
    );
  }
}

register(StyleDictionary);

const isTypographyPrimitive = (token) =>
  TYPOGRAPHY_PRIMITIVE_GROUPS.has(token.path[0]);
const isTypographyPart = (token) =>
  token.$extensions?.["studio.tokens"]?.originalType === "typography" ||
  token.path.length > 1 &&
    ["fontFamily", "paragraphSpacing", "paragraphIndent", "textCase", "textDecoration", ...TYPOGRAPHY_PROPS].includes(
      token.path[token.path.length - 1],
    );

StyleDictionary.registerTransform({
  // Sizing 세트(space/radius)는 Figma 변수 export 라 $type 이 number 다 → px 로.
  name: "intip/size/number-px",
  type: "value",
  filter: (token) => token.$type === "number" && ["space", "radius"].includes(token.path[0]),
  transform: (token) => `${token.$value}px`,
});

StyleDictionary.registerTransform({
  // Tokens Studio 의 숫자 lineHeight 는 px 이다(160% 같은 비율은 ts/size/lineheight 가 1.6 으로 바꿈).
  // 단위 없이 두면 CSS 에서 font-size 배수로 해석되므로 px 를 붙인다.
  name: "intip/size/lineheight-px",
  type: "value",
  transitive: true,
  // 비율(1.6)과 px(16 이상)는 값 크기로 구분한다.
  filter: (token) =>
    token.path[token.path.length - 1] === "lineHeight" &&
    typeof token.$value === "number" &&
    token.$value > 4,
  transform: (token) => `${token.$value}px`,
});

StyleDictionary.registerTransform({
  // global 루트에 놓인 composite 토큰 이름 (src/styles/typography.ts·effects.ts 가 쓰는 이름):
  //   Bottom_Sheet → --bottom-sheet-shadow, elevation.1 → --elevation-1-shadow
  //   title-1.fontSize → --title-1-font-size
  name: "intip/name/kebab",
  type: "name",
  transform: (token) => {
    const kebab = token.path
      .join("-")
      .replace(/_/g, "-")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
    if (token.$type === "shadow") return `${kebab}-shadow`;
    return kebab;
  },
});

StyleDictionary.registerTransform({
  name: "intip/attribute/typography",
  type: "attribute",
  transform: (token) => ({
    typography:
      !isTypographyPrimitive(token) &&
      token.path.length === 2 &&
      TYPOGRAPHY_PROPS.has(token.path[1]),
  }),
});

const cssTransforms = [
  ...StyleDictionary.hooks.transformGroups["tokens-studio"],
  "intip/attribute/typography",
  "intip/size/number-px",
  "intip/size/lineheight-px",
  "intip/name/kebab",
];

const buildDictionary = async (tokens) => {
  const sd = new StyleDictionary({
    tokens,
    preprocessors: ["tokens-studio"],
    expand: { include: ["typography"], typesMap: expandTypesMap },
    log: { verbosity: "silent", warnings: "disabled" },
    platforms: { css: { transforms: cssTransforms } },
  });
  return sd.getPlatformTokens("css");
};

// ── 1. 기본 세트 + 기본 시간표 테마 ─────────────────────────────────────────
const baseTokens = {};
for (const set of baseSets) deepMerge(baseTokens, readSet(set));
deepMerge(baseTokens, readSet(`${TIMETABLE_SET_PREFIX}${DEFAULT_TIMETABLE_SET}`));

const base = await buildDictionary(baseTokens);

const cssVarName = (token) => `--${token.name}`;

// 색상 alias 는 원본 참조({gray.900})를 var(--gray-900)로 남긴다.
const tokenByPath = new Map(base.allTokens.map((t) => [t.path.join("."), t]));
const cssValue = (token) => {
  const original = token.original?.$value;
  if (
    token.$type === "color" &&
    typeof original === "string" &&
    /^\{[^}]+\}$/.test(original)
  ) {
    const ref = tokenByPath.get(original.slice(1, -1));
    if (ref) return `var(${cssVarName(ref)})`;
  }
  return token.$value;
};

const included = base.allTokens.filter(
  (t) =>
    !isTypographyPrimitive(t) &&
    !(t.path.length === 2 && isTypographyPart(t) && !t.attributes?.typography),
);

const GROUP_LABELS = [
  ["Primitive", (t) => ["blue", "gray", "red", "orange", "green", "yellow"].includes(t.path[0])],
  ["Semantic", (t) => ["text", "border", "bg", "interactive", "branding"].includes(t.path[0])],
  ["Timetable", (t) => ["timeTable-color", "tt"].includes(t.path[0])],
  ["Sizing", (t) => ["space", "radius"].includes(t.path[0])],
  ["Typography", (t) => t.attributes?.typography],
  ["Shadow", (t) => t.$type === "shadow"],
];

const groups = new Map(GROUP_LABELS.map(([label]) => [label, []]));
const ungrouped = [];
for (const token of included) {
  const group = GROUP_LABELS.find(([, match]) => match(token));
  (group ? groups.get(group[0]) : ungrouped).push(token);
}
if (ungrouped.length) {
  throw new Error(
    `분류되지 않은 토큰: ${ungrouped.map((t) => t.path.join(".")).join(", ")} — GROUP_LABELS 를 갱신하세요.`,
  );
}

const line = (t) => `  ${cssVarName(t)}: ${cssValue(t)};`;
let css = `/**
 * Do not edit directly — generated by scripts/build-tokens.mjs from tokens/ (Figma Tokens Studio).
 * Run \`npm run build:tokens\` after replacing tokens/ with a new export.
 */

:root {
`;
for (const [label, tokens] of groups) {
  if (!tokens.length) continue;
  css += `  /* ${label} */\n${tokens.map(line).join("\n")}\n\n`;
}
css = css.trimEnd() + "\n}\n";

// ── 2. 시간표 테마 ──────────────────────────────────────────────────────────
const timetableThemes = {};
for (const setName of timetableSets) {
  const themeTokens = await buildDictionary(
    readSet(`${TIMETABLE_SET_PREFIX}${setName}`),
  );
  const colors = [];
  for (const t of themeTokens.allTokens) {
    const match = /^color-(\d+)$/.exec(t.path[1] ?? "");
    if (t.path[0] !== "tt" || !match) continue;
    const index = Number(match[1]);
    colors[index] ??= {};
    colors[index][t.path[2]] = t.$value;
  }
  const key = TIMETABLE_THEME_KEYS[setName];
  timetableThemes[key] = colors;

  const vars = themeTokens.allTokens
    .filter((t) => t.path[0] === "tt")
    .map(line)
    .join("\n");
  css += `\n/* Timetable theme: ${setName} */\n[data-tt-theme="${key}"] {\n${vars}\n}\n`;
}

fs.writeFileSync(CSS_OUT, css);

// ── 3. TS (JS 에서 실제 값이 필요한 곳: 시간표 팔레트, 그림자, 타이포) ────────
const shadows = Object.fromEntries(
  groups.get("Shadow").map((t) => [
    t.path
      .join("-")
      .replace(/_/g, "-")
      .toLowerCase()
      .replace(/-(\w)/g, (_, c) => c.toUpperCase()),
    t.$value,
  ]),
);

const typography = {};
for (const t of groups.get("Typography")) {
  const name = t.path[0].replace(/-(\w)/g, (_, c) => c.toUpperCase());
  typography[name] ??= {};
  typography[name][t.path[1]] = t.$value;
}

const ts = `/**
 * Do not edit directly — generated by scripts/build-tokens.mjs from tokens/ (Figma Tokens Studio).
 * CSS 에서는 src/styles/variables.css 의 var(--...) 를 쓰고, 이 모듈은 JS 에서 실제 값이 필요할 때만 쓴다.
 */

export type TimetableThemeKey = ${Object.keys(timetableThemes)
  .map((k) => JSON.stringify(k))
  .join(" | ")};

export interface TimetableColor {
  bg: string;
  text: string;
}

export const timetableThemes: Record<TimetableThemeKey, readonly TimetableColor[]> = ${JSON.stringify(
  timetableThemes,
  null,
  2,
)};

export const shadows = ${JSON.stringify(shadows, null, 2)} as const;

export const typography = ${JSON.stringify(typography, null, 2)} as const;
`;
fs.writeFileSync(TS_OUT, ts);

console.log(
  `✔ ${path.relative(ROOT, CSS_OUT)} (${included.length} vars, ${timetableSets.length} timetable themes)\n✔ ${path.relative(ROOT, TS_OUT)}`,
);
