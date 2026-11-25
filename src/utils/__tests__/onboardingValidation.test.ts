import { describe, expect, it } from "vitest";
import { validateNickname, validateRealName } from "../onboardingValidation";

describe("validateRealName", () => {
  it("빈 값은 에러를 띄우지 않는다", () => {
    expect(validateRealName("")).toBe("");
  });

  it("한글·영문 2~10자만 통과한다", () => {
    expect(validateRealName("이정현")).toBe("");
    expect(validateRealName("Jung Hyun")).toBe("");
    expect(validateRealName("이정현1")).not.toBe("");
    expect(validateRealName("이")).not.toBe("");
    expect(validateRealName("가나다라마바사아자차카")).not.toBe("");
    expect(validateRealName("이Jung")).not.toBe("");
  });
});

describe("validateNickname", () => {
  it("길이를 검사한다", () => {
    expect(validateNickname("야")).toBe("2자 이상 입력해주세요.");
    expect(validateNickname("가나다라마바사아자차카")).toBe("10자 이내로 입력해주세요.");
    expect(validateNickname("야르렁")).toBe("");
  });

  it("학번과 같은 닉네임을 막는다", () => {
    expect(validateNickname("202501234", "202501234")).toBe("학번은 닉네임으로 쓸 수 없어요.");
  });

  it("금지어를 띄어쓰기·대소문자와 상관없이 막는다", () => {
    expect(validateNickname("인팁 운영자")).toBe("'운영자', '인팁' 같은 단어는 쓸 수 없어요.");
    expect(validateNickname("Ad min")).toBe("'admin' 같은 단어는 쓸 수 없어요.");
  });
});
