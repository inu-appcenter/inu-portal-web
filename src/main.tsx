import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import CommonStyles from "@/styles/CommonStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { initMixpanel } from "./utils/mixpanel";
import { startPwaCleanup } from "./utils/pwaCleanup";
import { isLegacyHost } from "./utils/legacyHost";
import LegacyHostBlockScreen from "@/components/common/LegacyHostBlockScreen";
import "@/utils/bridgeChannel"; // 신 앱 PlatformChannel 초기화 + Native→Web 수신 결선
import "@/styles/variables.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// 구 도메인(intip-test.pages.dev) 접속은 앱 초기화 없이 안내 화면만 띄우고 끝낸다.
// 자세한 배경은 utils/legacyHost.ts 참고.
if (isLegacyHost()) {
  root.render(<LegacyHostBlockScreen />);
} else {
  bootApp();
}

function bootApp() {
  initMixpanel();

  // 옛 PWA·임시 핫픽스 워커의 잔재를 회수한다. 자세한 배경은 utils/pwaCleanup.ts 참고.
  startPwaCleanup();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

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
