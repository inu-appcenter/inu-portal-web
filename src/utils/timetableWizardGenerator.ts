import { formatHoursToTime } from "@/utils/timetable";
import type {
  WizardCandidate,
  WizardConditions,
  WizardConflictItem,
  WizardCourseMeeting,
  WizardCourseOption,
  WizardGenerationResult,
  WizardPreferenceConditions,
  WizardReason,
} from "@/types/timetableWizard";

const DAY_NAMES = ["월", "화", "수", "목", "금"];
const SLOT_STEP = 0.5;
const NIGHT_THRESHOLD = 18;
// 1교시 표준 강의시간을 90분으로 가정해 연속 구간의 대략적인 "N연강"을 추정한다 (서버에 교시 데이터 없음)
const PERIOD_HOURS = 1.5;

const meetingToSlots = (m: WizardCourseMeeting): string[] => {
  const slots: string[] = [];
  for (let t = m.startTime; t < m.endTime - 1e-6; t += SLOT_STEP) {
    slots.push(`${m.day}-${t}`);
  }
  return slots;
};

const courseSlots = (course: WizardCourseOption): string[] =>
  course.meetings.flatMap(meetingToSlots);

const hasTimeConflict = (a: WizardCourseOption, b: WizardCourseOption): boolean => {
  const bSlots = new Set(courseSlots(b));
  return courseSlots(a).some((s) => bSlots.has(s));
};

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

interface TrialResult {
  courses: WizardCourseOption[];
  totalCredit: number;
}

const runTrial = (
  mustHave: WizardCourseOption[],
  remainingPool: WizardCourseOption[],
  minCredit: number,
  maxCredit: number,
): TrialResult | null => {
  const picked = [...mustHave];
  const pickedCourseIds = new Set(picked.map((c) => c.courseId));
  const occupiedSlots = new Set(picked.flatMap(courseSlots));
  let totalCredit = picked.reduce((s, c) => s + c.credit, 0);

  if (totalCredit > maxCredit) return null;

  for (const course of shuffle(remainingPool)) {
    if (pickedCourseIds.has(course.courseId)) continue; // 같은 과목의 다른 분반 중복 방지
    if (totalCredit + course.credit > maxCredit) continue;

    const slots = courseSlots(course);
    if (new Set(slots).size !== slots.length) continue; // 데이터 이상(자체 시간 중복) 방어
    if (slots.some((s) => occupiedSlots.has(s))) continue;

    picked.push(course);
    pickedCourseIds.add(course.courseId);
    slots.forEach((s) => occupiedSlots.add(s));
    totalCredit += course.credit;

    if (totalCredit >= maxCredit) break;
  }

  if (totalCredit < minCredit) return null;
  return { courses: picked, totalCredit };
};

