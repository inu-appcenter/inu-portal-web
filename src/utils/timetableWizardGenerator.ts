import { formatHoursToTime } from "@/utils/timetable";
import type {
  WizardCandidate,
  WizardConditions,
  WizardConflictItem,
  WizardConflictKind,
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
const WEEKDAY_INDEXES = [0, 1, 2, 3, 4];
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

// 위시리스트를 courseId 기준으로 묶는다. 같은 과목을 여러 분반 담았을 때:
//  - 그중 하나라도 필수로 표시했다면, 그 그룹은 "필수로 표시한 분반들 중 하나"만
//    선택 대상으로 삼는다. 필수로 안 찍은 나머지 분반은 조합에서 아예 제외한다 -
//    사용자가 이미 "이 분반이어야 한다"고 못박았는데, 담아만 두고 안 찍은 다른
//    분반이 대신 뽑혀 나가면(#397) "필수로 찍은 강의가 시간표에 없다"는 결과가 된다.
//  - 하나도 필수가 아니면 전부 대안으로 묶여, 조합마다 그중 하나 또는 통째로 스킵된다.
//
// 위시리스트 항목이 강의 스냅샷을 직접 들고 있으므로 후보 풀에서 되찾는 단계가 없다.
// 예전에는 여기서 pool 조회에 실패한 항목을 `continue`로 조용히 버렸는데, 그게 곧
// "담아둔 강의가 추천에서 아무 말 없이 사라지는" 버그였다.
const buildGroups = (wishlist: WizardWishlistItem[]): WishlistGroup[] => {
  const byCourse = new Map<number, { title: string; items: WizardWishlistItem[] }>();

  for (const item of wishlist) {
    const existing = byCourse.get(item.course.courseId);
    if (existing) {
      existing.items.push(item);
    } else {
      byCourse.set(item.course.courseId, { title: item.course.title, items: [item] });
    }
  }

  return [...byCourse.entries()].map(([courseId, { title, items }]) => {
    const requiredOptions = items.filter((i) => i.required).map((i) => i.course);
    const required = requiredOptions.length > 0;
    return {
      courseId,
      title,
      required,
      options: required ? requiredOptions : items.map((i) => i.course),
    };
  });
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

// 필수 그룹의 분반 중 predicate를 만족하는(=그 하드 조건을 위반하는) 강의를 찾는다.
// 실패 안내 화면에서 "어느 강의가 문제인지" 짚어주고 바로 빼기/교체할 수 있게 하기
// 위해 쓴다(#397) - 겹침 원인(findOverlappingRequiredPairs)뿐 아니라 제외 시간대/제외
// 강의/공강 요일 원인도 같은 방식으로 강의를 특정해야 "조건 완화하기"로 처음 화면까지
// 돌아가지 않고 그 자리에서 바로 처리할 수 있다.
const findRequiredCoursesViolating = (
  groups: WishlistGroup[],
  predicate: (course: WizardCourseOption) => boolean,
): WizardCourseOption[] => {
  const seen = new Set<number>();
  const result: WizardCourseOption[] = [];
  for (const group of groups) {
    if (!group.required) continue;
    for (const option of group.options) {
      if (predicate(option) && !seen.has(option.courseOfferingId)) {
        seen.add(option.courseOfferingId);
        result.push(option);
      }
    }
  }
  return result;
};

// 주어진 그룹들 중 어느 강의끼리 시간이 겹치는지 짚어준다(diagnoseNoCandidates 참고).
// 그룹 안 모든 분반 조합이 전부 겹쳐야("피할 방법이 없어야") 그 그룹 쌍을 원인으로 지목한다 -
// 분반을 바꾸면 피해지는 경우까지 잘못 지목하지 않기 위해서다.
const findOverlappingPairs = (groups: WishlistGroup[]): WizardCourseOption[][] => {
  const pairs: WizardCourseOption[][] = [];

  for (let i = 0; i < groups.length; i += 1) {
    for (let j = i + 1; j < groups.length; j += 1) {
      const gi = groups[i];
      const gj = groups[j];
      const allOptionsOverlap = gi.options.every((oi) =>
        gj.options.every((oj) => overlapsAny(oi, oj.meetings)),
      );
      if (allOptionsOverlap) {
        pairs.push([gi.options[0], gj.options[0]]);
      }
    }
  }

  return pairs;
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
      tag: { label: `${names} 공강`, tone: "success" },
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
        tag: { label: "오전 없음", tone: "success" },
      });
    } else {
      reasons.push({
        met: false,
        headline: `오전 수업 있음 (${formatHoursToTime(startAfter)} 이전 시작)`,
        detail: "담은 강의만으로는 오전 수업을 완전히 피할 수 없어요",
        tag: { label: `오전 수업 ${earlyMeetings.length}개`, tone: "warn" },
      });
    }
  }

  if (pref.noNightClasses) {
    // 시안 문구 기준 "18시 이후 종료 수업 감점" - 18:00 정각에 끝나는 수업은 야간이 아니다
    const nightMeetings = allMeetings.filter((m) => m.endTime > NIGHT_THRESHOLD + EPSILON);
    if (nightMeetings.length === 0) {
      score += 3;
      reasons.push({
        met: true,
        headline: "야간 수업 없음",
        detail: "18시 이후에 끝나는 수업이 없어요",
        tag: { label: "야간 없음", tone: "success" },
      });
    } else {
      reasons.push({
        met: false,
        headline: `야간 수업 ${nightMeetings.length}개 포함`,
        detail: `${nightMeetings.length}개 수업이 18시 이후에 끝나요`,
        tag: { label: `야간 수업 ${nightMeetings.length}개`, tone: "warn" },
      });
    }
  }

  // C-01 공강 최대화 (소프트: 많을수록 좋다 - 점수만 가중, 탈락 없음).
  // 시안 문구대로 "지정한 요일 외에 빈 평일"만 센다. 주말은 원래 비어 있어 변별력이 없고,
  // 지정 공강 요일은 하드 조건으로 이미 비어 있다.
  if (pref.manyFreeDays) {
    const requested = pref.freeDayOfWeek.enabled ? pref.freeDayOfWeek.days : [];
    const extraFreeWeekdays = WEEKDAY_INDEXES.filter(
      (day) => freeDays[day] && !requested.includes(day),
    );
    const freeDayCount = extraFreeWeekdays.length;
    score += freeDayCount * 1.5;
    if (freeDayCount > 0) {
      const names = extraFreeWeekdays.map((day) => DAY_NAMES[day]).join(", ");
      reasons.push({
        met: true,
        headline: `${names}요일 공강`,
        detail: "담은 강의로 만들 수 있는 공강을 최대한 확보했어요",
        tag: { label: `공강 ${freeDayCount}일`, tone: "success" },
      });
    } else {
      reasons.push({
        met: false,
        headline: "추가 공강 없음",
        detail: "담은 강의만으로는 평일 공강을 더 만들 수 없어요",
        tag: { label: "추가 공강 없음", tone: "warn" },
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
        tag: { label: "연강 없음", tone: "success" },
      });
    } else {
      reasons.push({
        met: false,
        headline: `연강 최대 ${maxPeriods}개`,
        detail: `${DAY_NAMES[maxDay]}요일에 연속 강의 구간이 있어요`,
        tag: { label: `${maxPeriods}연강 있음`, tone: "warn" },
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

const sumCredit = (courses: WizardCourseOption[]) => courses.reduce((s, c) => s + c.credit, 0);

// 조합이 하나도 안 남았을 때 원인을 짚는다. 실패 화면이 원인 종류별로 다른 안내를 한다.
//
// 새 시안에는 필수/선택 토글이 없어 담은 강의가 대부분 "선택"이다. 선택 그룹은 통째로 건너뛸
// 수 있어서, 공강 요일이나 시간 겹침 때문에 강의가 빠져도 조합 자체는 남고 겉으로는 "학점
// 부족"으로만 보인다. 그래서 "그 조건을 풀면 목표 학점을 채우는 조합이 생기는가"로 판정한다.
const diagnoseNoCandidates = (
  conditions: WizardConditions,
  groups: WishlistGroup[],
  full: WizardCourseOption[][],
): WizardConflictItem[] => {
  const { basic, preference, exclusion } = conditions;
  const withinCredit = (courses: WizardCourseOption[]) => {
    const total = sumCredit(courses);
    return total >= basic.minCredit && total <= basic.maxCredit;
  };

  const excludedSlotSet = new Set(exclusion.excludedSlots);
  const excludedSubjectNumberSet = new Set(
    exclusion.excludedCourses.map((c) => c.subjectNumber),
  );
  const relaxationChecks: {
    label: string;
    kind: WizardConflictKind;
    days?: number[];
    flags: HardConstraintFlags;
    violates: (course: WizardCourseOption) => boolean;
  }[] = [];

  if (exclusion.excludedSlots.length > 0) {
    relaxationChecks.push({
      label: `제외한 시간대 (${excludedSlotSet.size}칸)`,
      kind: "exclusion",
      flags: { ignoreExcludedSlots: true },
      violates: (c) => courseGridSlots(c).some((slot) => excludedSlotSet.has(slot)),
    });
  }
  if (exclusion.excludedCourses.length > 0) {
    relaxationChecks.push({
      label: `제외한 강의 (${exclusion.excludedCourses.length}개)`,
      kind: "exclusion",
      flags: { ignoreExcludedCourses: true },
      violates: (c) => excludedSubjectNumberSet.has(c.subjectNumber),
    });
  }
  if (preference.freeDayOfWeek.enabled && preference.freeDayOfWeek.days.length > 0) {
    const days = [...preference.freeDayOfWeek.days].sort((a, b) => a - b);
    relaxationChecks.push({
      label: `${days.map((d) => DAY_NAMES[d]).join(", ")}요일 공강`,
      kind: "freeDay",
      days,
      flags: { ignoreFreeDayOfWeek: true },
      violates: (c) => c.meetings.some((m) => days.includes(m.day)),
    });
  }
  // 오전/야간 회피(C-03/C-04)는 소프트 조건이라 후보를 탈락시키지 않으므로 원인이 될 수 없다.

  const conflicts: WizardConflictItem[] = [];
  for (const check of relaxationChecks) {
    const relaxed = searchCombinations(groups, makeContext(conditions, check.flags));
    if (!relaxed.some(withinCredit)) continue;
    // 필수 강의가 걸리면 그것을, 아니면(전부 선택) 조건 때문에 못 들어간 강의를 짚는다
    const required = findRequiredCoursesViolating(groups, check.violates);
    conflicts.push({
      label: check.label,
      kind: check.kind,
      days: check.days,
      courses:
        required.length > 0
          ? required
          : groups.flatMap((g) => g.options).filter(check.violates),
    });
  }
  if (conflicts.length > 0) return conflicts;

  // 겹침: 필수끼리 피할 수 없게 겹쳐 조합이 아예 없거나, 겹치는 강의를 둘 다 넣어야만
  // 목표 학점을 채울 수 있는 경우(선택 강의끼리 겹쳐 하나가 빠진 경우)
  const maxPossibleCredit = groups.reduce(
    (sum, g) => sum + Math.max(...g.options.map((o) => o.credit)),
    0,
  );
  const overlapPairs =
    full.length === 0
      ? findOverlappingPairs(groups.filter((g) => g.required))
      : maxPossibleCredit >= basic.minCredit
        ? findOverlappingPairs(groups)
        : [];
  if (full.length === 0 || overlapPairs.length > 0) {
    return overlapPairs.length > 0
      ? overlapPairs.map((pair) => ({
          label: "담은 강의끼리 시간이 겹쳐요",
          kind: "overlap" as const,
          courses: pair,
        }))
      : [{ label: "담은 강의끼리 시간이 겹쳐요", kind: "overlap" }];
  }

  // 조건은 통과하지만 담은 강의만으로는 목표 학점 범위를 못 채움
  const achievable = [...new Set(full.map(sumCredit))].sort((a, b) => a - b);
  return [
    {
      label: `목표 학점 범위 (${basic.minCredit}~${basic.maxCredit}학점) - 담은 강의로 가능한 학점: ${achievable.join(", ")}학점`,
      kind: "credit",
      achievableCredits: achievable,
    },
  ];
};

export const generateWizardCandidates = (
  conditions: WizardConditions,
): WizardGenerationResult => {
  const { basic } = conditions;
  const groups = buildGroups(basic.wishlist);

  if (groups.length === 0) {
    return {
      candidates: [],
      conflicts: [{ label: "듣고 싶은 강의를 먼저 담아주세요", kind: "noWishlist" }],
    };
  }

  const baseCtx = makeContext(conditions);
  const full = searchCombinations(groups, baseCtx);

  const withinCredit = full.filter((courses) => {
    const total = courses.reduce((s, c) => s + c.credit, 0);
    return total >= basic.minCredit && total <= basic.maxCredit;
  });

  if (withinCredit.length === 0) {
    return { candidates: [], conflicts: diagnoseNoCandidates(conditions, groups, full) };
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
      tag: { label: `${g.title} 빠짐`, tone: "error" },
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
    label: `마법사 ${labels[index]}`,
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
