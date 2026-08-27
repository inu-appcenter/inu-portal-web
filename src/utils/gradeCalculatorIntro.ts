/**
 * 학점계산기에 새로 붙은 기능(졸업요건 진단 · 성적 붙여넣기)을 처음 들어온
 * 사용자에게 한 번만 소개하기 위한 플래그.
 *
 * 소개할 내용이 크게 바뀌면 키 뒤 버전을 올려 다시 한 번 보여준다.
 */
const GRADE_CALCULATOR_INTRO_SEEN_KEY = "grade-calculator-intro-seen-v1";

function getSafeLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function hasSeenGradeCalculatorIntro() {
  const storage = getSafeLocalStorage();

  // 저장할 곳이 없으면 "이미 봤다"로 처리한다. 매번 뜨는 것보다 안 뜨는 쪽이 낫다.
  if (!storage) {
    return true;
  }

  try {
    return storage.getItem(GRADE_CALCULATOR_INTRO_SEEN_KEY) === "true";
  } catch (error) {
    console.error("Failed to read grade calculator intro state", error);
    return true;
  }
}

export function markGradeCalculatorIntroSeen() {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(GRADE_CALCULATOR_INTRO_SEEN_KEY, "true");
  } catch (error) {
    console.error("Failed to save grade calculator intro state", error);
  }
}
