import {
  BANNED_WORDS,
  CHOSUNG_WORDS,
  EVASION_WORDS,
  LIBRARY_EXCLUSIONS,
  LIBRARY_WORDS,
  SAFE_WORDS,
} from "../resources/strings/bannedWords";
import { decomposeHangul, extractChosung, isChosungOnly } from "./hangul";

/**
 * 비속어 필터.
 *
 * 자체 금칙어 + 오픈소스 사전(badwords-ko)을 여러 단계로 검사한다.
 *
 * 1. 문자 단계  : 특수문자 제거·반복 축약 후 그대로 비교 ("씨*발", "씨발발발")
 * 2. 공백 제거  : 어절을 붙여 비교 ("시 발")
 * 3. 자모 단계  : 자모로 펼쳐 비교 ("ㅅㅣㅂㅏㄹ")
 * 4. 자모 + ㅇ 제거 : 모음 삽입 우회 대응 ("씨이발", "시이이발")
 * 5. 초성 단계  : 초성만 입력한 경우 대응 ("ㅅㅂ", "ㅄ", "ㅈㄹ")
 *
 * 3~5단계는 정상 문장을 오탐할 여지가 있어, 우회 목적으로 쓰일 확률이 높은
 * 어근(EVASION_WORDS)에만 적용한다.
 */

export interface ProfanityCheckResult {
  /** 금칙어가 검출됐는지 */
  hasProfanity: boolean;
  /** 검출된 금칙어(중복 제거) */
  matched: string[];
}

/** 검사 키와 원본 단어 쌍 */
interface WordKey {
  key: string;
  word: string;
}

/** 한글(완성형/자모), 영문, 숫자, 공백만 남기고 나머지는 우회용 장식으로 보고 제거 */
const KEEP_PATTERN = /[^가-힣ㄱ-ㅎㅏ-ㅣa-z0-9\s]/g;

/**
 * 문자 단계 정규화.
 * - 소문자화, 유니코드 정규화
 * - 특수문자 제거 ("시*발" → "시발")
 * - 같은 글자 반복 축약 ("시발발발" → "시발")
 * - 연속 공백 축약
 */
function normalize(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(KEEP_PATTERN, "")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** 공백까지 제거 */
function squeeze(text: string): string {
  return normalize(text).replace(/\s/g, "");
}

/** 자모로 펼친 뒤 공백 제거 + 반복 축약 */
function toJamo(text: string): string {
  return decomposeHangul(normalize(text))
    .replace(/\s/g, "")
    .replace(/(.)\1+/g, "$1");
}

/**
 * 자모 단계에서 무음가 'ㅇ'까지 지운다.
 * "씨이발" → ㅆㅣㅇㅣㅂㅏㄹ → (ㅇ 제거) ㅆㅣㅣㅂㅏㄹ → (반복 축약) ㅆㅣㅂㅏㄹ = 씨발
 */
function toJamoWithoutFiller(text: string): string {
  return decomposeHangul(normalize(text))
    .replace(/[\sㅇ]/g, "")
    .replace(/(.)\1+/g, "$1");
}

/** 초성만 추출 */
function toChosung(text: string): string {
  return extractChosung(normalize(text));
}

type Transform = (text: string) => string;

function buildIndex(
  words: readonly string[],
  transform: Transform,
  minKeyLength: number,
): WordKey[] {
  const seen = new Set<string>();
  const index: WordKey[] = [];

  words.forEach((word) => {
    const key = transform(word);
    if (key.length < minKeyLength || seen.has(key)) return;
    seen.add(key);
    index.push({ key, word });
  });

  return index;
}

/**
 * 오픈소스 사전에서 오탐 유발 항목을 걸러낸 목록.
 * 라이브러리 목록에는 "뚝배기", "지뢰", "존맛"처럼 정상 문장을 막는 항목이 섞여 있다.
 */
function getCuratedLibraryWords(): string[] {
  const excluded = new Set(LIBRARY_EXCLUSIONS.map((word) => normalize(word)));

  return LIBRARY_WORDS.filter((word) => {
    const key = normalize(word);
    // 정규화 후 1글자가 되는 항목은 광범위하게 오탐한다("쳐-" → "쳐").
    return key.length >= 2 && !excluded.has(key);
  });
}

// 단어 목록은 고정이므로 첫 검사 때 한 번만 인덱싱한다.
let indexes: {
  literal: WordKey[];
  squeezed: WordKey[];
  jamo: WordKey[];
  jamoNoFiller: WordKey[];
  chosung: WordKey[];
  safe: {
    literal: string[];
    squeezed: string[];
    jamo: string[];
    jamoNoFiller: string[];
  };
} | null = null;

function getIndexes() {
  if (indexes) return indexes;

  const allBanned = [...BANNED_WORDS, ...getCuratedLibraryWords()];

  indexes = {
    literal: buildIndex(allBanned, normalize, 1),
    squeezed: buildIndex(EVASION_WORDS, squeeze, 2),
    jamo: buildIndex(EVASION_WORDS, toJamo, 4),
    jamoNoFiller: buildIndex(EVASION_WORDS, toJamoWithoutFiller, 4),
    chosung: buildIndex([...EVASION_WORDS, ...CHOSUNG_WORDS], toChosung, 2),
    safe: {
      literal: SAFE_WORDS.map(normalize),
      squeezed: SAFE_WORDS.map(squeeze),
      jamo: SAFE_WORDS.map(toJamo),
      jamoNoFiller: SAFE_WORDS.map(toJamoWithoutFiller),
    },
  };

  return indexes;
}

/** haystack 안에서 needle이 등장하는 모든 시작 인덱스 */
function findAllIndexes(haystack: string, needle: string): number[] {
  const found: number[] = [];
  let from = 0;

  while (from <= haystack.length - needle.length) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) break;
    found.push(at);
    from = at + 1;
  }

  return found;
}

