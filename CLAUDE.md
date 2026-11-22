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

## 디자인 토큰 (Figma 기준)

- **기준은 Figma 파일(`635X030vnouskAJO8gMsee`)의 로컬 변수·텍스트 스타일·효과 스타일**이다. Tokens Studio는 더 이상 쓰지 않는다. 디자이너는 Figma만 고치고, "동기화"를 요청받으면 Figma MCP(`use_figma`, 읽기 전용)로 읽어 `tokens/`를 갱신한 뒤 `npm run build:tokens`.
- `tokens/`는 Tokens Studio "Export to folder" 형식을 그대로 유지한다(빌드 스크립트가 이 형식을 읽음). Figma → 파일 대응:
  - 변수 컬렉션 `Primitive Token`·`Alias Token`(모드 Light)·`Sizing` → 같은 이름 폴더의 `Value.json`/`Light.json`. 변수 이름 `/` = JSON 중첩, alias는 `{group.step}`, 색은 소문자 hex(알파 있으면 8자리), 기존 `$extensions`(`com.figma.scopes`)는 Figma 변수의 scopes로 맞춘다.
  - `Timetable Theme` 컬렉션의 모드(default·pastelWarm·pastelCool·monotone) → `Timetable Theme/<모드>.json`.
  - 텍스트 스타일(`title/1` 등) → `Primitive Token/Value.json`의 typography 토큰과 그 재료(fontSize·lineHeights·letterSpacing·fontWeights). 효과 스타일(`elevation/1`·`Bottom_Sheet`·`Bubble`) → 같은 파일의 boxShadow 토큰.
  - Figma에서 지워진 변수는 `tokens/`에서도 지운다. 동기화 후 Figma 값과 `tokens/`가 1:1로 같은지 대조해 보고한다.
- `scripts/build-tokens.mjs`가 `src/styles/variables.css`(CSS 변수)와 `src/styles/tokens.ts`(JS에서 실제 값이 필요할 때: 시간표 팔레트 등)를 생성한다. 둘 다 직접 수정 금지.
- 텍스트·효과 스타일은 `src/styles/typography.ts`·`effects.ts`의 css 조각으로 쓴다(`--title-2-font-size`, `--bottom-sheet-shadow` 등). 토큰에 없는 스타일(Floating_Button·Dim, 배경 흐림이 있어 boxShadow 하나로 표현 불가)은 거기 값을 직접 두었다.
- 시간표 테마 세트(`Timetable Theme/*`)는 같은 토큰명을 재정의하므로 `[data-tt-theme="..."]` 스코프 + `timetableThemes`로 분리 출력. 새 테마 세트를 추가하면 스크립트의 `TIMETABLE_THEME_KEYS`에 매핑 필요.
- 색은 역할에 맞는 시맨틱 토큰을 쓴다: 글자 `--text-*`, 배경 `--bg-*`, 테두리 `--border-*`, 버튼 `--interactive-*`. 시맨틱이 없을 때만 원시값(`--gray-600` 등). 토큰은 항상 로드되므로 `var(--x, #fallback)` 폴백은 쓰지 않는다.
  - 파란 채움(버튼·선택 상태·체크박스·배지·진행바)은 전부 `--interactive-primary`(피그마 기준값). `:hover`→`-hover`, `:active`→`-pressed`, `:disabled`→`-disabled`. `-pressed`를 선택 상태 기본색으로 쓰지 않는다. 채움 + 테두리 조합은 `--interactive-primary` + `--border-brand`.

## 제약

- 이 프로젝트는 React 18 고정. react-native / react-native-webview가 의존성 트리에 나타나면 안 된다.
