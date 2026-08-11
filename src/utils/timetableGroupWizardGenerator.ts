import { formatHoursToTime } from "@/utils/timetable";
import type {
  WizardCandidate,
  WizardConflictItem,
  WizardCourseMeeting,
  WizardCourseOption,
  WizardGenerationResult,
  WizardPreferenceConditions,
  WizardReason,
} from "@/types/timetableWizard";
import type {
  WizardCourseGroup,
  WizardGroupConditions,
} from "@/types/timetableGroupWizard";

/**
 * 그룹 마법사(에브리타임식) 조합 생성기.
 *
 * 기존 generateWizardCandidates와의 핵심 차이는 "그룹" 개념이다. 기존 생성기는 위시리스트를
 * courseId로 자동 그룹화하고 optional 그룹은 통째로 건너뛸 수 있었다. 여기서는 사용자가
 * 직접 만든 각 그룹에서 **반드시 정확히 하나씩** 꺼내 카르테시안 곱으로 경우의 수를 만든다
 * ("이 중 하나는 꼭 넣어야 한다"). 강의를 담은(비어있지 않은) 그룹만 조합 대상이다.
 *
 * 선호(C-01/03/04/05/06)는 소프트 점수, 지정요일 공강(C-02)과 제외 시간/강의는 하드 조건.
 * 이 규칙은 기존 생성기와 동일하게 맞춰 두 플로우의 결과 해석이 어긋나지 않게 한다.
 * 위시리스트처럼 그룹도 강의 스냅샷을 직접 들고 있어 이 함수는 순수 계산이다.
 */

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];
const SLOT_STEP = 0.5;
const NIGHT_THRESHOLD = 18;
const PERIOD_HOURS = 1.5;
// 그룹 수 × 그룹당 분반 수가 커도 조합 폭발을 막는 안전장치
const MAX_CANDIDATES = 5000;

const meetingToSlots = (m: WizardCourseMeeting): string[] => {
  const slots: string[] = [];
  for (let t = m.startTime; t < m.endTime - 1e-6; t += SLOT_STEP) {
    slots.push(`${m.day}-${t}`);
  }
  return slots;
};

const courseSlots = (course: WizardCourseOption): string[] =>
  course.meetings.flatMap(meetingToSlots);

interface HardConstraintFlags {
  ignoreExcludedSlots?: boolean;
  ignoreExcludedCourses?: boolean;
  ignoreFreeDayOfWeek?: boolean;
}

interface HardCheckContext {
  excludedSlotSet: Set<string>;
  excludedSubjectNumberSet: Set<string>;
  preference: WizardPreferenceConditions;
  flags: HardConstraintFlags;
}

// 강의 하나가 이미 배치된 슬롯/제외 조건과 충돌하는지. 오전·야간 회피(C-03/C-04)는
// 소프트 조건이라 여기서 탈락시키지 않고 buildReasons에서 점수로만 반영한다.
const violatesHardConstraints = (
  course: WizardCourseOption,
  occupiedSlots: Set<string>,
  ctx: HardCheckContext,
): boolean => {
  if (
    !ctx.flags.ignoreExcludedCourses &&
    ctx.excludedSubjectNumberSet.has(course.subjectNumber)
  ) {
    return true;
  }

  const { preference, flags } = ctx;
  for (const meeting of course.meetings) {
    if (
      !flags.ignoreFreeDayOfWeek &&
      preference.freeDayOfWeek.enabled &&
      preference.freeDayOfWeek.days.includes(meeting.day)
    ) {
      return true; // C-02: 지정 요일에는 수업이 아예 없어야 함
    }
  }

  const slots = courseSlots(course);
  if (new Set(slots).size !== slots.length) return true; // 데이터 이상(자체 시간 중복) 방어
  if (slots.some((s) => occupiedSlots.has(s))) return true; // 이미 배치된 강의와 겹침(또는 다른 그룹에서 같은 강의 중복 선택)
  if (!ctx.flags.ignoreExcludedSlots && slots.some((s) => ctx.excludedSlotSet.has(s)))
    return true;

  return false;
};

