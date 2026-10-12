# [Phase 4 세부 분석] 실시간 버스 정보 연동 실패 시 프론트엔드 피드백 UI 및 토스 클린 UX 명세

- **관련 이슈**: https://github.com/inu-appcenter/inu-portal-web/issues/451
- **분석 및 대상 파일**: `inu-portal-web/src/apis/busArrival.ts`, `src/hooks/useBusArrival.ts`, `src/components/mobile/bus/map/BusMapPanel.tsx`
- **적용 규칙**: `/toss-clean-ui`, 프로젝트 디자인 토큰(`src/styles/variables.css`)
- **작성일자**: 2026-10-12

---

## 1. 현재 UI의 문제점: 에러 삼킴(Error Swallowing)과 피드백 부재

1. **API 계층의 에러 은폐**:
   - `apis/busArrival.ts`에서 네트워크 오류나 500 에러 발생 시 `catch`하여 빈 배열 `[]`을 반환함.
   - 이로 인해 React Query의 `isError` 상태가 발동하지 않고 성공한 빈 데이터(`data = []`)로 취급됨.
2. **사용자 경험의 왜곡**:
   - 실제로는 "공공데이터포털 또는 서버 연동 일시 오류"임에도 불구하고, 화면에는 단지 **"도착정보 없음"**으로만 노출되어 사용자가 "오늘 버스 운행이 없는가?" 하고 오해하게 만듦.
   - 재시도 액션이 명확히 제공되지 않음.

---

## 2. 토스 스타일 클린 UI/UX 적용 설계

1. **상태(State) 완전성 원칙**:
   - 로딩, 성공, 빈 데이터(정상 무도착), 오류(장애) 4가지 상태를 명확히 분리.
2. **마이크로카피 원칙 (TDS Writing Principles)**:
   - ❌ "오류 코드 500", "API 요청에 실패하였습니다"
   - ⭕ **"실시간 정보를 불러오지 못했어요"** + **"다시 시도하기"**
3. **디자인 토큰 활용 (No AI Slop)**:
   - 배경: `var(--bg-subtle)` (`#F8F9FB`)
   - 텍스트: `var(--text-secondary)` (`#333D4B`)
   - 버튼/포인트: `var(--interactive-primary)` (`#3B82F6`)
