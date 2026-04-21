import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import CommonStyles from "@/styles/CommonStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initMixpanel } from "./utils/mixpanel";

initMixpanel();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
