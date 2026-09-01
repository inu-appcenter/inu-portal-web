import type { CourseOffering } from "@/types/courseOfferings";
import type { TimeTableDay } from "@/types/timetables";

export type DetectedTimetableBlock = {
  id: string;
  crop: HTMLCanvasElement;
  day: TimeTableDay;
  startTime: string;
  endTime: string;
  rawText: string;
  confidence: number;
};

export type DetectedCourseGroup = {
  id: string;
  title: string;
  professor: string;
  rawText: string;
  blocks: DetectedTimetableBlock[];
};

export type TimetableImageLayout = "INU_CART_GRID" | "EVERYTIME_GRID";

const DAYS: TimeTableDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

/** 장바구니 목록 OCR에서 대괄호 안 10자리 수강번호를 추출한다. */
export function extractBracketedSubjectNumbers(text: string): string[] {
  const normalizeDigits = (value: string) =>
    value
      .replace(/[OoQqD]/g, "0")
      .replace(/[Il|]/g, "1")
      .replace(/[Ss]/g, "5")
      .replace(/[Bb]/g, "8")
      .replace(/[^0-9]/g, "");

  const bracketed = [...text.matchAll(/[\[【]([^\]】]{6,20})[\]】]/g)]
    .map((match) => normalizeDigits(match[1]))
    .filter((value) => value.length === 10);
  // OCR이 대괄호만 누락한 경우에도 독립된 10자리 숫자는 복구한다.
  const standalone = text.match(/(?<!\d)\d{10}(?!\d)/g) ?? [];
  return [...new Set([...bracketed, ...standalone])];
}

export function detectTimetableImageLayout(text: string): TimetableImageLayout {
  const koreanWeekdays = ["월", "화", "수", "목", "금"].filter((day) =>
    new RegExp(`(^|\\s)${day}(?=\\s|$)`, "m").test(text),
  ).length;
  return koreanWeekdays >= 3 || /시간표\s*\d/.test(text)
    ? "EVERYTIME_GRID"
    : "INU_CART_GRID";
}

const padTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const snapTime = (minutes: number) => Math.round(minutes / 5) * 5;

const isCoursePixel = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min > 32 && (r + g + b) / 3 < 225;
};

/**
 * 크롭된 강의 블록 Canvas를 Tesseract OCR 인식에 최적화된 형태로 전처리한다.
 * 1. 2.5배 업스케일링 및 이미지 스무딩
 * 2. 상하좌우 16px 흰색 여백(Padding) 추가 (경계면 글자 누락 방지)
 * 3. 코너 픽셀 기반 배경색 추정 -> 대비 극대화 및 적응형 이진화 (배경: 255 흰색, 글자: 0 검은색)
 */
