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
  WizardWishlistItem,
} from "@/types/timetableWizard";

// 이 파일의 핵심 원칙: 생성기는 학기 전체 개설강의를 뒤지지 않는다. 사용자가 "듣고
// 싶은 강의"에 직접 담은 위시리스트 안에서만 조합을 탐색한다(장바구니 기반 백트래킹).
// 위시리스트가 강의 스냅샷을 직접 들고 있어 서버 조회 상태에 전혀 의존하지 않는다 -
// 조건만 있으면 언제든 같은 결과가 나오는 순수 함수다.
// 위시리스트가 6개 이하로 작아 전수 탐색이 충분히 빠르므로 랜덤 샘플링이 필요 없다.
// 같은 과목(courseId)의 여러 분반을 담으면 "그중 하나만 선택"하는 대안 그룹이 되고,
// required=false(선택)로 표시한 그룹은 통째로 건너뛰는 분기도 함께 탐색한다.

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];
const SLOT_STEP = 0.5;
const NIGHT_THRESHOLD = 18;
// 1교시 표준 강의시간을 90분으로 가정해 연속 구간의 대략적인 "N연강"을 추정한다 (서버에 교시 데이터 없음)
const PERIOD_HOURS = 1.5;
// 위시리스트가 커도 조합 폭발을 막는 안전장치 (정상적인 6개 이하 위시리스트에서는 절대 도달하지 않음)
const MAX_CANDIDATES = 5000;

const EPSILON = 1e-6;

// 두 수업 시간이 실제로 겹치는지(같은 요일 + 구간 교차). 예전에는 시작 시각부터 30분씩
// 끊은 슬롯 문자열 집합으로 판정했는데, 45분 수업처럼 30분 배수가 아닌 시간이 오면
// 슬롯 격자가 서로 어긋나 겹침을 통째로 놓쳤다(예: 09:00~09:45와 09:45~11:00).
const meetingsOverlap = (a: WizardCourseMeeting, b: WizardCourseMeeting): boolean =>
  a.day === b.day &&
  a.startTime < b.endTime - EPSILON &&
  b.startTime < a.endTime - EPSILON;

const overlapsAny = (
  course: WizardCourseOption,
  meetings: WizardCourseMeeting[],
): boolean => course.meetings.some((m) => meetings.some((o) => meetingsOverlap(m, o)));

// 제외 시간대만은 사용자가 30분 격자(TimetableGrid 선택 칸)에서 고른 값이라, 수업이
// 조금이라도 걸치는 30분 칸을 전부 구해서 비교한다(시작은 내림, 끝은 걸친 칸까지).
const meetingToGridSlots = (m: WizardCourseMeeting): string[] => {
  const slots: string[] = [];
  for (
    let t = Math.floor(m.startTime / SLOT_STEP) * SLOT_STEP;
    t < m.endTime - EPSILON;
    t += SLOT_STEP
  ) {
    slots.push(`${m.day}-${t}`);
  }
  return slots;
};

const courseGridSlots = (course: WizardCourseOption): string[] =>
  course.meetings.flatMap(meetingToGridSlots);

interface WishlistGroup {
  courseId: number;
  title: string;
  required: boolean;
  options: WizardCourseOption[];
}

// 위시리스트를 courseId 기준으로 묶는다. 같은 과목을 여러 분반 담았다면 그 분반들이
// 하나의 그룹 안에서 서로 대안이 되고, 하나라도 required면 그룹 전체를 필수로 취급한다.
//
// 위시리스트 항목이 강의 스냅샷을 직접 들고 있으므로 후보 풀에서 되찾는 단계가 없다.
// 예전에는 여기서 pool 조회에 실패한 항목을 `continue`로 조용히 버렸는데, 그게 곧
// "담아둔 강의가 추천에서 아무 말 없이 사라지는" 버그였다.
const buildGroups = (wishlist: WizardWishlistItem[]): WishlistGroup[] => {
  const groups = new Map<number, WishlistGroup>();

  for (const item of wishlist) {
    const course = item.course;
    const existing = groups.get(course.courseId);
    if (existing) {
      existing.options.push(course);
      existing.required = existing.required || item.required;
    } else {
      groups.set(course.courseId, {
        courseId: course.courseId,
        title: course.title,
        required: item.required,
        options: [course],
      });
    }
  }

  return [...groups.values()];
};

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

