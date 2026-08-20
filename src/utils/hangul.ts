/**
 * 한글 자모 분해 유틸.
 *
 * 비속어 필터가 "ㅅㅣㅂㅏㄹ"(자모 분리), "ㅅㅂ"(초성), "씨이발"(모음 삽입) 같은
 * 우회 입력을 잡아내려면 완성형 글자를 자모 단위로 펼쳐 비교해야 한다.
 */

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

const CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

const JUNGSUNG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ",
  "ㅣ",
] as const;

const JONGSUNG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

/** 겹자음을 낱자로 편다. "ㅄ" → "ㅂㅅ" (초성 비교 시 필요) */
const CLUSTER_MAP: Record<string, string> = {
  "ㄳ": "ㄱㅅ",
  "ㄵ": "ㄴㅈ",
  "ㄶ": "ㄴㅎ",
  "ㄺ": "ㄹㄱ",
  "ㄻ": "ㄹㅁ",
  "ㄼ": "ㄹㅂ",
  "ㄽ": "ㄹㅅ",
  "ㄾ": "ㄹㅌ",
  "ㄿ": "ㄹㅍ",
  "ㅀ": "ㄹㅎ",
  "ㅄ": "ㅂㅅ",
};

/** 호환 자모 자음(ㄱ~ㅎ) 여부 */
export function isCompatConsonant(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3131 && code <= 0x314e;
}

/** 완성형 한글 음절 여부 */
export function isHangulSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_LAST;
}

/**
 * 문자열을 자모 시퀀스로 분해한다.
 * 완성형이 아닌 문자(자모 낱글자, 영문, 숫자)는 그대로 둔다.
 *
 * "시발" → "ㅅㅣㅂㅏㄹ" / "ㅅㅣㅂㅏㄹ" → "ㅅㅣㅂㅏㄹ"
 */
export function decomposeHangul(text: string): string {
  let result = "";

  for (const char of text) {
    if (!isHangulSyllable(char)) {
      result += char;
      continue;
    }

    const offset = char.charCodeAt(0) - HANGUL_BASE;
    result += CHOSUNG[Math.floor(offset / 588)];
    result += JUNGSUNG[Math.floor((offset % 588) / 28)];
    result += JONGSUNG[offset % 28];
  }

  return result;
}

/**
 * 문자열의 초성만 뽑는다. 완성형이 아닌 자음 낱글자는 그대로 살리되
 * 겹자음은 낱자로 편다("ㅄ" → "ㅂㅅ").
 *
 * "시발" → "ㅅㅂ" / "ㅄ" → "ㅂㅅ"
 */
export function extractChosung(text: string): string {
  let result = "";

  for (const char of text) {
    if (isHangulSyllable(char)) {
      const offset = char.charCodeAt(0) - HANGUL_BASE;
      result += CHOSUNG[Math.floor(offset / 588)];
      continue;
    }

    if (isCompatConsonant(char)) {
      result += CLUSTER_MAP[char] ?? char;
    }
  }

  return result;
}

/** 문자열 전체가 초성(자음 낱글자)으로만 이루어졌는지 */
export function isChosungOnly(text: string): boolean {
  if (!text) return false;
  return [...text].every((char) => isCompatConsonant(char));
}