export function preprocessBlockCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  if (typeof document === "undefined") return sourceCanvas;
  const scale = 2.5;
  const padding = 16;
  const target = document.createElement("canvas");
  const scaledWidth = Math.max(1, Math.round(sourceCanvas.width * scale));
  const scaledHeight = Math.max(1, Math.round(sourceCanvas.height * scale));
  target.width = scaledWidth + padding * 2;
  target.height = scaledHeight + padding * 2;

  const ctx = target.getContext("2d", { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  // 1. 흰색 배경 초기화
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, target.width, target.height);

  // 2. 이미지 확대 렌더링 (고품질 스무딩 적용)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceCanvas, padding, padding, scaledWidth, scaledHeight);

  // 3. 픽셀 데이터 분석 및 이진화/대비 강화
  const imgData = ctx.getImageData(0, 0, target.width, target.height);
  const data = imgData.data;

  // 원본 캔버스 코너 및 테두리 영역의 평균 밝기/색상으로 배경색(Background) 추정
  const srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  let bgLuma = 255;
  if (srcCtx) {
    const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
    const sw = sourceCanvas.width;
    const sh = sourceCanvas.height;
    const samplePoints = [
      0, // top-left
      Math.max(0, (sw - 1) * 4), // top-right
      Math.max(0, (sh - 1) * sw * 4), // bottom-left
      Math.max(0, ((sh - 1) * sw + (sw - 1)) * 4), // bottom-right
      Math.max(0, Math.floor(sh / 2) * sw * 4), // mid-left
      Math.max(0, (Math.floor(sh / 2) * sw + (sw - 1)) * 4), // mid-right
    ];
    let totalLuma = 0;
    let validSamples = 0;
    for (const p of samplePoints) {
      if (p < srcData.length) {
        totalLuma += srcData[p] * 0.299 + srcData[p + 1] * 0.587 + srcData[p + 2] * 0.114;
        validSamples += 1;
      }
    }
    if (validSamples > 0) {
      bgLuma = totalLuma / validSamples;
    }
  }

  const isLightBg = bgLuma > 140;

  for (let y = padding; y < padding + scaledHeight; y += 1) {
    for (let x = padding; x < padding + scaledWidth; x += 1) {
      const idx = (y * target.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = r * 0.299 + g * 0.587 + b * 0.114;
      const diff = Math.abs(luma - bgLuma);

      let isText = false;
      if (isLightBg) {
        isText = luma < bgLuma - 28 || (diff > 35 && luma < 170);
      } else {
        isText = luma > bgLuma + 28 || (diff > 35 && luma > 120);
      }

      const val = isText ? 0 : 255;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return target;
}

/** 장바구니 시간표 캡처의 색상 강의 블록을 브라우저 Canvas만으로 찾는다. */
export async function detectTimetableBlocks(
  file: File,
  layout: TimetableImageLayout = "INU_CART_GRID",
  ocrLines?: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }>,
) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("이미지를 읽을 수 없습니다.");
  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  const scale = Math.max(2, Math.round(width / 280));
  const gridWidth = Math.ceil(width / scale);
  const gridHeight = Math.ceil(height / scale);
  const mask = new Uint8Array(gridWidth * gridHeight);
  const red = new Uint8Array(mask.length);
  const green = new Uint8Array(mask.length);
  const blue = new Uint8Array(mask.length);

  for (let gy = Math.floor(gridHeight * 0.08); gy < gridHeight; gy += 1) {
    for (let gx = 0; gx < gridWidth; gx += 1) {
      let colored = 0;
      let redSum = 0;
      let greenSum = 0;
      let blueSum = 0;
      for (let oy = 0; oy < scale && gy * scale + oy < height; oy += 1) {
        for (let ox = 0; ox < scale && gx * scale + ox < width; ox += 1) {
          const index = ((gy * scale + oy) * width + gx * scale + ox) * 4;
          if (isCoursePixel(data[index], data[index + 1], data[index + 2])) {
            colored += 1;
            redSum += data[index];
            greenSum += data[index + 1];
            blueSum += data[index + 2];
          }
        }
      }
      if (colored >= scale) {
        const cell = gy * gridWidth + gx;
        mask[cell] = 1;
        red[cell] = redSum / colored;
        green[cell] = greenSum / colored;
        blue[cell] = blueSum / colored;
      }
    }
  }

  const isEverytime = layout === "EVERYTIME_GRID";
  let gridLeft = width * (isEverytime ? 0.068 : 0.143);
  let gridRight = width * (isEverytime ? 0.976 : 1);
  let timetableTop = height * (isEverytime ? 0.118 : 0.129);
  let pixelsPerMinute = height * (isEverytime ? 0.00098 : 0.001373);
  const firstMinute = isEverytime ? 9 * 60 : 7 * 60 + 30;
  const dayCount = isEverytime ? 5 : 6;

  // OCR 라인 정보가 있을 경우 동적 캘리브레이션 (요일 헤더 & 시간 텍스트 위치 기반)
  if (ocrLines && ocrLines.length > 0 && isEverytime) {
    const weekdayLine = ocrLines.find((l) =>
      ["월", "화", "수", "목", "금"].filter((d) => l.text.includes(d)).length >= 3,
    );
    if (weekdayLine) {
      timetableTop = weekdayLine.bbox.y1;
      gridLeft = Math.max(10, weekdayLine.bbox.x0 - 5);
      gridRight = Math.min(width - 5, weekdayLine.bbox.x1 + 10);
    }

    // 시간 라벨 위치 감지 (10, 11, 12, 1, 2, 3 등)
    const timeLabels = ocrLines.filter((l) => {
      const t = l.text.trim();
      return /^(10|11|12|[1-7])$/.test(t) && l.bbox.x0 < width * 0.15;
    });

    if (timeLabels.length >= 2) {
      const sorted = timeLabels.sort((a, b) => a.bbox.y0 - b.bbox.y0);
      const firstLabel = sorted[0];
      const lastLabel = sorted[sorted.length - 1];
      const hourDiff = (() => {
        const parseHour = (t: string) => {
          const num = parseInt(t, 10);
          return num >= 9 ? num : num + 12;
        };
        return parseHour(lastLabel.text.trim()) - parseHour(firstLabel.text.trim());
      })();
      if (hourDiff > 0) {
        const yDiff = lastLabel.bbox.y0 - firstLabel.bbox.y0;
        pixelsPerMinute = yDiff / (hourDiff * 60);
      }
    }
  }

  const columnWidth = (gridRight - gridLeft) / dayCount;
  const getDayColumn = (gx: number) => {
    const px = gx * scale;
    return Math.floor((px - gridLeft) / columnWidth);
  };

  const visited = new Uint8Array(mask.length);
  const boxes: Array<{ minX: number; minY: number; maxX: number; maxY: number }> = [];
  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) continue;
    const queue = [start];
    visited[start] = 1;
    let minX = gridWidth;
    let minY = gridHeight;
    let maxX = 0;
    let maxY = 0;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      const x = current % gridWidth;
      const y = Math.floor(current / gridWidth);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      const currentDayCol = getDayColumn(x);
      const neighbours = [current - 1, current + 1, current - gridWidth, current + gridWidth];
      neighbours.forEach((next) => {
        if (next < 0 || next >= mask.length || visited[next] || !mask[next]) return;
        const nx = next % gridWidth;
        if (Math.abs(nx - x) > 1) return;
        // 요일 컬럼이 다르면 서로 다른 강의 블록으로 강제 분리 (목/금 뭉침 방지)
        if (getDayColumn(nx) !== currentDayCol) return;

        const colorDistance = Math.hypot(
          red[current] - red[next],
          green[current] - green[next],
          blue[current] - blue[next],
        );
        if (colorDistance > 65) return;
        visited[next] = 1;
        queue.push(next);
      });
    }
    boxes.push({ minX, minY, maxX, maxY });
  }

  return boxes
    .map((box, index): DetectedTimetableBlock | null => {
      const x = box.minX * scale;
      const y = box.minY * scale;
      const boxWidth = Math.min(width - x, (box.maxX - box.minX + 1) * scale);
      const boxHeight = Math.min(height - y, (box.maxY - box.minY + 1) * scale);
      if (boxWidth < width * 0.08 || boxHeight < height * 0.02 || y < timetableTop - 10) return null;
      const dayIndex = Math.floor((x + boxWidth / 2 - gridLeft) / columnWidth);
      if (dayIndex < 0 || dayIndex >= dayCount) return null;

      const rawCrop = document.createElement("canvas");
      rawCrop.width = Math.max(1, Math.round(boxWidth));
      rawCrop.height = Math.max(1, Math.round(boxHeight));
      rawCrop.getContext("2d")?.drawImage(canvas, x, y, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
      const crop = preprocessBlockCanvas(rawCrop);
      const start = snapTime(firstMinute + (y - timetableTop) / pixelsPerMinute);
      const end = snapTime(firstMinute + (y + boxHeight - timetableTop) / pixelsPerMinute);
      return {
        id: `block-${index}`,
        crop,
        day: DAYS[dayIndex],
        startTime: padTime(start),
        endTime: padTime(end),
        rawText: "",
        confidence: 0,
      };
    })
    .filter((block): block is DetectedTimetableBlock => block !== null);
}

