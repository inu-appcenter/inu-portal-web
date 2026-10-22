import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");

/**
 * Safe Area 정적 검증 스크립트
 * 
 * 1. Android WebView 호환성 검증:
 *    env(safe-area-inset-*)를 단독 사용하면 Android WebView에서 0px로 평가되어
 *    하단 패딩이 증발합니다. 반드시 var(--native-safe-area-inset-*, env(...)) 또는
 *    SAFE_AREA 헬퍼(src/styles/safeArea.ts)를 사용해야 합니다.
 * 
 * 2. 하단 고정 요소 누락 검증:
 *    position: fixed 상태에서 하단 위치(bottom: XXpx)를 지정할 때 Safe Area 연산이
 *    누락되면 기기 제스처 바에 요소가 가려집니다.
 */

const ALLOWED_DEFINITION_FILES = [
  "src/styles/CommonStyles.tsx",
  "src/styles/safeArea.ts",
];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".git") {
        walk(fullPath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".css")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = walk(srcDir);
const violations = [];

for (const filePath of allFiles) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, "/");
  if (
    ALLOWED_DEFINITION_FILES.includes(relPath) ||
    relPath.includes("__tests__")
  ) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. Check for standalone env(safe-area-inset-bottom) without --native fallback
    if (
      trimmed.includes("env(safe-area-inset-bottom") &&
      !trimmed.includes("--native-safe-area-inset-bottom")
    ) {
      violations.push({
        file: relPath,
        line: lineNum,
        type: "STANDALONE_ENV_BOTTOM",
        message: "env(safe-area-inset-bottom) 단독 사용 감지. Android WebView에서 0px로 무력화됩니다. var(--native-safe-area-inset-bottom, env(...)) 또는 SAFE_AREA.BOTTOM을 사용하세요.",
        code: trimmed,
      });
    }

    // 2. Check for standalone env(safe-area-inset-top) without --native fallback
    if (
      trimmed.includes("env(safe-area-inset-top") &&
      !trimmed.includes("--native-safe-area-inset-top")
    ) {
      violations.push({
        file: relPath,
        line: lineNum,
        type: "STANDALONE_ENV_TOP",
        message: "env(safe-area-inset-top) 단독 사용 감지. Android WebView에서 0px로 무력화됩니다. var(--native-safe-area-inset-top, env(...)) 또는 SAFE_AREA.TOP을 사용하세요.",
        code: trimmed,
      });
    }

    // 3. Check for fixed bottom without safe area
    if (
      /bottom\s*:\s*\d+px/i.test(trimmed) &&
      !trimmed.includes("safe-area") &&
      !trimmed.includes("--native") &&
      !trimmed.includes("SAFE_AREA") &&
      !trimmed.includes("safeBottom")
    ) {
      // Look around 6 lines before and after for "position: fixed"
      const start = Math.max(0, idx - 6);
      const end = Math.min(lines.length - 1, idx + 6);
      const surrounding = lines.slice(start, end + 1).join("\n");
      if (/position\s*:\s*fixed/i.test(surrounding)) {
        violations.push({
          file: relPath,
          line: lineNum,
          type: "FIXED_BOTTOM_WITHOUT_SAFE_AREA",
          message: "position: fixed 요소에 safe area 없이 하드코딩된 bottom px가 적용되었습니다. 기기 제스처 바에 겹칠 위험이 있습니다.",
          code: trimmed,
        });
      }
    }
  });
}

console.log("\n=======================================================");
console.log("🔍 Safe Area 전수 정적 검증 리포트 (verify-safe-area)");
console.log("=======================================================");
console.log(`검사 대상 소스 파일 수: ${allFiles.length}개`);
console.log(`발견된 위반 건수: ${violations.length}건\n`);

if (violations.length > 0) {
  console.error("❌ 다음 파일들에서 Safe Area 규칙 위반이 발견되었습니다:\n");
  violations.forEach((v, i) => {
    console.error(`[${i + 1}] ${v.file}:${v.line}`);
    console.error(`    규칙: ${v.type}`);
    console.error(`    내용: ${v.message}`);
    console.error(`    코드: ${v.code}\n`);
  });
  console.error(`총 ${violations.length}건의 Safe Area 위반 사항을 모두 수정한 후 다시 실행해주세요.`);
  process.exit(1);
} else {
  console.log("✅ 완벽합니다! 모든 파일이 Android/iOS Safe Area 표준 규격을 준수하고 있습니다.\n");
  process.exit(0);
}
