#!/usr/bin/env node
/**
 * scripts/assets-audit.mjs
 *
 * 이미지 에셋 통합관리 개편(성질 단위 구조 이관)을 위한 반복 실행 가능한 감사 스크립트.
 * 새 npm 의존성 없이 Node 내장 모듈(fs/path/crypto/url)만 사용한다.
 *
 * 사용법:
 *   node scripts/assets-audit.mjs            사람이 읽는 요약을 stdout에 출력
 *   node scripts/assets-audit.mjs --json      기계 판독용 JSON 출력
 *   node scripts/assets-audit.mjs --strict    문제 발견 시 exit 1 (CI 게이트용)
 *   node scripts/assets-audit.mjs --threshold-kb=300   과대 래스터 임계값 변경(기본 500)
 *
 * 이 스크립트는 검사만 한다. src/ 아래 파일을 옮기거나 지우지 않는다.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// 경로/상수
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const ASSETS_ROOT = path.join(SRC, "resources", "assets");
const INDEX_HTML = path.join(ROOT, "index.html");

// 목표 구조: 이 하위 3개 안에 있으면 "이관됨"
const MIGRATED_TOP_DIRS = ["icons", "illustrations", "photos"];

// 사이트 자체 도메인 — index.html의 og:image 등 절대 URL을 public 경로로 환산할 때 씀
const SITE_ORIGIN = "https://intip.inuappcenter.kr";

// 코드가 아니라 서버/크롤러/딥링크가 직접 요청하는 public 하위 디렉터리.
// (favicon도 실제로는 index.html에서 참조되므로 별도 처리하지 않아도 reachable로 잡힘)
const EXTERNAL_REFERENCEABLE_PUBLIC_DIRS = ["og", "app-links"];

const MEDIA_EXT = new Set([
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".mp4",
  ".avif",
]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);
const RASTER_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

const args = process.argv.slice(2);
const OUT_JSON = args.includes("--json");
const STRICT = args.includes("--strict");
const thresholdArg = args.find((a) => a.startsWith("--threshold-kb="));
const OVERSIZE_THRESHOLD_BYTES =
  (thresholdArg ? Number(thresholdArg.split("=")[1]) : 500) * 1024;

// ---------------------------------------------------------------------------
// 파일시스템 유틸
// ---------------------------------------------------------------------------

/** 존재하면 realpath(정규화된 경로)를, 아니면 null을 반환한다.
 *  macOS(APFS)는 한글 파일명의 NFC/NFD 정규화 형태가 소스 문자열과 실제 디렉터리
 *  엔트리에서 다를 수 있는데, 파일시스템 조회 자체는 정규화 무관하게 통과하므로
 *  일단 존재를 확인한 뒤 realpath로 표준 키를 얻어 Set/Map 비교를 안전하게 한다. */
function real(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return null;
  }
}

