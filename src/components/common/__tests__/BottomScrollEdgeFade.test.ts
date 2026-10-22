import { describe, it, expect } from "vitest";
import {
  isBottomEdgeFadeExcluded,
  computeScrollFadeState,
} from "../BottomScrollEdgeFade";

describe("BottomScrollEdgeFade 로직 및 엣지 케이스 단위 검증", () => {
  describe("isBottomEdgeFadeExcluded (예외 경로 판별)", () => {
    it("바텀바가 있는 메인 화면들(홈, 시간표, 채팅 목록, 마이페이지, 버스, 저장 등)은 반드시 예외로 처리되어야 한다", () => {
      // 루트 및 홈
      expect(isBottomEdgeFadeExcluded("/")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/home")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m/home")).toBe(true);

      // 시간표 메인
      expect(isBottomEdgeFadeExcluded("/timetable")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m/timetable")).toBe(true);

      // 채팅 목록 메인
      expect(isBottomEdgeFadeExcluded("/chat/list")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m/chat/list")).toBe(true);

      // 마이페이지 메인
      expect(isBottomEdgeFadeExcluded("/mypage")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m/mypage")).toBe(true);

      // 버스 메인
      expect(isBottomEdgeFadeExcluded("/bus")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m/bus")).toBe(true);

      // 저장/스크랩 메인
      expect(isBottomEdgeFadeExcluded("/save")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/m/save")).toBe(true);
    });

    it("채팅방 경로는 독립 스크롤 및 입력창이 있으므로 예외로 처리되어야 한다", () => {
      expect(isBottomEdgeFadeExcluded("/chat/123")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/chat/room/456")).toBe(true);
    });

    it("모의 수강신청 시뮬레이터(/timetable/simulator)는 풀스크린 웹뷰이므로 예외로 처리되어야 한다", () => {
      expect(isBottomEdgeFadeExcluded("/timetable/simulator")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/timetable/simulator?term=2026-1")).toBe(true);
    });

    it("AI 에이전트 및 어시스턴트 화면은 예외로 처리되어야 한다", () => {
      expect(isBottomEdgeFadeExcluded("/agent")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/assistant")).toBe(true);
    });

    it("모바일 기숙사/학생증 카드는 풀스크린 뷰이므로 예외로 처리되어야 한다", () => {
      expect(isBottomEdgeFadeExcluded("/dormitory/card")).toBe(true);
      expect(isBottomEdgeFadeExcluded("/labs/portal/dormitory/card")).toBe(true);
    });

    it("바텀바가 없는 일반 서브페이지들은 예외가 아니므로 false를 반환해야 한다", () => {
      expect(isBottomEdgeFadeExcluded("/timetable/compare")).toBe(false);
      expect(isBottomEdgeFadeExcluded("/friend/list")).toBe(false);
      expect(isBottomEdgeFadeExcluded("/home/notice")).toBe(false);
      expect(isBottomEdgeFadeExcluded("/home/cafeteria")).toBe(false);
      expect(isBottomEdgeFadeExcluded("/timetable/filter")).toBe(false);
      expect(isBottomEdgeFadeExcluded("/timetable/calculator")).toBe(false);
      expect(isBottomEdgeFadeExcluded("/timetable/wizard")).toBe(false);
    });
  });

  describe("computeScrollFadeState (스크롤 상태 계산)", () => {
    it("예외 플래그(isExcluded)가 true이면 스크롤과 무관하게 항상 false(숨김)이어야 한다", () => {
      const state = computeScrollFadeState({
        scrollY: 100,
        viewportHeight: 800,
        scrollHeight: 3000,
        isExcluded: true,
      });
      expect(state).toBe(false);
    });

    it("페이지 길이가 뷰포트보다 짧거나 같으면(스크롤 불필요) false(숨김)이어야 한다", () => {
      // 뷰포트(800)와 거의 같거나 작은 경우
      const shortPage = computeScrollFadeState({
        scrollY: 0,
        viewportHeight: 800,
        scrollHeight: 750,
        isExcluded: false,
      });
      expect(shortPage).toBe(false);

      // 최소 12px 임계치 미만
      const barelyOverflow = computeScrollFadeState({
        scrollY: 0,
        viewportHeight: 800,
        scrollHeight: 810,
        isExcluded: false,
      });
      expect(barelyOverflow).toBe(false);
    });

    it("스크롤 가능한 긴 페이지에서 최상단/중간 스크롤 시 true(노출)이어야 한다", () => {
      // 최상단
      const topState = computeScrollFadeState({
        scrollY: 0,
        viewportHeight: 800,
        scrollHeight: 2000,
        isExcluded: false,
      });
      expect(topState).toBe(true);

      // 중간 지점 스크롤
      const midState = computeScrollFadeState({
        scrollY: 600,
        viewportHeight: 800,
        scrollHeight: 2000,
        isExcluded: false,
      });
      expect(midState).toBe(true);
    });

    it("스크롤이 최하단에 도달하면 부드럽게 사라지도록 false(숨김)이어야 한다", () => {
      // 정확한 최하단 (scrollY: 1200, 1200 + 800 = 2000)
      const exactBottom = computeScrollFadeState({
        scrollY: 1200,
        viewportHeight: 800,
        scrollHeight: 2000,
        isExcluded: false,
      });
      expect(exactBottom).toBe(false);

      // 오차 버퍼 8px 이내 (scrollY: 1195, 1195 + 800 = 1995 >= 1992)
      const bufferBottom = computeScrollFadeState({
        scrollY: 1195,
        viewportHeight: 800,
        scrollHeight: 2000,
        isExcluded: false,
      });
      expect(bufferBottom).toBe(false);
    });

    it("최하단 버퍼 바로 직전(더 읽을 내용 남음)에는 true(노출)이어야 한다", () => {
      // 9px 남음 (scrollY: 1190, 1190 + 800 = 1990 < 1992)
      const justAboveBottom = computeScrollFadeState({
        scrollY: 1190,
        viewportHeight: 800,
        scrollHeight: 2000,
        isExcluded: false,
      });
      expect(justAboveBottom).toBe(true);
    });
  });
});