const normalize = (value: string) => value.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
const TIME_TOLERANCE_MINUTES = 25;

const CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];
const JUNGSUNG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];
const JONGSUNG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export function decomposeHangul(text: string): string {
  let result = "";
  const normalized = text.toLowerCase().replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]/g, "");
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const cho = Math.floor(offset / 588);
      const jung = Math.floor((offset % 588) / 28);
      const jong = offset % 28;
      result += CHOSUNG[cho] + JUNGSUNG[jung] + JONGSUNG[jong];
    } else {
      result += normalized[i];
    }
  }
  return result;
}

export function hangulSimilarity(left: string, right: string): number {
  const a = decomposeHangul(left);
  const b = decomposeHangul(right);
  if (!a || !b) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, index) => index);
  for (let j = 1; j <= b.length; j += 1) {
    let previous = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const saved = dp[i];
      dp[i] = Math.min(
        dp[i] + 1,
        dp[i - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = saved;
    }
  }
  return 1 - dp[a.length] / Math.max(a.length, b.length);
}

const timeToMinutes = (value: string) => {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
};

const sameTime = (left: string, right: string) =>
  Math.abs(timeToMinutes(left) - timeToMinutes(right)) <= TIME_TOLERANCE_MINUTES;

const commonPrefixLength = (left: string, right: string) => {
  const a = normalize(left);
  const b = normalize(right);
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) index += 1;
  return index;
};

