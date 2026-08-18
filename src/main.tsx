import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import CommonStyles from "@/styles/CommonStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { initMixpanel } from "./utils/mixpanel";
import "@/utils/bridgeChannel"; // 신 앱 PlatformChannel 초기화 + Native→Web 수신 결선
import "@/styles/variables.css";

initMixpanel();

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  let refreshing = false;
  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // The first install also claims this page. Reloading then would cause an
    // unnecessary first-load flicker, so reload only for an actual update.
    if (hadController && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  navigator.serviceWorker
    .register("/sw.js", { updateViaCache: "none" })
    .then((registration) => {
      const activateWaitingWorker = () => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      };

      activateWaitingWorker();

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed") {
            activateWaitingWorker();
          }
        });
      });

      // Long-running webviews otherwise may not navigate for a long time.
      const checkForUpdate = () => void registration.update();
      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
    })
    .catch((error: unknown) => {
      console.warn("Service Worker registration failed:", error);
    });
}

registerServiceWorker();

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <CommonStyles />
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </QueryClientProvider>
  </>,
);
