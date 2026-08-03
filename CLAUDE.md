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

## 제약

- 이 프로젝트는 React 18 고정. react-native / react-native-webview가 의존성 트리에 나타나면 안 된다.