/** OCR이 과목명의 맨 앞/뒤 글자를 기호/숫자로 읽거나 일부만 읽은 경우까지 후보 기반으로 허용한다. */
const titleMatches = (detected: string, official: string, threshold: number) => {
  const cleanDetected = detected
    .replace(/^[0-9\s\[\]\(\)\-_|\\/.,]+/, "")
    .replace(/[0-9\s\[\]\(\)\-_|\\/.,]+$/, "");
  const detectedNormalized = normalize(cleanDetected || detected);
  const officialNormalized = normalize(official);
  if (!detectedNormalized || !officialNormalized) return false;
  if (
    similarity(detectedNormalized, officialNormalized) >= threshold ||
    hangulSimilarity(detectedNormalized, officialNormalized) >= threshold
  ) {
    return true;
  }

  // 앞/뒤 또는 중간 부분이 2글자 이상 포함되어 있는 경우 (예: 콘크리트 in 철근콘크리트, 축구조실험 in 건축구조실험)
  if (
    (detectedNormalized.length >= 2 && officialNormalized.includes(detectedNormalized)) ||
    (officialNormalized.length >= 2 && detectedNormalized.includes(officialNormalized))
  ) {
    return true;
  }

  // 3글자 이상 서브스트링 포함 여부 검사
  if (detectedNormalized.length >= 3) {
    for (let i = 0; i <= detectedNormalized.length - 3; i += 1) {
      if (officialNormalized.includes(detectedNormalized.slice(i, i + 3))) return true;
    }
  }

  const lengthDifference = Math.abs(
    detectedNormalized.length - officialNormalized.length,
  );
  if (lengthDifference > 2) return false;
  const shorter = detectedNormalized.length <= officialNormalized.length
    ? detectedNormalized
    : officialNormalized;
  const longer = shorter === detectedNormalized
    ? officialNormalized
    : detectedNormalized;
  return longer.startsWith(shorter) || longer.endsWith(shorter);
};

export function parseAndGroupBlocks(blocks: DetectedTimetableBlock[]): DetectedCourseGroup[] {
  const groups = new Map<string, DetectedCourseGroup>();
  blocks.forEach((block) => {
    // 수업 유형 표기 제거
    const withoutMetadata = block.rawText
      .replace(/\[[^\]]*(?:수업|강좌)[^\]]*\]/g, "")
      .replace(/\([^)]*(?:수업|강좌)[^)]*\)/g, "")
      .replace(/75\s*분\s*수업/g, "");
    const cleaned = withoutMetadata
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    // 호실 패턴 정규식: 07-505, NC-306, 7, 07, 505호, B101 등
    const isLocation = (line: string) => {
      const stripped = line.replace(/\s/g, "");
      return (
        /^[A-Za-z0-9가-힣]{1,6}-[A-Za-z0-9]{1,4}(?:호)?$/.test(stripped) ||
        /^[0-9OoIl]{1,2}-[0-9OoIl]{1,4}(?:호)?$/.test(stripped) ||
        /^\d{1,4}(?:호|호관|관)?$/.test(stripped) ||
        /^[A-Za-z]{1,3}\d{0,3}$/.test(stripped) ||
        /^(컨설팅룸|실습실|강의실|대강당|소강당|세미나실)$/.test(stripped)
      );
    };

    const KOREAN_SURNAMES = new Set(
      "김이박최정강조윤장임한오서신권황안송전홍유고문양손배백허남심노하곽성차주우구민진지엄채원천방공현함변염추도석선설마길연표명기반왕금옥육인맹탁국어은".split(""),
    );

    const isProfessorName = (line: string) => {
      const stripped = line.replace(/\s/g, "");
      if (/^[가-힣]{2,4}$/.test(stripped)) {
        return KOREAN_SURNAMES.has(stripped[0]) || stripped.startsWith("교수");
      }
      return /^[A-Za-z\s.]{4,20}$/.test(stripped);
    };

    const linesWithoutLocation = cleaned.filter((line) => !isLocation(line));
    const lastLine = cleaned.at(-1) ?? "";
    const hasLocationLast = isLocation(lastLine);
    let professor = "";
    let titleParts = linesWithoutLocation;

    if (hasLocationLast) {
      if (linesWithoutLocation.length > 2) {
        professor = linesWithoutLocation.at(-1) ?? "";
        titleParts = linesWithoutLocation.slice(0, -1);
      } else if (linesWithoutLocation.length === 2 && isProfessorName(linesWithoutLocation[1])) {
        professor = linesWithoutLocation[1];
        titleParts = [linesWithoutLocation[0]];
      }
    } else if (linesWithoutLocation.length > 1) {
      professor = linesWithoutLocation.at(-1) ?? "";
      titleParts = linesWithoutLocation.slice(0, -1);
    }

    let title = titleParts.join("") || cleaned[0] || "인식 실패";
    title = title.replace(/[|—_=\\<>]/g, "").trim();

    // 앞뒤에 붙은 OCR 기호 및 노이즈 제거 (예: [축구조실험1 -> 축구조실험1)
    title = title
      .replace(/^[^가-힣A-Za-z0-9]+/, "")
      .replace(/[^가-힣A-Za-z0-9)]+$/, "")
      .replace(/\s+[A-Za-z]{1,4},\s*[A-Za-z]{1,4}$/, "")
      .replace(/\s+[ㄱ-ㅎㅏ-ㅣ\s.]+$/, "")
      .trim();

    const isUnrecognized = title === "인식 실패" || !normalize(title) || isLocation(title);
    const key = isUnrecognized ? block.id : `${normalize(title)}:${normalize(professor)}`;
    const existing = isUnrecognized ? undefined : groups.get(key);
    if (existing) existing.blocks.push(block);
    else groups.set(key, { id: block.id, title, professor, rawText: block.rawText, blocks: [block] });
  });
  return [...groups.values()];
}