const scorePreferences = (
  courses: WizardCourseOption[],
  pref: WizardPreferenceConditions,
): { score: number; reasons: WizardReason[] } => {
  const reasons: WizardReason[] = [];
  let score = 0;

  const meetingsByDay: WizardCourseMeeting[][] = [[], [], [], [], []];
  courses.forEach((c) =>
    c.meetings.forEach((m) => meetingsByDay[m.day]?.push(m)),
  );
  meetingsByDay.forEach((list) => list.sort((a, b) => a.startTime - b.startTime));
  const freeDays = meetingsByDay.map((list) => list.length === 0);

  // C-01 공강 많은 시간표: 하드 조건이 아니라 "많을수록 좋다"이므로 개수를 점수에 가중
  if (pref.manyFreeDays) {
    const freeDayCount = freeDays.filter(Boolean).length;
    score += freeDayCount * 1.5;
    if (freeDayCount > 0) {
      const names = DAY_NAMES.filter((_, i) => freeDays[i]).join(", ");
      reasons.push({
        met: true,
        headline: `${names}요일 공강`,
        detail: "선택한 조건 그대로 충족했어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: "공강 없음",
        detail: "목표 학점을 채우려면 매일 수업이 필요해요",
      });
    }
  }

  // C-02 특정 요일 공강
  if (pref.freeDayOfWeek.enabled && pref.freeDayOfWeek.days.length > 0) {
    const allFree = pref.freeDayOfWeek.days.every((d) => freeDays[d]);
    const names = pref.freeDayOfWeek.days.map((d) => DAY_NAMES[d]).join(", ");
    if (allFree) {
      score += 3;
      reasons.push({
        met: true,
        headline: `${names}요일 공강`,
        detail: "선택한 조건 그대로 충족했어요",
      });
    } else {
      const conflictDay = pref.freeDayOfWeek.days.find((d) => !freeDays[d]);
      const earliest = conflictDay !== undefined ? meetingsByDay[conflictDay][0] : undefined;
      reasons.push({
        met: false,
        headline: `${names}요일 공강 아님`,
        detail: earliest
          ? `${DAY_NAMES[conflictDay!]} ${formatHoursToTime(earliest.startTime)} 수업이 있어요`
          : "목표 학점을 채우려면 해당 요일 수업이 필요해요",
      });
    }
  }

  // C-03 오전 수업 없는 시간표
  if (pref.noMorningClasses.enabled) {
    const starts = courses.flatMap((c) => c.meetings.map((m) => m.startTime));
    const earliestStart = starts.length > 0 ? Math.min(...starts) : null;
    if (earliestStart === null || earliestStart >= pref.noMorningClasses.startAfter) {
      score += 3;
      reasons.push({
        met: true,
        headline: `오전 수업 없음 (${formatHoursToTime(earliestStart ?? pref.noMorningClasses.startAfter)} 시작)`,
        detail: "선택한 조건 그대로 충족했어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: `오전 ${formatHoursToTime(earliestStart)} 수업 포함`,
        detail: "목표 학점을 채우려면 이 수업이 필요해요",
      });
    }
  }

  // C-04 야간 수업 제외
  if (pref.noNightClasses) {
    const nightMeeting = courses
      .flatMap((c) => c.meetings.map((m) => ({ ...m })))
      .find((m) => m.startTime >= NIGHT_THRESHOLD);
    if (!nightMeeting) {
      score += 2;
      reasons.push({
        met: true,
        headline: "야간 수업 없음",
        detail: "선택한 조건 그대로 충족했어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: "야간 수업 1개 포함",
        detail: `${DAY_NAMES[nightMeeting.day]} ${formatHoursToTime(nightMeeting.startTime)} 수업을 빼면 목표 학점을 못 채워요`,
      });
    }
  }

  // C-05 연강 적은 시간표 (연속 강의 블록을 90분/교시로 근사)
  if (pref.fewConsecutive) {
    let maxPeriods = 0;
    let maxDay = -1;
    meetingsByDay.forEach((list, day) => {
      let blockStart: number | null = null;
      let blockEnd: number | null = null;
      const flushBlock = () => {
        if (blockStart === null || blockEnd === null) return;
        const periods = Math.max(1, Math.round((blockEnd - blockStart) / PERIOD_HOURS));
        if (periods > maxPeriods) {
          maxPeriods = periods;
          maxDay = day;
        }
      };
      list.forEach((m) => {
        if (blockEnd !== null && Math.abs(m.startTime - blockEnd) < 0.01) {
          blockEnd = m.endTime;
        } else {
          flushBlock();
          blockStart = m.startTime;
          blockEnd = m.endTime;
        }
      });
      flushBlock();
    });

    if (maxPeriods <= 2) {
      score += 2;
      reasons.push({
        met: true,
        headline: `연강 최대 ${maxPeriods}개`,
        detail: "3연강 이상 구간이 없어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: `연강 최대 ${maxPeriods}개`,
        detail: `${DAY_NAMES[maxDay]}요일에 연속 강의 구간이 있어요`,
      });
    }
  }

  // C-06 통학 시간 피하기: 위치 데이터가 없어 "하루 등교 체류 시간"을 대리 지표로 사용
  if (pref.avoidCommute) {
    let maxSpan = 0;
    let maxSpanDay = -1;
    meetingsByDay.forEach((list, day) => {
      if (list.length === 0) return;
      const span = list[list.length - 1].endTime - list[0].startTime;
      if (span > maxSpan) {
        maxSpan = span;
        maxSpanDay = day;
      }
    });

    if (maxSpanDay === -1 || maxSpan <= 6) {
      score += 1;
      reasons.push({
        met: true,
        headline: "등하교 부담 적음",
        detail: "하루 체류 시간이 6시간 이하예요",
      });
    } else {
      reasons.push({
        met: false,
        headline: "등하교 부담 있는 날 포함",
        detail: `${DAY_NAMES[maxSpanDay]}요일 체류 시간이 ${Math.round(maxSpan * 10) / 10}시간이에요`,
      });
    }
  }

  return { score, reasons };
};

interface FilterOptions {
  ignoreSlots?: boolean;
  ignoreCourses?: boolean;
}

const GENERATION_TRIALS = 220;
const DIAGNOSTIC_TRIALS = 60;

