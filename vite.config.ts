import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// 서비스워커는 더 이상 빌드가 만들지 않는다. 남은 등록을 회수하기 위한 묘비 워커만
// `public/sw.js`에 정적으로 두고, 등록 해제는 `src/utils/pwaCleanup.ts`가 맡는다.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  define: {
    global: "window",
  },
  server: {
    host: "0.0.0.0", // 모든 네트워크 인터페이스 바인딩
    port: 5173, // 포트 지정 (선택)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // 1. 캘린더 라이브러리
          if (id.includes("@fullcalendar")) {
            return "vendor-calendar";
          }

          // 2. 차트 라이브러리
          if (id.includes("recharts")) {
            return "vendor-charts";
          }

          // 3. 수식 라이브러리
          if (
            id.includes("katex") ||
            id.includes("rehype-katex") ||
            id.includes("remark-math")
          ) {
            return "vendor-math";
          }

          // 4. UI 및 스타일링 라이브러리
          if (
            id.includes("@mui") ||
            id.includes("@emotion") ||
            id.includes("styled-components") ||
            id.includes("framer-motion") ||
            id.includes("/motion/") ||
            id.includes("\\motion\\")
          ) {
            return "vendor-ui";
          }

          // 5. 핵심 React 생태계 라이브러리
          if (
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.includes("/react-dom/") ||
            id.includes("\\react-dom\\") ||
            id.includes("react-router-dom") ||
            id.includes("@tanstack/react-query") ||
            id.includes("/axios/") ||
            id.includes("\\axios\\") ||
            id.includes("use-sync-external-store")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
});