/** [start, end) 구간이 정상 단어(SAFE_WORDS)에 포함되는지 */
function isCoveredBySafeWord(
  haystack: string,
  start: number,
  end: number,
  safeKeys: string[],
): boolean {
  return safeKeys.some((safeKey) => {
    if (!safeKey) return false;

    return findAllIndexes(haystack, safeKey).some(
      (safeStart) =>
        safeStart <= start &&
        start < safeStart + safeKey.length &&
        end <= safeStart + safeKey.length,
    );
  });
}

function collectMatches(
  haystack: string,
  index: WordKey[],
  safeKeys: string[],
  into: Set<string>,
): void {
  if (!haystack) return;

  index.forEach(({ key, word }) => {
    const hit = findAllIndexes(haystack, key).some(
      (start) =>
        !isCoveredBySafeWord(haystack, start, start + key.length, safeKeys),
    );

    if (hit) into.add(word);
  });
}

/**
 * 초성만 입력된 토큰("ㅋㅋㅅㅂ")에서만 초성 패턴을 검사한다.
 * 일반 문장의 초성을 뽑아 비교하면 "수박"→"ㅅㅂ"처럼 오탐이 심해진다.
 */
function collectChosungMatches(
  text: string,
  index: WordKey[],
  into: Set<string>,
): void {
  const tokens = normalize(text)
    .split(" ")
    .filter((token) => isChosungOnly(token));

  if (tokens.length === 0) return;

  const haystack = tokens.map((token) => extractChosung(token)).join(" ");

  index.forEach(({ key, word }) => {
    if (haystack.includes(key)) into.add(word);
  });
}

/**
 * 텍스트에 금칙어가 포함돼 있는지 검사한다.
 */
export function checkProfanity(text: string): ProfanityCheckResult {
  const matched = new Set<string>();

  if (text && text.trim()) {
    const idx = getIndexes();

    collectMatches(normalize(text), idx.literal, idx.safe.literal, matched);
    collectMatches(squeeze(text), idx.squeezed, idx.safe.squeezed, matched);
    collectMatches(toJamo(text), idx.jamo, idx.safe.jamo, matched);
    collectMatches(
      toJamoWithoutFiller(text),
      idx.jamoNoFiller,
      idx.safe.jamoNoFiller,
      matched,
    );
    collectChosungMatches(text, idx.chosung, matched);
  }

  return {
    hasProfanity: matched.size > 0,
    matched: [...matched],
  };
}

/** 여러 필드(제목·내용 등)를 한 번에 검사 */
export function checkProfanityInFields(
  ...texts: (string | undefined | null)[]
): ProfanityCheckResult {
  const matched = new Set<string>();

  texts.forEach((text) => {
    if (!text) return;
    checkProfanity(text).matched.forEach((word) => matched.add(word));
  });

  return {
    hasProfanity: matched.size > 0,
    matched: [...matched],
  };
}

/** 사용자에게 보여줄 차단 안내 문구 */
export function buildProfanityAlertMessage(matched: string[]): string {
  const preview = matched.slice(0, 3).join(", ");

  return [
    "부적절한 표현이 포함되어 등록할 수 없습니다.",
    preview ? `(검출된 표현: ${preview})` : "",
    "",
    "INTIP은 욕설·혐오·성적 표현에 무관용 원칙을 적용합니다.",
    "반복 위반 시 이용이 제한될 수 있습니다.",
  ]
    .filter(Boolean)
    .join("\n");
}