export const generateWizardCandidates = (
  pool: WizardCourseOption[],
  conditions: WizardConditions,
): WizardGenerationResult => {
  const { basic, preference, exclusion } = conditions;
  const excludedSlotSet = new Set(exclusion.excludedSlots);
  const excludedSubjectNumberSet = new Set(exclusion.excludedSubjectNumbers);
  const mustHaveSet = new Set(basic.mustHaveSubjectNumbers);

  const mustHave = basic.mustHaveSubjectNumbers
    .map((sn) => pool.find((c) => c.subjectNumber === sn))
    .filter((c): c is WizardCourseOption => !!c);

  for (let i = 0; i < mustHave.length; i++) {
    for (let j = i + 1; j < mustHave.length; j++) {
      if (hasTimeConflict(mustHave[i], mustHave[j])) {
        return {
          candidates: [],
          conflicts: [{ label: `'${mustHave[i].title}'와(과) '${mustHave[j].title}' 시간 중복` }],
        };
      }
    }
  }

  const mustHaveCredit = mustHave.reduce((s, c) => s + c.credit, 0);
  if (mustHaveCredit > basic.maxCredit) {
    return {
      candidates: [],
      conflicts: [
        { label: `꼭 넣고 싶은 강의 학점 합(${mustHaveCredit}학점)이 목표 학점(${basic.maxCredit}학점)을 초과함` },
      ],
    };
  }

  const filterPool = (opts: FilterOptions): WizardCourseOption[] =>
    pool.filter((c) => {
      if (mustHaveSet.has(c.subjectNumber)) return false;
      if (mustHave.some((m) => m.courseId === c.courseId)) return false;
      if (!opts.ignoreCourses && excludedSubjectNumberSet.has(c.subjectNumber)) return false;
      if (!opts.ignoreSlots) {
        const slots = courseSlots(c);
        if (slots.some((s) => excludedSlotSet.has(s))) return false;
      }
      return true;
    });

  const runTrials = (
    candidatePool: WizardCourseOption[],
    maxCredit: number,
    trials: number,
  ): TrialResult[] => {
    const results: TrialResult[] = [];
    for (let i = 0; i < trials; i++) {
      const trial = runTrial(mustHave, candidatePool, basic.minCredit, maxCredit);
      if (trial) results.push(trial);
    }
    return results;
  };

  const basePool = filterPool({});
  const trials = runTrials(basePool, basic.maxCredit, GENERATION_TRIALS);

  if (trials.length === 0) {
    const conflicts: WizardConflictItem[] = [];

    if (exclusion.excludedSlots.length > 0) {
      const relaxed = runTrials(filterPool({ ignoreSlots: true }), basic.maxCredit, DIAGNOSTIC_TRIALS);
      if (relaxed.length > 0) {
        conflicts.push({ label: `제외한 시간대 (${new Set(exclusion.excludedSlots).size}칸)` });
      }
    }
    if (exclusion.excludedSubjectNumbers.length > 0) {
      const relaxed = runTrials(filterPool({ ignoreCourses: true }), basic.maxCredit, DIAGNOSTIC_TRIALS);
      if (relaxed.length > 0) {
        conflicts.push({ label: `제외한 강의 (${exclusion.excludedSubjectNumbers.length}개)` });
      }
    }
    const widened = runTrials(basePool, basic.maxCredit + 3, DIAGNOSTIC_TRIALS);
    if (widened.length > 0) {
      conflicts.push({ label: `목표 학점 범위 (${basic.minCredit}~${basic.maxCredit}학점)` });
    }

    if (conflicts.length === 0) {
      conflicts.push({ label: "선택한 학기에 조건을 만족하는 개설 강의가 부족해요" });
    }

    return { candidates: [], conflicts };
  }

  const scored = trials.map((t) => {
    const { score, reasons } = scorePreferences(t.courses, preference);
    const signature = [...t.courses.map((c) => c.subjectNumber)].sort().join(",");
    return { ...t, score, reasons, signature };
  });

  const seenSignatures = new Set<string>();
  const unique = scored.filter((t) => {
    if (seenSignatures.has(t.signature)) return false;
    seenSignatures.add(t.signature);
    return true;
  });

  unique.sort((a, b) => b.score - a.score);

  const labels = ["A", "B", "C"];
  const candidates: WizardCandidate[] = unique.slice(0, 3).map((t, index) => ({
    id: labels[index],
    label: `시안 ${labels[index]}`,
    courses: t.courses,
    totalCredit: t.totalCredit,
    reasons:
      t.reasons.length > 0
        ? t.reasons
        : [
            {
              met: true,
              headline: `${t.totalCredit}학점 · ${t.courses.length}과목`,
              detail: "목표 학점 범위를 만족해요",
            },
          ],
    recommended: index === 0,
  }));

  return { candidates, conflicts: [] };
};