// 각 그룹에서 정확히 하나씩 골라 만들 수 있는 모든 유효 조합(카르테시안 곱).
// 기존 생성기와 달리 그룹을 건너뛰는 분기가 없다 - 그룹은 전부 필수다.
const searchCombinations = (
  groups: WizardCourseGroup[],
  ctx: HardCheckContext,
): WizardCourseOption[][] => {
  const results: WizardCourseOption[][] = [];

  const backtrack = (
    index: number,
    chosen: WizardCourseOption[],
    occupiedSlots: Set<string>,
  ) => {
    if (results.length >= MAX_CANDIDATES) return;
    if (index === groups.length) {
      results.push(chosen);
      return;
    }

    for (const option of groups[index].options) {
      if (violatesHardConstraints(option, occupiedSlots, ctx)) continue;
      const nextOccupied = new Set(occupiedSlots);
      courseSlots(option).forEach((s) => nextOccupied.add(s));
      backtrack(index + 1, [...chosen, option], nextOccupied);
    }
  };

  backtrack(0, [], new Set());
  return results;
};

const buildReasons = (
  courses: WizardCourseOption[],
  pref: WizardPreferenceConditions,
): { score: number; reasons: WizardReason[] } => {
  const reasons: WizardReason[] = [];
  let score = 0;

  const meetingsByDay: WizardCourseMeeting[][] = DAY_NAMES.map(() => []);
  courses.forEach((c) => c.meetings.forEach((m) => meetingsByDay[m.day]?.push(m)));
  meetingsByDay.forEach((list) => list.sort((a, b) => a.startTime - b.startTime));
  const freeDays = meetingsByDay.map((list) => list.length === 0);

  // C-02는 하드 조건이라 여기까지 온 후보는 전부 충족 상태 - 충족 사실만 표시한다.
  if (pref.freeDayOfWeek.enabled && pref.freeDayOfWeek.days.length > 0) {
    const names = pref.freeDayOfWeek.days.map((d) => DAY_NAMES[d]).join(", ");
    reasons.push({
      met: true,
      headline: `${names}요일 공강`,
      detail: "선택한 조건 그대로 충족했어요",
    });
  }

  const allMeetings = courses.flatMap((c) => c.meetings);

  // C-03 오전 수업 없음 (소프트)
  if (pref.noMorningClasses.enabled) {
    const startAfter = pref.noMorningClasses.startAfter;
    const earlyMeetings = allMeetings.filter((m) => m.startTime < startAfter);
    if (earlyMeetings.length === 0) {
      score += 3;
      reasons.push({
        met: true,
        headline: `오전 수업 없음 (${formatHoursToTime(startAfter)} 이후 시작)`,
        detail: "선택한 조건 그대로 충족했어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: `오전 수업 있음 (${formatHoursToTime(startAfter)} 이전 시작)`,
        detail: "담은 강의만으로는 오전 수업을 완전히 피할 수 없어요",
      });
    }
  }

  // C-04 야간 수업 제외 (소프트)
  if (pref.noNightClasses) {
    const nightMeetings = allMeetings.filter((m) => m.startTime >= NIGHT_THRESHOLD);
    if (nightMeetings.length === 0) {
      score += 3;
      reasons.push({
        met: true,
        headline: "야간 수업 없음",
        detail: "18시 이후 시작하는 수업이 없어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: "야간 수업 포함",
        detail: `${nightMeetings.length}개 수업이 18시 이후에 시작해요`,
      });
    }
  }

  // C-01 공강 많은 시간표 (소프트: 많을수록 가점)
  if (pref.manyFreeDays) {
    const freeDayCount = freeDays.filter(Boolean).length;
    score += freeDayCount * 1.5;
    if (freeDayCount > 0) {
      const names = DAY_NAMES.filter((_, i) => freeDays[i]).join(", ");
      reasons.push({
        met: true,
        headline: `${names}요일 공강`,
        detail: "담은 강의로 만들 수 있는 공강을 최대한 확보했어요",
      });
    } else {
      reasons.push({
        met: false,
        headline: "공강 없음",
        detail: "담은 강의만으로는 공강을 만들 수 없어요",
      });
    }
  }

  // C-05 연강 적은 시간표 (소프트, 90분/교시로 근사)
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

  // C-06 통학 시간 피하기 (소프트: 하루 등교 체류 시간을 대리 지표로)
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

const makeContext = (
  conditions: WizardGroupConditions,
  flags: HardConstraintFlags = {},
): HardCheckContext => ({
  excludedSlotSet: new Set(conditions.exclusion.excludedSlots),
  excludedSubjectNumberSet: new Set(
    conditions.exclusion.excludedCourses.map((c) => c.subjectNumber),
  ),
  preference: conditions.preference,
  flags,
});

export const generateGroupWizardCandidates = (
  conditions: WizardGroupConditions,
): WizardGenerationResult => {
  const { basic } = conditions;
  // 강의가 하나라도 담긴 그룹만 조합 대상. 빈 그룹은 "선택지 없음"이라 조용히 건너뛴다.
  const groups = basic.groups.filter((g) => g.options.length > 0);

  if (groups.length === 0) {
    return {
      candidates: [],
      conflicts: [{ label: "각 그룹에 강의를 1개 이상 담아주세요" }],
    };
  }

  const baseCtx = makeContext(conditions);
  const full = searchCombinations(groups, baseCtx);

  const withinCredit = full.filter((courses) => {
    const total = courses.reduce((s, c) => s + c.credit, 0);
    return total >= basic.minCredit && total <= basic.maxCredit;
  });

  if (withinCredit.length === 0) {
    const conflicts: WizardConflictItem[] = [];

    if (full.length === 0) {
      // 하드 조건을 하나씩 완화해보고, 완화 시 결과가 생기는 조건만 원인으로 지목한다
      const { preference, exclusion } = conditions;
      const relaxationChecks: { label: string; flags: HardConstraintFlags }[] = [];

      if (exclusion.excludedSlots.length > 0) {
        relaxationChecks.push({
          label: `제외한 시간대 (${new Set(exclusion.excludedSlots).size}칸)`,
          flags: { ignoreExcludedSlots: true },
        });
      }
      if (exclusion.excludedCourses.length > 0) {
        relaxationChecks.push({
          label: `제외한 강의 (${exclusion.excludedCourses.length}개)`,
          flags: { ignoreExcludedCourses: true },
        });
      }
      if (preference.freeDayOfWeek.enabled && preference.freeDayOfWeek.days.length > 0) {
        const names = preference.freeDayOfWeek.days.map((d) => DAY_NAMES[d]).join(", ");
        relaxationChecks.push({
          label: `${names}요일 공강`,
          flags: { ignoreFreeDayOfWeek: true },
        });
      }

      for (const check of relaxationChecks) {
        const relaxed = searchCombinations(groups, makeContext(conditions, check.flags));
        if (relaxed.length > 0) conflicts.push({ label: check.label });
      }

      if (conflicts.length === 0) {
        conflicts.push({ label: "각 그룹에서 하나씩 골라도 시간이 서로 겹쳐요" });
      }
    } else {
      // 하드 조건은 통과하지만 목표 학점 범위를 못 맞춤
      const achievable = [
        ...new Set(full.map((courses) => courses.reduce((s, c) => s + c.credit, 0))),
      ].sort((a, b) => a - b);
      conflicts.push({
        label: `목표 학점 범위 (${basic.minCredit}~${basic.maxCredit}학점) - 그룹 조합으로 가능한 학점: ${achievable.join(", ")}학점`,
      });
    }

    return { candidates: [], conflicts };
  }

  const scored = withinCredit.map((courses) => {
    const { score, reasons } = buildReasons(courses, conditions.preference);
    const totalCredit = courses.reduce((s, c) => s + c.credit, 0);
    const signature = courses
      .map((c) => c.subjectNumber)
      .sort()
      .join(",");
    return { courses, totalCredit, score, reasons, signature };
  });

  // 서로 다른 그룹 배치가 같은 시간표를 만들 수 있으니 시그니처로 중복 제거
  const seenSignatures = new Set<string>();
  const unique = scored.filter((t) => {
    if (seenSignatures.has(t.signature)) return false;
    seenSignatures.add(t.signature);
    return true;
  });

  // 모든 그룹을 채운 조합만 나오므로(그룹 건너뛰기 없음) 과목 수는 전부 같다 - 선호 점수로만 정렬
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
