import { describe, expect, it } from "vitest";
import { resolveNotificationTarget } from "../notificationTarget";

describe("resolveNotificationTarget", () => {
  it("포털 내부 경로는 쿼리스트링까지 그대로 유지한다", () => {
    expect(resolveNotificationTarget("/councilnoticedetail?id=456")).toEqual({
      kind: "internal",
      path: "/councilnoticedetail?id=456",
    });
  });

  it("현재 포털 호스트의 절대 URL은 내부 이동으로 바꾼다", () => {
    const url = "https://intip.inuappcenter.kr/home/tips/12?tab=reply#reply-3";

    expect(resolveNotificationTarget(url, "intip.inuappcenter.kr")).toEqual({
      kind: "internal",
      path: "/home/tips/12?tab=reply#reply-3",
    });
  });

  it("학교 공지 등 외부 링크는 외부 이동으로 판정한다", () => {
    expect(
      resolveNotificationTarget(
        "https://www.inu.ac.kr/bbs/inu/246/1/artclView.do",
        "intip.inuappcenter.kr",
      ),
    ).toEqual({
      kind: "external",
      url: "https://www.inu.ac.kr/bbs/inu/246/1/artclView.do",
    });
  });

  it("path가 없거나 비어 있으면 null을 반환해 type 분기로 폴백시킨다", () => {
    expect(resolveNotificationTarget(undefined)).toBeNull();
    expect(resolveNotificationTarget(null)).toBeNull();
    expect(resolveNotificationTarget("   ")).toBeNull();
  });

  it("경로도 URL도 아닌 값은 null이다", () => {
    expect(resolveNotificationTarget("home/tips/12")).toBeNull();
  });

  it("프로토콜 상대 URL과 http(s)가 아닌 스킴은 열지 않는다", () => {
    expect(resolveNotificationTarget("//www.inu.ac.kr/notice")).toBeNull();
    expect(resolveNotificationTarget("javascript:alert(1)")).toBeNull();
  });
});
