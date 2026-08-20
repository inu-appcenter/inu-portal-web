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
});
