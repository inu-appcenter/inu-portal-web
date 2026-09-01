import { describe, expect, it } from "vitest";
import {
  buildProfanityAlertMessage,
  checkProfanity,
  checkProfanityInFields,
} from "../profanityFilter";

describe("checkProfanity - 정상 문장", () => {
  it("일반적인 문장은 통과시킨다", () => {
    const texts = [
      "오늘 학식 뭐 나와요?",
      "도서관 자리 있나요? 시험기간이라 자리가 없네요",
      "2024년 졸업요건 알려주실 분 계신가요",
      "그 영화 아직 보지 못했어요",
      "어제 늦게까지 자지 않고 공부했습니다",
      "불이 꺼져 있어서 그냥 돌아왔어요",
      "강의실 불이 꺼져요",
      "미친 듯이 더운 날씨네요",
      "이번 버스의 시발점은 정문입니다",
      "새끼발가락을 찧었어요",
      "닥쳐오는 시험이 무섭습니다",
      "서랍을 뒤져보니 학생증이 나왔어요",
    ];

    texts.forEach((text) => {
      expect(checkProfanity(text).hasProfanity, text).toBe(false);
    });
  });

  it("오픈소스 사전의 오탐 유발 단어는 제외했다", () => {
    // badwords-ko 목록에 들어 있지만 정상 문장에서 흔히 쓰이는 단어들
    const texts = [
      "뚝배기 불고기 맛집 추천해주세요",
      "지뢰찾기 게임 좋아하시는 분",
      "찍찍이 신발 어디서 사요?",
      "의자가 삐걱거려요",
      "여기 존맛탱이에요 존잼",
      "이번 과제 진짜 병맛이다",
      "자살예방 상담센터 연락처 공유합니다",
      "걸레로 책상 닦았어요",
      "택시 스루 결제 되나요",
    ];

    texts.forEach((text) => {
      expect(checkProfanity(text).hasProfanity, text).toBe(false);
    });
  });
});

describe("checkProfanity - 검출", () => {
  it("명백한 욕설을 검출한다", () => {
    expect(checkProfanity("씨발 진짜 짜증나네").hasProfanity).toBe(true);
    expect(checkProfanity("이 병신아").hasProfanity).toBe(true);
    expect(checkProfanity("지랄하지 마").hasProfanity).toBe(true);
    expect(checkProfanity("what the fuck").hasProfanity).toBe(true);
  });

  it("오픈소스 사전에만 있는 욕설도 검출한다", () => {
    expect(checkProfanity("이 시방새야").hasProfanity).toBe(true);
    expect(checkProfanity("개념빠가 같으니").hasProfanity).toBe(true);
    expect(checkProfanity("아가리 닥치라고").hasProfanity).toBe(true);
  });

  it("키보드 자판 우회(tlqkf)를 검출한다", () => {
    expect(checkProfanity("tlqkf 뭐야").hasProfanity).toBe(true);
    expect(checkProfanity("wlfkf 하네").hasProfanity).toBe(true);
  });

  it("특수문자로 우회한 욕설을 검출한다", () => {
    expect(checkProfanity("씨*발").hasProfanity).toBe(true);
    expect(checkProfanity("시.발").hasProfanity).toBe(true);
    expect(checkProfanity("병_신").hasProfanity).toBe(true);
    expect(checkProfanity("시1발").hasProfanity).toBe(true);
  });

  it("글자 반복으로 우회한 욕설을 검출한다", () => {
    expect(checkProfanity("씨발발발").hasProfanity).toBe(true);
    expect(checkProfanity("지랄랄랄").hasProfanity).toBe(true);
  });

  it("모음 삽입으로 우회한 욕설을 검출한다", () => {
    expect(checkProfanity("씨이발").hasProfanity).toBe(true);
    expect(checkProfanity("시이이발").hasProfanity).toBe(true);
    expect(checkProfanity("병시인").hasProfanity).toBe(true);
  });

  it("공백으로 우회한 욕설을 검출한다", () => {
    expect(checkProfanity("시 발").hasProfanity).toBe(true);
    expect(checkProfanity("병 신 같 네").hasProfanity).toBe(true);
    expect(checkProfanity("개 새 끼").hasProfanity).toBe(true);
  });

  it("자모를 분리해 우회한 욕설을 검출한다", () => {
    expect(checkProfanity("ㅅㅣㅂㅏㄹ").hasProfanity).toBe(true);
    expect(checkProfanity("ㅂㅕㅇㅅㅣㄴ").hasProfanity).toBe(true);
    expect(checkProfanity("ㅈㅣㄹㅏㄹ 하네").hasProfanity).toBe(true);
  });

  it("초성 욕설을 검출한다", () => {
    expect(checkProfanity("ㅅㅂ 뭐야").hasProfanity).toBe(true);
    expect(checkProfanity("ㅄ").hasProfanity).toBe(true);
    expect(checkProfanity("ㅋㅋㅋㅈㄹ").hasProfanity).toBe(true);
  });

  it("초성 검사는 초성만으로 된 토큰에만 적용한다", () => {
    // "수박"의 초성은 ㅅㅂ이지만 완성형 문장이므로 검출되지 않아야 한다
    expect(checkProfanity("수박 사러 갈 사람").hasProfanity).toBe(false);
    expect(checkProfanity("사복 입고 오세요").hasProfanity).toBe(false);
  });

  it("검출된 금칙어를 반환한다", () => {
    const result = checkProfanity("씨발 병신아");

    expect(result.matched).toContain("씨발");
    expect(result.matched).toContain("병신");
  });

  it("빈 문자열은 통과시킨다", () => {
    expect(checkProfanity("").hasProfanity).toBe(false);
    expect(checkProfanity("   ").hasProfanity).toBe(false);
  });
});

describe("checkProfanityInFields", () => {
  it("여러 필드를 한 번에 검사하고 결과를 합친다", () => {
    const result = checkProfanityInFields("정상 제목", "씨발", null, undefined);

    expect(result.hasProfanity).toBe(true);
    expect(result.matched).toContain("씨발");
  });

  it("모든 필드가 정상이면 통과시킨다", () => {
    expect(
      checkProfanityInFields("시험 정보 공유", "다음 주 시험 범위 아시는 분?")
        .hasProfanity,
    ).toBe(false);
  });
});

describe("buildProfanityAlertMessage", () => {
  it("무관용 원칙을 안내에 포함한다", () => {
    const message = buildProfanityAlertMessage(["씨발"]);

    expect(message).toContain("씨발");
    expect(message).toContain("무관용");
  });

  it("검출어가 없어도 안내 문구를 만든다", () => {
    expect(buildProfanityAlertMessage([])).toContain("무관용");
  });
});
