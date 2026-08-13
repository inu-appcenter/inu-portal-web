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

/** 장바구니 시간표 캡처의 색상 강의 블록을 브라우저 Canvas만으로 찾는다. */
export async function detectTimetableBlocks(
  file: File,
  layout: TimetableImageLayout = "INU_CART_GRID",
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

  for (let gy = Math.floor(gridHeight * 0.12); gy < gridHeight; gy += 1) {
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
      const neighbours = [current - 1, current + 1, current - gridWidth, current + gridWidth];
      neighbours.forEach((next) => {
        if (next < 0 || next >= mask.length || visited[next] || !mask[next]) return;
        const nx = next % gridWidth;
        if (Math.abs(nx - x) > 1) return;
        // 위아래로 맞닿은 강의라도 배경색이 다르면 별도 강의 블록이다.
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

  const isEverytime = layout === "EVERYTIME_GRID";
  const gridLeft = width * (isEverytime ? 0.068 : 0.143);
  const gridRight = width * (isEverytime ? 0.976 : 1);
  const timetableTop = height * (isEverytime ? 0.12 : 0.129);
  const pixelsPerMinute = height * (isEverytime ? 0.001204 : 0.001373);
  const firstMinute = isEverytime ? 9 * 60 : 7 * 60 + 30;
  const dayCount = isEverytime ? 5 : 6;
  const columnWidth = (gridRight - gridLeft) / dayCount;

  return boxes
    .map((box, index): DetectedTimetableBlock | null => {
      const x = box.minX * scale;
      const y = box.minY * scale;
      const boxWidth = Math.min(width - x, (box.maxX - box.minX + 1) * scale);
      const boxHeight = Math.min(height - y, (box.maxY - box.minY + 1) * scale);
      if (boxWidth < width * 0.09 || boxHeight < height * 0.025 || y < timetableTop) return null;
      const dayIndex = Math.floor((x + boxWidth / 2 - gridLeft) / columnWidth);
      if (dayIndex < 0 || dayIndex >= dayCount) return null;

      const crop = document.createElement("canvas");
      crop.width = Math.max(1, Math.round(boxWidth));
      crop.height = Math.max(1, Math.round(boxHeight));
      crop.getContext("2d")?.drawImage(canvas, x, y, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
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
const TIME_TOLERANCE_MINUTES = 5;

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

/** OCR이 과목명의 맨 앞/뒤 한 글자를 기호로 읽거나 누락한 경우까지 후보 기반으로 허용한다. */
const titleMatches = (detected: string, official: string, threshold: number) => {
  const detectedNormalized = normalize(detected);
  const officialNormalized = normalize(official);
  if (!detectedNormalized || !officialNormalized) return false;
  if (similarity(detected, official) >= threshold) return true;
  const lengthDifference = Math.abs(
    detectedNormalized.length - officialNormalized.length,
  );
  if (lengthDifference > 1) return false;
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
    // 수업 유형 표기가 여러 줄로 감싸져도 먼저 전체 문자열에서 제거한다.
    const withoutMetadata = block.rawText
      .replace(/\[[^\]]*(?:수업|강좌)[^\]]*\]/g, "")
      .replace(/\([^)]*(?:수업|강좌)[^)]*\)/g, "")
      // 정상 인식된 수업 유형만 제거한다. 특정 OCR 오인식 문자열은 하드코딩하지 않는다.
      .replace(/75\s*분\s*수업/g, "");
    const cleaned = withoutMetadata
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const lastLine = cleaned.at(-1) ?? "";
    const hasLocationLast = /^[0-9OoIl]{1,2}-[0-9OoIl]{2,4}(?:호)?$/.test(
      lastLine.replace(/\s/g, ""),
    );
    const professor = hasLocationLast ? "" : lastLine;
    const titleLines = cleaned.slice(0, -1);
    const title = titleLines.join("") || cleaned[0] || "인식 실패";
    const key = `${normalize(title)}:${normalize(professor)}`;
    const existing = groups.get(key);
    if (existing) existing.blocks.push(block);
    else groups.set(key, { id: key || block.id, title, professor, rawText: block.rawText, blocks: [block] });
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
  const titleScore = similarity(group.title, offering.courseTitle) * 45;
  const professorScore = similarity(group.professor, offering.professor ?? "") * 20;
  const matchedMeetings = group.blocks.filter((block) =>
    offering.meetings.some(
      (meeting) =>
        meeting.day === block.day &&
        sameTime(meeting.startTime, block.startTime) &&
        sameTime(meeting.endTime, block.endTime),
    ),
  ).length;
  const scheduleScore = (matchedMeetings / Math.max(group.blocks.length, offering.meetings.length, 1)) * 35;
  return titleScore + professorScore + scheduleScore;
}

/** 한 OCR 그룹이 특정 개설 분반의 일부 블록인지 판별한다. 병합은 이 결과가 유일할 때만 한다. */
export function isOfferingFragmentMatch(
  group: DetectedCourseGroup,
  offering: CourseOffering,
) {
  const hasProfessor = normalize(group.professor).length >= 2;
  if (hasProfessor && similarity(group.professor, offering.professor ?? "") < 0.8) return false;
  const requiredTitleSimilarity = hasProfessor ? 0.55 : 0.8;
  if (
    !titleMatches(group.title, offering.courseTitle, requiredTitleSimilarity) &&
    commonPrefixLength(group.title, offering.courseTitle) < 4
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
  const professorReliable =
    normalize(group.professor).length >= 2 &&
    similarity(group.professor, offering.professor ?? "") >= 0.9;
  const titleReliable =
    titleMatches(group.title, offering.courseTitle, 0.85) ||
    commonPrefixLength(group.title, offering.courseTitle) >= 4;
  if (!professorReliable && !titleReliable) return false;

  // 검출된 모든 블록이 후보 분반에 포함되면 확실한 후보군으로 본다.
  // 후보가 하나뿐인지는 호출부에서 별도로 확인한다.
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
  const scheduleMatch = unique(
    candidates.filter((offering) => isConfidentOfferingMatch(group, offering)),
  );
  if (scheduleMatch) return scheduleMatch;

  // 2. OCR 과목명과 교수명이 모두 정확히 같은 유일한 후보
  const exactIdentity = unique(
    candidates.filter(
      (offering) =>
        normalize(group.title) === normalize(offering.courseTitle) &&
        normalize(group.professor) === normalize(offering.professor ?? ""),
    ),
  );
  if (exactIdentity) return exactIdentity;

  // 3. 시간으로 좁힌 후보군에서 OCR 교수명이 정확히 같은 후보가 하나뿐인 경우
  if (normalize(group.professor).length >= 2) {
    return unique(
      candidates.filter(
        (offering) =>
          normalize(group.professor) === normalize(offering.professor ?? "") &&
          group.blocks.some((block) =>
            offering.meetings.some(
              (meeting) =>
                meeting.day === block.day &&
                sameTime(meeting.startTime, block.startTime) &&
                sameTime(meeting.endTime, block.endTime),
            ),
          ),
      ),
    );
  }

  return null;
}

/** 시간 후보 중 OCR 과목명과 대응하는 정식 과목명이 하나일 때 표시명 보정에 사용한다. */
export function findUniqueTitleOffering(
  detectedTitle: string,
  candidates: CourseOffering[],
): CourseOffering | null {
  const matches = candidates.filter((offering) =>
    titleMatches(detectedTitle, offering.courseTitle, 0.8),
  );
  const uniqueTitles = new Set(matches.map((offering) => normalize(offering.courseTitle)));
  return uniqueTitles.size === 1 ? matches[0] : null;
}
