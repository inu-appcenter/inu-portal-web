# [Phase 1 세부 분석] 프론트엔드 임의 시간 가공 로직 검증 및 영향도 분석

- **관련 이슈**: https://github.com/inu-appcenter/inu-portal-web/issues/451
- **분석 대상 파일**: `inu-portal-web/src/hooks/useBusArrival.ts`, `inu-portal-web/src/components/mobile/bus/map/BusMapPanel.tsx`
- **작성일자**: 2026-10-12

---

## 1. 현황 및 문제점 분석

### 1.1 `setInterval` 기반 1초 강제 카운트다운의 오차 증폭 메커니즘
`useBusArrival.ts`의 133~165 라인은 브라우저에서 매 1초마다 `seconds - 1` 연산을 수행하여 `arrivalInfo.seconds`를 기계적으로 차감하고 있습니다.

```typescript
// useBusArrival.ts (현행)
useEffect(() => {
  const timer = window.setInterval(() => {
    setBusArrivalList((prev) =>
      prev.map((bus) => {
        const info = bus.arrivalInfo;
        if (!info || typeof info.seconds !== "number" || info.seconds <= 0) {
          return bus;
        }
        const nextSeconds = info.seconds - 1;
        if (nextSeconds <= 0) {
          return {
            ...bus,
            arrivalInfo: { time: "도착정보 없음", seconds: 0, isLastBus: false },
          };
        }
        return {
          ...bus,
          arrivalInfo: {
            ...info,
            seconds: nextSeconds,
            time: toTime(nextSeconds),
          },
        };
      })
    );
  }, 1000);
  return () => window.clearInterval(timer);
}, []);
```

#### 💥 발생하는 심각한 체감 오차:
1. **도로 교통의 비선형성 무시**:
   - 버스는 신호 대기, 승하차 지연, 교차로 정체 등으로 인해 1초에 1초씩 남은 시간이 줄어들지 않습니다. 오히려 정체 구간에서는 3분 남았던 버스가 4분으로 늘어나는 것이 정상입니다.
   - 클라이언트가 1초마다 남은 시간을 강제로 줄여버리면, 실제 버스는 아직 오지 않았는데 화면의 타이머만 급속도로 줄어들어 **"앱에는 30초 남았다고 했는데 버스가 안 온다"**는 심각한 불일치가 발생합니다.
2. **0초 도달 시 강제 증발 (Flickering & Ghost Bus)**:
   - `nextSeconds <= 0`이 되면 다음 서버 폴링(최대 30초 후)까지 기다리지 않고, 그 즉시 `{ time: "도착정보 없음", seconds: 0 }`으로 덮어씁니다.
   - 사용자는 "방금 5초 남았다고 했는데 버스가 증발했다", "버스가 날아갔나?" 하는 혼란을 겪게 됩니다.
3. **카운트다운 중 30초 폴링 시 시간 역류 (Rubber-banding)**:
   - 클라이언트에서 40초를 10초까지 깎았는데, 30초 후 서버에서 신호 대기 중이던 버스의 새 데이터(`35초`)가 오면, 시간이 10초에서 갑자기 35초로 25초 뒤로 점프합니다.

---

## 2. 카카오맵 / 네이버 지도 벤치마킹

| 항목 | 카카오맵 / 네이버 지도 | intip 현행 |
| :--- | :--- | :--- |
| **표기 단위** | **분 단위 중심** (`약 3분`, `약 12분`) | 초 단위 기계적 카운트다운 (`3분 12초` -> `3분 11초`) |
| **1분 미만 표기** | `"곧 도착"` 유지 (0초로 줄이지 않음) | 1초씩 깎다가 0초 시 `"도착정보 없음"` 강제 증발 |
| **서버 갱신 방식** | 서버 응답 폴링 시점에만 부드럽게 갱신 | 브라우저 단독 루프가 값을 계속 왜곡 |

---

## 3. 정석적인 개선 대책 (Proposed Fix)

1. **등속 초 단위 카운트다운 폐지**:
   - 카카오맵처럼 **분 단위(`N분`) 또는 `곧 도착` 중심**으로 표시하고, 불필요하게 사용자를 불안하게 만드는 1초 등속 차감을 제거합니다.
2. **0초 증발 방지 및 '도착 임박' 보존**:
   - 남은 시간이 60초 미만이거나 0초에 근접해도 다음 서버 응답이 올 때까지 데이터를 지우지 않고 `"곧 도착 (도착 임박)"` 상태를 유지합니다.
3. **타임스탬프 슬라이딩 동기화**:
   - 클라이언트 로컬 시계 왜곡을 피하기 위해, 서버가 데이터를 수집한 시점(`observedAt`)과 현재 시각의 상대적 경과만을 계산하여 일관성을 확보합니다.