function similarity(left: string, right: string) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, index) => index);
  for (let j = 1; j <= b.length; j += 1) {
    let previous = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const saved = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return 1 - dp[a.length] / Math.max(a.length, b.length);
}

export function scoreOffering(group: DetectedCourseGroup, offering: CourseOffering) {
  const rawTitleSim = similarity(group.title, offering.courseTitle);
  const jamoTitleSim = hangulSimilarity(group.title, offering.courseTitle);
  let titleSim = Math.max(rawTitleSim, jamoTitleSim);

  const groupNorm = normalize(group.title);
  const offNorm = normalize(offering.courseTitle);
  if (groupNorm.length >= 2 && (offNorm.includes(groupNorm) || groupNorm.includes(offNorm))) {
    titleSim = Math.max(titleSim, 0.75);
  }

  const rawProfSim = similarity(group.professor, offering.professor ?? "");
  const jamoProfSim = hangulSimilarity(group.professor, offering.professor ?? "");
  const profSim = Math.max(rawProfSim, jamoProfSim);

  const titleScore = titleSim * 50;
  const professorScore = group.professor ? profSim * 20 : 0;
  const matchedMeetings = group.blocks.filter((block) =>
    offering.meetings.some(
      (meeting) =>
        meeting.day === block.day &&
        sameTime(meeting.startTime, block.startTime) &&
        sameTime(meeting.endTime, block.endTime),
    ),
  ).length;
  const scheduleScore = (matchedMeetings / Math.max(group.blocks.length, offering.meetings.length, 1)) * 30;
  return titleScore + professorScore + scheduleScore;
}

/** 한 OCR 그룹이 특정 개설 분반의 일부 블록인지 판별한다. 병합은 이 결과가 유일할 때만 한다. */
export function isOfferingFragmentMatch(
  group: DetectedCourseGroup,
  offering: CourseOffering,
) {
  const hasProfessor = normalize(group.professor).length >= 2;
  const profSim = Math.max(
    similarity(group.professor, offering.professor ?? ""),
    hangulSimilarity(group.professor, offering.professor ?? ""),
  );
  if (hasProfessor && profSim < 0.75) return false;
  const requiredTitleSimilarity = hasProfessor ? 0.40 : 0.45;
  const titleSim = Math.max(
    similarity(group.title, offering.courseTitle),
    hangulSimilarity(group.title, offering.courseTitle),
  );
  if (
    !titleMatches(group.title, offering.courseTitle, requiredTitleSimilarity) &&
    titleSim < requiredTitleSimilarity &&
    commonPrefixLength(group.title, offering.courseTitle) < 2
  ) return false;
  return group.blocks.every((block) =>
    offering.meetings.some(
      (meeting) =>
        meeting.day === block.day &&
        sameTime(meeting.startTime, block.startTime) &&
        sameTime(meeting.endTime, block.endTime),
    ),
  );
}