function walk(dir, { skipDirNames = new Set([".git", "node_modules"]) } = {}) {
  const out = [];
  function rec(d) {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue; // .DS_Store 등
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (skipDirNames.has(e.name)) continue;
        rec(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  rec(dir);
  return out;
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function relRoot(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

// ---------------------------------------------------------------------------
// 참조 추출 (정규식 기반 — 완전한 파서는 아니지만 이 저장소의 실제 패턴을 커버)
// ---------------------------------------------------------------------------

// import/export 구문의 모듈 지정자. 문자열 내 개행 허용(여러 줄 import 구문 대응).
const IMPORT_RE =
  /\b(?:import|export)\s+(?:[^'";]*?\bfrom\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

// 확장자로 끝나는 임의의 따옴표 문자열(“, ', `). import 구문과 중복 매칭될 수 있으나
// Set으로 병합되므로 무해하다. 이 정규식이 JSX src=, 하드코딩 public 경로,
// CSS-in-JS의 cursor: url('...') 등을 모두 잡아낸다.
const ASSET_STRING_RE =
  /["'`]([^"'`]+\.(?:svg|png|jpe?g|webp|gif|ico|mp4|avif))(?:\?[A-Za-z0-9=&_-]*)?["'`]/gi;

// CSS 파일의 unquoted url(...) 대응 (styled-components 안의 것은 위 정규식이 처리)
const CSS_URL_RE = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;

/** 순수 주석 줄만 제거한다(“line.trim().startsWith('//')”인 줄).
 *  예: mapRestaurantImages/restaurantImageManage.ts의 주석 처리된 import들이
 *  실사용 참조로 오인되지 않도록 한다. 블록 주석(/* ... *\/)도 제거한다. */
function stripComments(text) {
  const noBlock = text.replace(/\/\*[\s\S]*?\*\//g, "");
  return noBlock
    .split("\n")
    .map((line) => (line.trim().startsWith("//") ? "" : line))
    .join("\n");
}

/**
 * 파일 하나에서 정적 참조 문자열과 "동적" 템플릿 리터럴 참조를 뽑아낸다.
 * 반환: { staticRefs: string[], dynamicPrefixes: string[] }
 */
function extractRefs(rawText, isCss) {
  const text = stripComments(rawText);
  const staticRefs = new Set();
  const dynamicPrefixes = new Set();

  const addCandidate = (raw) => {
    if (!raw) return;
    if (raw.includes("${")) {
      // 템플릿 리터럴 동적 조합 경로: `/Bus/marker/${stop.name}.png` 같은 경우.
      // 정적으로 풀 수 없으므로, 보간 앞의 고정 접두 경로만 "동적 참조 디렉터리"로 기록한다.
      dynamicPrefixes.add(raw.split("${")[0]);
      return;
    }
    staticRefs.add(raw);
  };

  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(text))) addCandidate(m[1]);
  DYNAMIC_IMPORT_RE.lastIndex = 0;
  while ((m = DYNAMIC_IMPORT_RE.exec(text))) addCandidate(m[1]);
  ASSET_STRING_RE.lastIndex = 0;
  while ((m = ASSET_STRING_RE.exec(text))) addCandidate(m[1]);

  if (isCss) {
    CSS_URL_RE.lastIndex = 0;
    while ((m = CSS_URL_RE.exec(text))) addCandidate(m[1]);
  }

  return { staticRefs: [...staticRefs], dynamicPrefixes: [...dynamicPrefixes] };
}

/** 절대/상대/별칭(@/)/루트 상대(/) 문자열을 실제 파일 경로로 푼다. 없으면 null. */
function resolveRef(raw, fromFile) {
  // svgr의 `?react` 및 캐시버스팅 쿼리스트링(`?v=1` 등)을 제거한다.
  let p = raw.trim().split("#")[0].split("?")[0];
  if (!p) return null;

  if (p.startsWith(SITE_ORIGIN + "/")) {
    p = p.slice(SITE_ORIGIN.length); // 절대 URL이 자기 도메인이면 루트 상대로 환산
  }
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(p) || p.startsWith("data:") || p.startsWith("mailto:")) {
    return null; // 외부 URL / data URI — 프로젝트 파일 아님
  }

  let target;
  if (p.startsWith("@/")) {
    target = path.join(SRC, p.slice(2));
  } else if (p.startsWith("./") || p.startsWith("../")) {
    target = path.resolve(path.dirname(fromFile), p);
  } else if (p.startsWith("/src/")) {
    target = path.join(ROOT, p);
  } else if (p.startsWith("/")) {
    target = path.join(PUBLIC, p.slice(1));
  } else {
    return null; // bare specifier(npm 패키지) — 프로젝트 파일 아님
  }
  return findExisting(target);
}

function findExisting(target) {
  const candidates = [
    target,
    target + ".ts",
    target + ".tsx",
    target + ".js",
    target + ".jsx",
    path.join(target, "index.ts"),
    path.join(target, "index.tsx"),
    path.join(target, "index.js"),
  ];
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return real(c);
    } catch {
      /* 다음 후보 시도 */
    }
  }
  return null;
}

/** 동적 템플릿 리터럴의 고정 접두부를 디렉터리 경로로 풀어 realpath를 반환한다. */
function resolveDynamicDir(prefix, fromFile) {
  let p = prefix.split("?")[0];
  if (p.startsWith(SITE_ORIGIN + "/")) p = p.slice(SITE_ORIGIN.length);
  let dirPart = p.endsWith("/")
    ? p.slice(0, -1)
    : p.includes("/")
      ? p.slice(0, p.lastIndexOf("/"))
      : "";
  if (!dirPart) return null;

  let target;
  if (dirPart.startsWith("@/")) target = path.join(SRC, dirPart.slice(2));
  else if (dirPart.startsWith("./") || dirPart.startsWith("../"))
    target = path.resolve(path.dirname(fromFile), dirPart);
  else if (dirPart.startsWith("/src/")) target = path.join(ROOT, dirPart);
  else if (dirPart.startsWith("/")) target = path.join(PUBLIC, dirPart.slice(1));
  else return null;

  return real(target);
}

// ---------------------------------------------------------------------------
// 1. 인벤토리 수집
// ---------------------------------------------------------------------------

const allSrcFiles = walk(SRC);
const allPublicFiles = fs.existsSync(PUBLIC) ? walk(PUBLIC) : [];
const codeFiles = allSrcFiles.filter((f) => CODE_EXT.has(path.extname(f)));
const cssFiles = allSrcFiles.filter((f) => path.extname(f) === ".css");
const htmlFiles = [
  INDEX_HTML,
  ...allPublicFiles.filter((f) => path.extname(f) === ".html"),
].filter((f) => fs.existsSync(f));

const srcMediaAssets = allSrcFiles
  .filter((f) => f.startsWith(ASSETS_ROOT + path.sep))
  .filter((f) => MEDIA_EXT.has(path.extname(f).toLowerCase()));
const publicMediaAssets = allPublicFiles.filter((f) =>
  MEDIA_EXT.has(path.extname(f).toLowerCase()),
);

// ---------------------------------------------------------------------------
// 2. 참조 그래프 구축
// ---------------------------------------------------------------------------

const edges = new Map(); // realpath(file) -> Set<realpath(target)>
const dynamicDirs = new Set(); // realpath(dir)
const unresolved = []; // { from, raw } — 존재하지 않는 참조(끊어진 링크 후보)

function addEdge(from, to) {
  if (!edges.has(from)) edges.set(from, new Set());
  edges.get(from).add(to);
}

function processTextFile(file, isCss = false) {
  const rp = real(file);
  if (!rp) return;
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return;
  }
  const { staticRefs, dynamicPrefixes } = extractRefs(text, isCss);
  for (const raw of staticRefs) {
    const resolved = resolveRef(raw, file);
    if (resolved) {
      addEdge(rp, resolved);
      continue;
    }
    // 이 감사는 에셋 그래프에만 관심이 있다. 미디어 확장자로 끝나거나 public
    // 루트-상대 경로처럼 "에셋 같은" 참조만 끊어진 링크 후보로 보고한다.
    // (@/types/chat 같은 순수 코드/타입 import 실패는 이 도구의 범위 밖.)
    const clean = raw.split("#")[0].split("?")[0];
    const isProjectLocalPrefix = /^(@\/|\.\/|\.\.\/|\/(?!\/))/.test(clean);
    const looksLikeAsset = MEDIA_EXT.has(path.extname(clean).toLowerCase());
    if (isProjectLocalPrefix && looksLikeAsset)
      unresolved.push({ from: relRoot(file), raw });
  }
  for (const prefix of dynamicPrefixes) {
    const dir = resolveDynamicDir(prefix, file);
    if (dir) dynamicDirs.add(dir);
  }
}

for (const f of codeFiles) processTextFile(f, false);
for (const f of cssFiles) processTextFile(f, true);
for (const f of htmlFiles) processTextFile(f, false);

// 역방향 참조 그래프: target(realpath) -> Set<from(realpath)>.
// "누가 이 파일/에셋을 import하는가"를 즉시 찾기 위해 씀 — 도달 불가 자산의
// import 체인 추적(어디서 끊기는지)과, 디렉터리별 소비처 파일 수 집계에 쓰인다.
const reverseEdges = new Map();
for (const [from, targets] of edges) {
  for (const t of targets) {
    if (!reverseEdges.has(t)) reverseEdges.set(t, new Set());
    reverseEdges.get(t).add(from);
  }
}

/** 에셋(또는 어떤 파일)의 realpath에서 시작해, 역방향 엣지를 따라 "아무도 import하지
 *  않는 지점"까지 한 경로를 추적한다. 매 단계 후보가 여럿이면 relRoot 사전순으로
 *  결정적으로 하나를 고른다(사이클 방지를 위해 이미 지나온 노드는 건너뜀).
 *  반환: { chain: realpath[] (자산 자신 제외, importer들의 순서열), brokenAt: realpath }
 *  brokenAt은 체인의 마지막 노드 — 즉 그 누구도 import하지 않는 최상위 지점. */
function traceChain(startRealPath) {
  const chain = [];
  const seen = new Set([startRealPath]);
  let current = startRealPath;
  while (true) {
    const importers = reverseEdges.get(current);
    if (!importers || importers.size === 0) {
      return { chain, brokenAt: current };
    }
    const sorted = [...importers].sort((a, b) => relRoot(a).localeCompare(relRoot(b)));
    const next = sorted.find((imp) => !seen.has(imp));
    if (!next) {
      // 남은 후보가 모두 이미 지나온 노드(사이클) — 여기서 멈춘다.
      return { chain, brokenAt: current };
    }
    seen.add(next);
    chain.push(next);
    current = next;
  }
}

// ---------------------------------------------------------------------------
// 3. 도달 가능성(BFS) — main.tsx, index.html, public의 독립 정적 페이지들을 진입점으로
// ---------------------------------------------------------------------------

const entryPoints = [];
const mainTsx = findExisting(path.join(SRC, "main"));
if (mainTsx) entryPoints.push(mainTsx);
for (const f of htmlFiles) {
  const rp = real(f);
  if (rp) entryPoints.push(rp);
}

const visited = new Set();
{
  const queue = [...entryPoints];
  while (queue.length) {
    const cur = queue.pop();
    if (!cur || visited.has(cur)) continue;
    visited.add(cur);
    const targets = edges.get(cur);
    if (targets) for (const t of targets) if (!visited.has(t)) queue.push(t);
  }
}

function isUnderDynamicDir(fileRealPath) {
  for (const d of dynamicDirs) {
    if (fileRealPath === d || fileRealPath.startsWith(d + path.sep)) return true;
  }
  return false;
}

function isExternalReferenceablePublic(fileRealPath) {
  const rel = path.relative(PUBLIC, fileRealPath);
  if (rel.startsWith("..")) return false;
  const top = rel.split(path.sep)[0];
  return EXTERNAL_REFERENCEABLE_PUBLIC_DIRS.includes(top);
}

// ---------------------------------------------------------------------------
// 4. 자산별 상태 분류
// ---------------------------------------------------------------------------

const STATUS = {
  REACHABLE: "reachable",
  DYNAMIC: "dynamic-reference",
  EXTERNAL: "external-referenceable",
  // 진짜 고아: 어떤 파일도 이 에셋을 import/참조하지 않는다. 삭제 후보.
  UNREFERENCED: "unreferenced",
  // 참조는 있으나(누군가 import함) 그 import 체인이 진입점(main.tsx/index.html)에서
  // 도달 불가 — 죽은 컴포넌트가 붙들고 있는 경우. 이관 대상이며 삭제 대상이 아니다.
  UNREACHABLE: "unreachable-referenced",
};

function classify(fileAbs, isPublic) {
  const rp = real(fileAbs);
  if (!rp) return STATUS.UNREFERENCED;
  if (visited.has(rp)) return STATUS.REACHABLE;
  if (isUnderDynamicDir(rp)) return STATUS.DYNAMIC;
  if (isPublic && isExternalReferenceablePublic(rp)) return STATUS.EXTERNAL;
  if (reverseEdges.has(rp) && reverseEdges.get(rp).size > 0) return STATUS.UNREACHABLE;
  return STATUS.UNREFERENCED;
}

const srcAssetRecords = srcMediaAssets.map((f) => ({
  path: f,
  rel: relRoot(f),
  size: fs.statSync(f).size,
  status: classify(f, false),
  scope: "src",
}));
const publicAssetRecords = publicMediaAssets.map((f) => ({
  path: f,
  rel: relRoot(f),
  size: fs.statSync(f).size,
  status: classify(f, true),
  scope: "public",
}));
const allAssetRecords = [...srcAssetRecords, ...publicAssetRecords];

// ---------------------------------------------------------------------------
// 5. 이관 진행률
// ---------------------------------------------------------------------------

function migrationGroup(rel) {
  // rel: "src/resources/assets/<top>/..."
  const parts = rel.split("/");
  const idx = parts.indexOf("assets");
  return parts[idx + 1];
}

const migrationBuckets = new Map(); // top dir -> { count, bytes, migrated }
for (const rec of srcAssetRecords) {
  const top = migrationGroup(rec.rel);
  const migrated = MIGRATED_TOP_DIRS.includes(top);
  if (!migrationBuckets.has(top))
    migrationBuckets.set(top, { count: 0, bytes: 0, migrated });
  const b = migrationBuckets.get(top);
  b.count += 1;
  b.bytes += rec.size;
}

// 디렉터리별 소비처(=이 디렉터리 안의 에셋을 import하는 파일) 집합. 단일 소비처
// 디렉터리부터 이관하는 게 안전하다는 게 weather/ 슬라이스에서 확인됐으므로,
// 이관 순서 결정을 돕기 위해 집계한다.
const consumersByDir = new Map(); // top dir -> Set<realpath of importer>
for (const rec of srcAssetRecords) {
  const top = migrationGroup(rec.rel);
  const rp = real(rec.path);
  if (!rp) continue;
  const importers = reverseEdges.get(rp);
  if (!importers || importers.size === 0) continue;
  if (!consumersByDir.has(top)) consumersByDir.set(top, new Set());
  for (const imp of importers) consumersByDir.get(top).add(imp);
}

const migratedTotal = { count: 0, bytes: 0 };
const unmigratedTotal = { count: 0, bytes: 0 };
const unmigratedByDir = [];
for (const [top, b] of migrationBuckets) {
  const consumerCount = consumersByDir.get(top)?.size ?? 0;
  if (b.migrated) {
    migratedTotal.count += b.count;
    migratedTotal.bytes += b.bytes;
  } else {
    unmigratedTotal.count += b.count;
    unmigratedTotal.bytes += b.bytes;
    unmigratedByDir.push({ dir: top, ...b, consumerCount });
  }
}
unmigratedByDir.sort((a, b) => b.bytes - a.bytes);

// 다음 이관 후보: 소비처 파일 수 오름차순(같으면 용량 오름차순) — 소비처가 적을수록
// 영향 범위가 좁아 먼저 옮기기 안전하다.
const nextMigrationCandidates = [...unmigratedByDir].sort(
  (a, b) => a.consumerCount - b.consumerCount || a.bytes - b.bytes,
);

const totalAssetCount = migratedTotal.count + unmigratedTotal.count;
const migrationPercentByCount = totalAssetCount
  ? ((migratedTotal.count / totalAssetCount) * 100).toFixed(1)
  : "0.0";
const totalAssetBytes = migratedTotal.bytes + unmigratedTotal.bytes;
const migrationPercentByBytes = totalAssetBytes
  ? ((migratedTotal.bytes / totalAssetBytes) * 100).toFixed(1)
  : "0.0";

// 비어 있는 레거시 디렉터리(파일 0개, 서브디렉터리만 있거나 완전히 빈 채 남은 것)도
// 이관 잔재로 참고 표기한다.
const emptyLegacyDirs = [];
for (const entry of fs.readdirSync(ASSETS_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (MIGRATED_TOP_DIRS.includes(entry.name)) continue;
  const dirAbs = path.join(ASSETS_ROOT, entry.name);
  const hasAnyFile = walk(dirAbs).length > 0;
  if (!hasAnyFile) emptyLegacyDirs.push(entry.name);
}

// ---------------------------------------------------------------------------
// 6. 배럴 미등록 검사 (새 구조 안에서만)
// ---------------------------------------------------------------------------

const barrelFiles = allSrcFiles.filter(
  (f) =>
    f.startsWith(ASSETS_ROOT + path.sep) &&
    MIGRATED_TOP_DIRS.some((d) =>
      f.startsWith(path.join(ASSETS_ROOT, d) + path.sep),
    ) &&
    /^index\.(ts|tsx)$/.test(path.basename(f)),
);

const barrelReport = [];
const dirsWithBarrel = new Set();
for (const barrel of barrelFiles) {
  const dir = path.dirname(barrel);
  dirsWithBarrel.add(dir);
  const text = fs.readFileSync(barrel, "utf8");
  const { staticRefs } = extractRefs(text, false);
  const registered = new Set();
  for (const raw of staticRefs) {
    const resolved = resolveRef(raw, barrel);
    if (resolved && path.dirname(resolved) === real(dir)) registered.add(resolved);
  }
  const siblingMedia = fs
    .readdirSync(dir)
    .map((n) => path.join(dir, n))
    .filter(
      (p) => fs.statSync(p).isFile() && MEDIA_EXT.has(path.extname(p).toLowerCase()),
    );
  const unregistered = siblingMedia.filter((p) => !registered.has(real(p)));
  barrelReport.push({
    barrel: relRoot(barrel),
    dir: relRoot(dir),
    registeredCount: registered.size,
    unregistered: unregistered.map((p) => relRoot(p)),
  });
}

// 새 구조 안에서, 미디어 파일은 있는데 그 디렉터리에 index.ts가 아예 없는 곳
const dirsMissingBarrel = new Set();
for (const rec of srcAssetRecords) {
  const top = migrationGroup(rec.rel);
  if (!MIGRATED_TOP_DIRS.includes(top)) continue;
  const dir = path.dirname(rec.path);
  if (!dirsWithBarrel.has(dir)) dirsMissingBarrel.add(relRoot(dir));
}

// ---------------------------------------------------------------------------
// 7. 중복 파일 (내용 해시)
// ---------------------------------------------------------------------------

const hashGroups = new Map(); // hash -> [{rel, size, scope}]
for (const rec of allAssetRecords) {
  const buf = fs.readFileSync(rec.path);
  const hash = crypto.createHash("sha1").update(buf).digest("hex");
  if (!hashGroups.has(hash)) hashGroups.set(hash, []);
  hashGroups.get(hash).push(rec);
}
const duplicateGroups = [...hashGroups.values()].filter((g) => g.length > 1);

// ---------------------------------------------------------------------------
// 8. 가짜 SVG (base64 래스터 임베드)
// ---------------------------------------------------------------------------

const fakeSvgs = [];
for (const rec of allAssetRecords) {
  if (path.extname(rec.path).toLowerCase() !== ".svg") continue;
  let text;
  try {
    text = fs.readFileSync(rec.path, "utf8");
  } catch {
    continue;
  }
  const hasDataImage = /data:image\//i.test(text);
  const hasImageTag = /<image[\s>]/i.test(text);
  if (hasDataImage || hasImageTag) {
    fakeSvgs.push({ rel: rec.rel, size: rec.size, reason: hasDataImage ? "data:image base64" : "<image> 태그" });
  }
}

// ---------------------------------------------------------------------------
// 9. 과대 래스터
// ---------------------------------------------------------------------------

const oversizedRasters = allAssetRecords
  .filter((rec) => RASTER_EXT.has(path.extname(rec.path).toLowerCase()))
  .filter((rec) => rec.size > OVERSIZE_THRESHOLD_BYTES)
  .sort((a, b) => b.size - a.size)
  .map((rec) => ({ rel: rec.rel, size: rec.size }));

// ---------------------------------------------------------------------------
// 10. 미참조 자산 정리
// ---------------------------------------------------------------------------

// [3a] 진짜 미참조 — 삭제 후보
const unreferenced = allAssetRecords.filter((r) => r.status === STATUS.UNREFERENCED);
// [3b] 참조는 있으나 도달 불가 — 이관 대상(삭제 금지). 각 항목에 import 체인과
// 체인이 끊기는 지점(누구도 import하지 않는 최상위 컴포넌트)을 붙인다.
const unreachableReferenced = allAssetRecords
  .filter((r) => r.status === STATUS.UNREACHABLE)
  .map((r) => {
    const rp = real(r.path);
    const { chain, brokenAt } = traceChain(rp);
    return {
      rel: r.rel,
      size: r.size,
      scope: r.scope,
      importChain: chain.map((c) => relRoot(c)),
      importChainBasenames: chain.map((c) => path.basename(c)),
      brokenAt: relRoot(brokenAt),
      brokenAtBasename: path.basename(brokenAt),
    };
  });

// 끊긴 지점(죽은 컴포넌트) 단위 집계 — 몇 개 컴포넌트가 몇 개 에셋을 붙들고 있는지.
const deadComponentMap = new Map(); // brokenAt(rel) -> assetRel[]
for (const d of unreachableReferenced) {
  if (!deadComponentMap.has(d.brokenAt)) deadComponentMap.set(d.brokenAt, []);
  deadComponentMap.get(d.brokenAt).push(d.rel);
}
const deadComponents = [...deadComponentMap.entries()]
  .map(([component, assets]) => ({ component, assetCount: assets.length, assets }))
  .sort((a, b) => b.assetCount - a.assetCount);

const dynamicRefs = allAssetRecords.filter((r) => r.status === STATUS.DYNAMIC);
const externalRefs = allAssetRecords.filter((r) => r.status === STATUS.EXTERNAL);

// ---------------------------------------------------------------------------
// 결과 조립
// ---------------------------------------------------------------------------

const result = {
  generatedAt: new Date().toISOString(),
  migration: {
    migrated: migratedTotal,
    unmigrated: unmigratedTotal,
    percentByCount: Number(migrationPercentByCount),
    percentByBytes: Number(migrationPercentByBytes),
    unmigratedByDir: unmigratedByDir.map((d) => ({
      dir: d.dir,
      count: d.count,
      bytes: d.bytes,
      consumerCount: d.consumerCount,
    })),
    nextMigrationCandidates: nextMigrationCandidates.map((d) => ({
      dir: d.dir,
      count: d.count,
      bytes: d.bytes,
      consumerCount: d.consumerCount,
    })),
    emptyLegacyDirs,
  },
  barrels: {
    found: barrelReport,
    dirsMissingBarrel: [...dirsMissingBarrel].sort(),
  },
  // [3a] 진짜 미참조 — 삭제 후보
  unreferenced: unreferenced.map((r) => ({ rel: r.rel, size: r.size, scope: r.scope })),
  // [3b] 참조는 있으나 도달 불가 — 이관 대상(삭제 금지)
  unreachableReferenced,
  deadComponents,
  dynamicReference: dynamicRefs.map((r) => ({ rel: r.rel, scope: r.scope })),
  externalReferenceable: externalRefs.map((r) => ({ rel: r.rel, scope: r.scope })),
  duplicates: duplicateGroups.map((g) => ({
    size: g[0].size,
    files: g.map((f) => f.rel),
  })),
  fakeSvgs,
  oversizedRasters,
  unresolvedReferences: unresolved,
  totals: {
    srcMediaAssets: srcMediaAssets.length,
    publicMediaAssets: publicMediaAssets.length,
  },
};

// --strict 실패 유발 요인: [3a] 진짜 미참조(삭제 후보), 중복, 배럴 미등록만.
// [3b](도달 불가지만 참조는 있음)는 이관 대상이지 결함이 아니므로 제외.
// 가짜 SVG는 판단이 필요한 후보에 가까우므로(과대 래스터와 동일 취급) 정보성으로 내림.
const problemCount =
  result.unreferenced.length +
  result.duplicates.length +
  result.barrels.found.reduce((n, b) => n + b.unregistered.length, 0);

// ---------------------------------------------------------------------------
// 출력
// ---------------------------------------------------------------------------

if (OUT_JSON) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const line = (ch = "─") => ch.repeat(72);

  console.log(line("="));
  console.log("에셋 감사 보고서 (assets-audit)");
  console.log(`생성 시각: ${result.generatedAt}`);
  console.log(line("="));

  console.log("\n[1] 이관 진행률 (icons/illustrations/photos 안 = 이관됨)");
  console.log(line());
  console.log(
    `이관됨   : ${migratedTotal.count}개 파일, ${fmtBytes(migratedTotal.bytes)} (${migrationPercentByCount}% / ${migrationPercentByBytes}%)`,
  );
  console.log(
    `미이관   : ${unmigratedTotal.count}개 파일, ${fmtBytes(unmigratedTotal.bytes)}`,
  );
  if (unmigratedByDir.length) {
    console.log("\n미이관 디렉터리별 (용량 내림차순, 소비처=이 디렉터리 에셋을 import하는 파일 수):");
    for (const d of unmigratedByDir) {
      console.log(
        `  - ${d.dir.padEnd(24)} ${String(d.count).padStart(4)}개  ${fmtBytes(d.bytes).padStart(9)}  소비처 ${d.consumerCount}개`,
      );
    }
  }
  if (nextMigrationCandidates.length) {
    console.log("\n다음 이관 후보 (소비처 파일 수 오름차순 — 적을수록 영향 범위가 좁아 안전):");
    for (const d of nextMigrationCandidates) {
      console.log(
        `  - ${d.dir.padEnd(24)} 소비처 ${String(d.consumerCount).padStart(3)}개   ${String(d.count).padStart(4)}개 파일  ${fmtBytes(d.bytes)}`,
      );
    }
  }
  if (emptyLegacyDirs.length) {
    console.log(`\n빈 레거시 디렉터리(파일 0개, 정리 대상 후보): ${emptyLegacyDirs.join(", ")}`);
  }

  console.log("\n[2] 배럴 미등록 (새 구조 안, index.ts에 등록 안 된 파일)");
  console.log(line());
  const anyUnregistered = barrelReport.some((b) => b.unregistered.length);
  if (!barrelReport.length) {
    console.log("검사할 배럴(index.ts)이 아직 없습니다.");
  } else {
    for (const b of barrelReport) {
      console.log(
        `  ${b.dir} — 배럴 등록 ${b.registeredCount}개, 미등록 ${b.unregistered.length}개`,
      );
      for (const u of b.unregistered) console.log(`      ! ${u}`);
    }
  }
  if (dirsMissingBarrel.size) {
    console.log(`\n미디어 파일은 있는데 index.ts가 없는 디렉터리:`);
    for (const d of dirsMissingBarrel) console.log(`  - ${d}`);
  }
  if (!anyUnregistered && !dirsMissingBarrel.size) console.log("(문제 없음)");

  console.log("\n[3a] 미참조 (참조 0건 — 삭제 후보)");
  console.log(line());
  console.log(`합계: ${unreferenced.length}개`);
  for (const r of unreferenced) console.log(`  ! ${r.rel} (${fmtBytes(r.size)})`);

  console.log(
    "\n[3b] 도달 불가 (참조는 있으나 진입점에서 닿지 않음 — 이관 대상, 삭제 금지)",
  );
  console.log(line());
  console.log(`합계: ${unreachableReferenced.length}개`);
  for (const r of unreachableReferenced) {
    const chainStr = r.importChainBasenames.join(" ← ");
    console.log(`  ~ ${r.rel} (${fmtBytes(r.size)})`);
    console.log(`      ← ${chainStr} (여기서 끊김: import하는 곳 없음 — ${r.brokenAt})`);
  }
  if (deadComponents.length) {
    console.log(
      `\n죽은 컴포넌트 집계 (${deadComponents.length}개 컴포넌트가 총 ${unreachableReferenced.length}개 에셋을 붙들고 있음):`,
    );
    for (const dc of deadComponents) {
      console.log(`  - ${dc.component}  (${dc.assetCount}개 에셋)`);
    }
  }

  console.log(
    `\n참고 — 동적 참조로 제외됨: ${dynamicRefs.length}개, 외부 참조 가능으로 제외됨: ${externalRefs.length}개`,
  );
  if (dynamicRefs.length) {
    const dirs = [...new Set(dynamicRefs.map((r) => path.dirname(r.rel)))];
    console.log(`  동적 참조 디렉터리: ${dirs.join(", ")}`);
  }
  if (externalRefs.length) {
    const dirs = [...new Set(externalRefs.map((r) => path.dirname(r.rel)))];
    console.log(`  외부 참조 가능 디렉터리: ${dirs.join(", ")}`);
  }

  console.log("\n[4] 중복 파일 (내용 동일, sha1 기준)");
  console.log(line());
  console.log(`합계: ${duplicateGroups.length}쌍/그룹`);
  for (const g of duplicateGroups) {
    console.log(`  [${fmtBytes(g[0].size)}]`);
    for (const f of g) console.log(`    - ${f.rel}`);
  }

  console.log("\n[5] 가짜 SVG (base64 래스터 임베드, 정보성 — 판단 필요, --strict 실패 아님)");
  console.log(line());
  console.log(`합계: ${fakeSvgs.length}개`);
  for (const f of fakeSvgs) console.log(`  ! ${f.rel} (${f.reason}, ${fmtBytes(f.size)})`);

  console.log(`\n[6] 과대 래스터 (> ${fmtBytes(OVERSIZE_THRESHOLD_BYTES)}, 후보만 제시)`);
  console.log(line());
  console.log(`합계: ${oversizedRasters.length}개`);
  for (const f of oversizedRasters) console.log(`  ? ${f.rel} (${fmtBytes(f.size)})`);

  if (unresolved.length) {
    console.log("\n[참고] 해석 실패한 참조 문자열 (끊어진 링크 후보 — 오탐 가능)");
    console.log(line());
    for (const u of unresolved.slice(0, 50))
      console.log(`  ? ${u.from} -> "${u.raw}"`);
    if (unresolved.length > 50)
      console.log(`  ... 외 ${unresolved.length - 50}건`);
  }

  console.log("\n" + line("="));
  console.log(
    `요약: 미참조(3a,삭제후보) ${unreferenced.length} · 도달불가(3b,이관대상) ${unreachableReferenced.length} · 중복그룹 ${duplicateGroups.length} · 배럴미등록 ${result.barrels.found.reduce((n, b) => n + b.unregistered.length, 0)} · 가짜SVG(참고) ${fakeSvgs.length} · 과대래스터(참고) ${oversizedRasters.length}`,
  );
  console.log(line("="));
}

if (STRICT && problemCount > 0) {
  process.exitCode = 1;
}
