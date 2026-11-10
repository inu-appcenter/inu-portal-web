# inu-portal-web

인천대학교 INU 포털 웹 (Vite + React 18 + TypeScript). 네이티브 앱(intip-mobile-app, Expo)의 WebView 안에서도 구동되며, 네이티브↔웹 메시지 계약(intip-bridge)으로 통신한다. 그 브릿지는 **git 서브모듈**(`packages/intip-bridge`)로 소스째 컴파일한다(아래 참고).

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc && vite build`
- `npm run lint` — ESLint (max-warnings 0)

## 공유 브릿지 — git 서브모듈 (npm 패키지 아님)

네이티브↔웹 메시지 계약(`inu-appcenter/intip-bridge`)은 **git 서브모듈** `packages/intip-bridge`로 두고 **소스를 직접 컴파일**한다(`src/utils/bridgeChannel.ts`의 상대경로 import). 더 이상 GitHub Packages에서 설치하지 않는다. `intip-mobile-app`도 동일하게 사용한다.

- **클론**: `git clone --recurse-submodules …`, 또는 일반 클론 후 `git submodule update --init`. CI/Cloudflare도 서브모듈 init 필요(비공개 레포라 git 인증 필요).
- `zod`는 브릿지 소스를 앱에서 컴파일하므로 **직접 의존성**이다(`messages.ts`가 사용).
- vite·tsc는 상대경로 import를 그대로 해석하고, tsc는 import를 따라가며 그 소스만 타입체크한다(서브모듈의 자체 테스트/설정 파일은 `include: ["src"]` 밖이라 컴파일 대상 아님).
- **계약 변경**: 브릿지 레포에서 수정·커밋·push → 각 앱에서 핀 갱신 `git submodule update --remote packages/intip-bridge && git add packages/intip-bridge`. npm publish·버전범프·`npm update` 없음(핀은 semver가 아니라 git SHA).
- 브릿지 소스는 이 웹의 strict tsconfig(`noUnusedLocals` 등)에서도 컴파일돼야 한다.

## 디자인 토큰 (Figma Tokens Studio)

- `tokens/` = Tokens Studio "Export to folder" 결과 그대로. 새 export는 `tokens/`를 통째로 교체 후 `npm run build:tokens`.
- `scripts/build-tokens.mjs`가 `src/styles/variables.css`(CSS 변수)와 `src/styles/tokens.ts`(JS에서 실제 값이 필요할 때: 시간표 팔레트 등)를 생성한다. 둘 다 직접 수정 금지.
- 텍스트·효과 스타일은 `src/styles/typography.ts`·`effects.ts`의 css 조각으로 쓴다(`--title-2-font-size`, `--bottom-sheet-shadow` 등). export에 없는 스타일(heading-3·Floating_Button·Dim·Bubble)은 거기 값을 직접 두었다 — export에 추가되면 변수로 교체.
- 시간표 테마 세트(`Timetable Theme/*`)는 같은 토큰명을 재정의하므로 `[data-tt-theme="..."]` 스코프 + `timetableThemes`로 분리 출력. 새 테마 세트를 추가하면 스크립트의 `TIMETABLE_THEME_KEYS`에 매핑 필요.
- 색은 역할에 맞는 시맨틱 토큰을 쓴다: 글자 `--text-*`, 배경 `--bg-*`, 테두리 `--border-*`, 버튼 `--interactive-*`. 시맨틱이 없을 때만 원시값(`--gray-600` 등). 토큰은 항상 로드되므로 `var(--x, #fallback)` 폴백은 쓰지 않는다.
  - 파란 채움(버튼·선택 상태·체크박스·배지·진행바)은 전부 `--interactive-primary`(피그마 기준값). `:hover`→`-hover`, `:active`→`-pressed`, `:disabled`→`-disabled`. `-pressed`를 선택 상태 기본색으로 쓰지 않는다. 채움 + 테두리 조합은 `--interactive-primary` + `--border-brand`.

## 제약

- 이 프로젝트는 React 18 고정. react-native / react-native-webview가 의존성 트리에 나타나면 안 된다.

## 프론트엔드 서브페이지(SubLayout) 3대 레이아웃/스타일 불변 원칙

1. **상단 헤더 여백 이중 적용 금지 (`padding-top: 0` 필수)**
   - `SubLayout`의 `ContentArea`에서 이미 `--header-height + 12px` 만큼의 `padding-top`을 자동으로 적용하고 있습니다.
   - 개별 서브페이지의 최상단 래퍼(`PageWrapper` 등)에서 `calc(var(--header-height) + ...)`나 임의의 상단 마진/패딩을 추가하면 상단 여백이 2배로 벌어져 콘텐츠가 비정상적으로 밑에서 시작합니다. 서브페이지 최상단 패딩은 반드시 `padding: 0 ...`으로 시작하세요 (`src/pages/mobile/timetable/MobileSyllabusPage.tsx` 참고).

2. **페이지 배경색 개별 하드코딩 금지 및 전역 레이아웃 위임**
   - 페이지 배경색은 `RootLayout` 및 `SubLayout`(`LayoutContainer`)에서 전역 테마 토큰(`var(--bg-muted)`, `var(--bg-base)` 등)으로 일괄 관리합니다.
   - 개별 페이지의 최상단 컨테이너에 `background: var(--bg-base)` 등을 이중으로 덧칠하지 마세요. 특정 페이지에만 전용 배경색이 필요하다면 `useHeader({ pageBgColor })`를 통해 선언하세요.

3. **하단 고정 CTA(Bottom Floating Button) 규격: `z-index: 100` 및 페이드 제외 필수**
   - 전역 레이아웃(`RootLayout`)에 스크롤 엣지 페이드 효과(`BottomScrollEdgeFade`, `z-index: 45`)가 동작하고 있습니다.
   - 하단 고정 CTA 컨테이너(`BottomActionWrapper`, `FixedBottomCTA` 등)는 반드시 **`z-index: 100`** 이상을 주어야 하단 그라디언트에 덮이지 않습니다.
   - 또한 `src/components/common/BottomScrollEdgeFade.tsx`의 `isBottomEdgeFadeExcluded` 함수에 해당 페이지 경로를 제외 항목으로 등록하여 불필요한 하단 페이드 오버레이가 생기지 않도록 하세요.