// 이 강의 하나가 이미 배치된 슬롯과 무관하게 그 자체로 하드 조건을 위반하는지(요일 지정공강만
// 하드). 오전/야간 회피(C-03/C-04)는 참고 아티팩트에서도 score()에만 반영되는 소프트
// 조건이라 여기서는 검사하지 않는다 - buildReasons()에서 점수로만 반영한다.
// 이미 배치된 수업 시간·제외 시간대와 겹치는지도 함께 확인한다.
const violatesHardConstraints = (
  course: WizardCourseOption,
  occupiedMeetings: WizardCourseMeeting[],
  ctx: HardCheckContext,
): boolean => {
  if (!ctx.flags.ignoreExcludedCourses && ctx.excludedSubjectNumberSet.has(course.subjectNumber)) {
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

  // 데이터 이상(자체 시간 중복) 방어
  const own = course.meetings;
  for (let i = 0; i < own.length; i += 1) {
    for (let j = i + 1; j < own.length; j += 1) {
      if (meetingsOverlap(own[i], own[j])) return true;
    }
  }

  if (overlapsAny(course, occupiedMeetings)) return true; // 이미 배치된 강의와 겹침
  if (
    !ctx.flags.ignoreExcludedSlots &&
    courseGridSlots(course).some((s) => ctx.excludedSlotSet.has(s))
  ) {
    return true;
  }

  return false;
};

// 위시리스트 그룹들에 대해 가능한 모든 유효 조합을 백트래킹으로 탐색한다.
// required 그룹은 반드시 분반 하나를 선택해야 하고, optional 그룹은 통째로 건너뛸 수도 있다.
const searchCombinations = (
  groups: WishlistGroup[],
  ctx: HardCheckContext,
): WizardCourseOption[][] => {
  const results: WizardCourseOption[][] = [];

  const backtrack = (
    index: number,
    chosen: WizardCourseOption[],
    occupiedMeetings: WizardCourseMeeting[],
  ) => {
    if (results.length >= MAX_CANDIDATES) return;
    if (index === groups.length) {
      results.push(chosen);
      return;
    }

    const group = groups[index];
    for (const option of group.options) {
      if (violatesHardConstraints(option, occupiedMeetings, ctx)) continue;
      backtrack(index + 1, [...chosen, option], [...occupiedMeetings, ...option.meetings]);
    }

    if (!group.required) {
      backtrack(index + 1, chosen, occupiedMeetings); // 선택 과목은 이번 조합에서 통째로 제외 가능
    }
  };

  backtrack(0, [], []);
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

  // C-02는 하드 조건이라 여기까지 살아남은 후보는 전부 충족한 상태 - "왜 이 조합을
  // 추천했는지" 보여주기 위해 충족 사실만 표시한다.
  if (pref.freeDayOfWeek.enabled && pref.freeDayOfWeek.days.length > 0) {
    const names = pref.freeDayOfWeek.days.map((d) => DAY_NAMES[d]).join(", ");
    reasons.push({
      met: true,
      headline: `${names}요일 공강`,
      detail: "선택한 조건 그대로 충족했어요",
    });
  }

  // C-03/C-04는 소프트 조건(점수만 반영, 탈락 없음) - 담은 위시리스트만으로는 못 지킬 수도
  // 있으므로 후보마다 실제로 만족했는지 확인해서 점수/이유를 다르게 보여준다.
  const allMeetings = courses.flatMap((c) => c.meetings);

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

  // C-01 공강 많은 시간표 (소프트: 많을수록 좋다 - 점수만 가중, 탈락 없음)
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

  // C-05 연강 적은 시간표 (소프트, 연속 강의 블록을 90분/교시로 근사)
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

  // C-06 통학 시간 피하기 (소프트: 위치 데이터가 없어 "하루 등교 체류 시간"을 대리 지표로 사용)
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
  conditions: WizardConditions,
  flags: HardConstraintFlags = {},
): HardCheckContext => ({
  excludedSlotSet: new Set(conditions.exclusion.excludedSlots),
  excludedSubjectNumberSet: new Set(
    conditions.exclusion.excludedCourses.map((c) => c.subjectNumber),
  ),
  preference: conditions.preference,
  flags,
});

export const generateWizardCandidates = (
  conditions: WizardConditions,
): WizardGenerationResult => {
  const { basic } = conditions;
  const groups = buildGroups(basic.wishlist);

  if (groups.length === 0) {
    return {
      candidates: [],
      conflicts: [{ label: "듣고 싶은 강의를 먼저 담아주세요" }],
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
      // 하드 조건을 하나씩 완화해보고, 완화 시 결과가 나오는 조건만 원인으로 지목한다
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
      // 오전/야간 회피(C-03/C-04)는 소프트 조건이라 후보를 탈락시키지 않으므로 결과 0개의
      // 원인이 될 수 없다 - 완화 후보 목록에서 제외.

      for (const check of relaxationChecks) {
        const relaxed = searchCombinations(groups, makeContext(conditions, check.flags));
        if (relaxed.length > 0) conflicts.push({ label: check.label });
      }

      if (conflicts.length === 0) {
        conflicts.push({ label: "담은 강의끼리 시간이 겹쳐요" });
      }
    } else {
      // 하드 조건은 통과하지만 담은 강의만으로는 목표 학점 범위를 못 채움
      const achievable = [...new Set(full.map((courses) => courses.reduce((s, c) => s + c.credit, 0)))].sort(
        (a, b) => a - b,
      );
      conflicts.push({
        label: `목표 학점 범위 (${basic.minCredit}~${basic.maxCredit}학점) - 담은 강의로 가능한 학점: ${achievable.join(", ")}학점`,
      });
    }

    return { candidates: [], conflicts };
  }

  const optionalGroupTitles = groups.filter((g) => !g.required).map((g) => ({ courseId: g.courseId, title: g.title }));

  const scored = withinCredit.map((courses) => {
    const { score, reasons } = buildReasons(courses, conditions.preference);
    const totalCredit = courses.reduce((s, c) => s + c.credit, 0);
    const signature = courses.map((c) => c.subjectNumber).sort().join(",");

    const droppedOptional = optionalGroupTitles.filter(
      (g) => !courses.some((c) => c.courseId === g.courseId),
    );
    const droppedReasons: WizardReason[] = droppedOptional.map((g) => ({
      met: false,
      headline: `${g.title} 제외`,
      detail: "다른 조건과 시간이 맞지 않아 이번 조합에서는 빠졌어요",
    }));

    return {
      courses,
      totalCredit,
      score,
      reasons: [...droppedReasons, ...reasons],
      signature,
      includedCount: courses.length,
    };
  });

  const seenSignatures = new Set<string>();
  const unique = scored.filter((t) => {
    if (seenSignatures.has(t.signature)) return false;
    seenSignatures.add(t.signature);
    return true;
  });

  // 정렬: 담은 위시리스트를 더 많이 포함한 조합 우선, 그다음 선호도 점수 우선
  unique.sort((a, b) => b.includedCount - a.includedCount || b.score - a.score);

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
