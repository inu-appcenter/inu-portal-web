import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import CommonStyles from "@/styles/CommonStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initMixpanel } from "./utils/mixpanel";
import "@/utils/bridgeChannel"; // 신 앱 PlatformChannel 초기화 + Native→Web 수신 결선
import { setSuspendableQueryClient } from "@/utils/suspendable";
import "@/styles/variables.css";

initMixpanel();


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
// Tier 3 웜 웹뷰 풀: setActive(false) 시 진행 쿼리 취소, setActive(true) 시 전체 재검증.
setSuspendableQueryClient(queryClient);

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
