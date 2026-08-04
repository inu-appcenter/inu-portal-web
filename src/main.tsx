import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import CommonStyles from "@/styles/CommonStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initMixpanel } from "./utils/mixpanel";
import "@/utils/bridgeChannel"; // 신 앱 PlatformChannel 초기화 + Native→Web 수신 결선
import "@/styles/variables.css";
import { attachQueryBroadcastSync } from "@/utils/queryBroadcastSync";

initMixpanel();


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// RN 멀티 웹뷰 환경에서 같은 오리진의 다른 웹뷰(또는 브라우저 탭)와 쿼리
// 캐시를 동기화한다. 자세한 배경은 src/utils/queryBroadcastSync.ts 참고.
attachQueryBroadcastSync(queryClient);

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