export function isConfidentOfferingMatch(
  group: DetectedCourseGroup,
  offering: CourseOffering,
) {
  const profSim = Math.max(
    similarity(group.professor, offering.professor ?? ""),
    hangulSimilarity(group.professor, offering.professor ?? ""),
  );
  const professorReliable =
    normalize(group.professor).length >= 2 && profSim >= 0.85;

  const titleSim = Math.max(
    similarity(group.title, offering.courseTitle),
    hangulSimilarity(group.title, offering.courseTitle),
  );
  const titleReliable =
    titleMatches(group.title, offering.courseTitle, 0.50) ||
    titleSim >= 0.50 ||
    commonPrefixLength(group.title, offering.courseTitle) >= 2;

  if (!professorReliable && !titleReliable) return false;

  return group.blocks.every((block) =>
    offering.meetings.some(
      (meeting) =>
        meeting.day === block.day &&
        sameTime(meeting.startTime, block.startTime) &&
        sameTime(meeting.endTime, block.endTime),
    ),
  );
}

/** 후보 목록에서 자동 선택해도 되는 유일한 분반을 우선순위에 따라 찾는다. */
export function findConfidentOffering(
  group: DetectedCourseGroup,
  candidates: CourseOffering[],
): CourseOffering | null {
  const unique = (items: CourseOffering[]) => items.length === 1 ? items[0] : null;

  // 1. 교수(또는 과목명)와 검출 시간이 모두 맞는 후보
  const scheduleCandidates = candidates.filter((offering) => isConfidentOfferingMatch(group, offering));
  if (scheduleCandidates.length === 1) return scheduleCandidates[0];
  if (scheduleCandidates.length > 1) {
    const sorted = scheduleCandidates
      .map((offering) => ({ offering, score: scoreOffering(group, offering) }))
      .sort((a, b) => b.score - a.score);
    if (sorted[0].score >= 35 && (sorted.length === 1 || sorted[0].score - (sorted[1]?.score ?? 0) >= 6)) {
      return sorted[0].offering;
    }
  }

  // 2. OCR 과목명과 교수명이 모두 높은 유사도를 가지는 유일한 후보
  const exactIdentity = unique(
    candidates.filter((offering) => {
      const titleSim = Math.max(
        similarity(group.title, offering.courseTitle),
        hangulSimilarity(group.title, offering.courseTitle),
      );
      const profSim = Math.max(
        similarity(group.professor, offering.professor ?? ""),
        hangulSimilarity(group.professor, offering.professor ?? ""),
      );
      return titleSim >= 0.80 && (group.professor ? profSim >= 0.75 : true);
    }),
  );
  if (exactIdentity) return exactIdentity;

  // 3. 시간으로 좁힌 후보군에서 OCR 교수명이나 과목명이 일치하는 후보가 하나뿐인 경우
  const scored = candidates
    .map((offering) => ({
      offering,
      score: scoreOffering(group, offering),
    }))
    .filter((item) => item.score >= 25)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 1) return scored[0].offering;
  if (scored.length > 1 && scored[0].score - scored[1].score >= 8) {
    return scored[0].offering;
  }

  // 4. 글자가 불완전하더라도 해당 요일/시간대에 정확히 일치하는 단일 개설 강좌가 존재하는 경우
  const exactTimeMatched = candidates.filter((offering) =>
    group.blocks.every((block) =>
      offering.meetings.some(
        (m) =>
          m.day === block.day &&
          sameTime(m.startTime, block.startTime) &&
          sameTime(m.endTime, block.endTime),
      ),
    ),
  );
  if (exactTimeMatched.length === 1) {
    return exactTimeMatched[0];
  }

  // 5. 단일 후보이고 요일이 일치하는 경우
  if (candidates.length === 1) {
    const single = candidates[0];
    const isDayMatched = group.blocks.every((block) =>
      single.meetings.some((meeting) => meeting.day === block.day),
    );
    if (isDayMatched) return single;
  }

  return null;
}

/** 시간 후보 중 OCR 과목명과 대응하는 정식 과목명이 하나일 때 표시명 보정에 사용한다. */
export function findUniqueTitleOffering(
  detectedTitle: string,
  candidates: CourseOffering[],
): CourseOffering | null {
  const matches = candidates.filter((offering) => {
    const titleSim = Math.max(
      similarity(detectedTitle, offering.courseTitle),
      hangulSimilarity(detectedTitle, offering.courseTitle),
    );
    return titleMatches(detectedTitle, offering.courseTitle, 0.75) || titleSim >= 0.75;
  });
  const uniqueTitles = new Set(matches.map((offering) => normalize(offering.courseTitle)));
  return uniqueTitles.size === 1 ? matches[0] : null;
}
