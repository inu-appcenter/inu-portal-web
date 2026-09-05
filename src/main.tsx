import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import CommonStyles from "@/styles/CommonStyles";
import { QueryClientProvider } from "@tanstack/react-query";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { queryClient } from "@/lib/queryClient";
import { initMixpanel } from "./utils/mixpanel";
import { startPwaCleanup } from "./utils/pwaCleanup";
import { isLegacyHost, isLegacyHostBypassed, rememberLegacyHostBypass } from "./utils/legacyHost";
import LegacyHostBlockScreen from "@/components/common/LegacyHostBlockScreen";
import "@/utils/bridgeChannel"; // 신 앱 PlatformChannel 초기화 + Native→Web 수신 결선
import "@/styles/variables.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// 구 도메인(intip-test.pages.dev) 접속은 앱 초기화 전에 안내 화면부터 띄운다.
// "그래도 들어가기"를 누르면 그 자리에서 평소대로 앱을 띄운다.
// 자세한 배경은 utils/legacyHost.ts 참고.
if (isLegacyHost() && !isLegacyHostBypassed()) {
  root.render(<LegacyHostBlockScreen onContinue={handleLegacyHostContinue} />);
} else {
  bootApp();
}

function handleLegacyHostContinue() {
  rememberLegacyHostBypass();
  bootApp();
}

function bootApp() {
  initMixpanel();

  // 옛 PWA·임시 핫픽스 워커의 잔재를 회수한다. 자세한 배경은 utils/pwaCleanup.ts 참고.
  startPwaCleanup();

  try {
    // RN 멀티 웹뷰 환경에서 같은 오리진의 다른 웹뷰(또는 브라우저 탭)와 쿼리
    // 캐시를 동기화한다. broadcast-channel(pubkey) 기반이라 BroadcastChannel
    // 미지원/제한 환경에서도 자체적으로 localStorage/IndexedDB 등으로 폴백한다.
    broadcastQueryClient({
      queryClient,
      broadcastChannel: "query-cache-sync",
    });
  } catch (e) {
    console.warn("broadcastQueryClient initialization skipped or failed:", e);
  }

  root.render(
    <>
      <QueryClientProvider client={queryClient}>
        <CommonStyles />
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </QueryClientProvider>
    </>,
  );
}
