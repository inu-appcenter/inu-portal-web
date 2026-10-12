# [Phase 5 세부 분석] 과거 기록 기반 예측 도착 시간 UI/UX 인지성 고도화 명세

- **관련 이슈**: https://github.com/inu-appcenter/inu-portal-web/issues/451
- **분석 및 대상 파일**: `inu-portal-web/src/components/mobile/bus/map/BusMapPanel.tsx`, `src/components/mobile/bus/BusItem.tsx`
- **적용 규칙**: 카카오맵/네이버지도 벤치마킹, `/toss-clean-ui`, 디자인 토큰(`src/styles/variables.css`)
- **작성일자**: 2026-10-12

---

## 1. 현재 예측 시간표의 인지성 문제점

1. **실시간 버스와의 시각적 경계 모호**:
   - 현재 `BusMapPanel.tsx`는 글자색만 살짝 회색(`var(--gray-600)`)으로 처리하고 우측에 0.5px의 희미한 `[예상 시간표]` 뱃지만 표시함.
2. **치명적인 "곧 도착" 헛걸음 유발**:
   - `getBusDisplayTime`에서 예측 버스임에도 `seconds < 60`이면 실시간 GPS 버스와 똑같이 `"곧 도착"`을 노출함.
   - 과거 통계상 도착할 때가 되었을 뿐, 실제 버스는 아직 오지 않았거나 지연 중일 수 있는데 사용자가 "곧 도착"을 보고 정류장으로 뛰쳐나가게 만들어 불신을 초래함.

---

## 2. 카카오맵 / 네이버 지도 방식의 인지성 정석화

| 구분 | 실시간 GPS 추적 버스 | 과거 기록 기반 예측 버스 |
| :--- | :--- | :--- |
| **도착 시간 표기** | `3분 20초` (또는 `곧 도착`) | **`약 12분` (60초 미만도 `약 1분` 유지)** |
| **상태 뱃지** | `3정류장 전`, `여유` / `보통` | **`⏱️ 이전 기록 기반` (안내 칩)** |
| **텍스트 스타일** | `font-weight: 700`, `var(--text-primary)` | `font-weight: 600`, `var(--text-secondary)` |
| **사용자 힌트** | "실시간 위치 정보" | "과거 운행 패턴 통계 기반 예상 시간이에요" |

---

## 3. 정석적 개선 대책 (Action Items)

1. **`getBusDisplayTime` 분/초 로직 개선**:
   - `isEstimatedArrivalInfo(bus)`인 경우, `seconds < 60`이라도 절대 "곧 도착"을 띄우지 않고 **`약 1분`**으로 표기하여 헛걸음 방지.
2. **상태 배지 마이크로카피 정돈**:
   - `[예상 시간표]` 대신 직관적인 **`⏱️ 이전 기록 기반`**으로 명확화.
3. **프로젝트 토큰 준수**:
   - 임의 HEX 코드 대신 `var(--blue-500)`, `var(--gray-600)`, `var(--border-default)` 활용.
