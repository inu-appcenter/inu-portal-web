/**
 * 홈 상단 인사말(greeting) 메시지 결정 로직.
 *
 * 우선순위(위가 높음)
 * 1. 안 읽은 중요(학사) 공지 있음
 * 2. 다음 수업 임박(30분 이내)
 * 3. 오늘 공강
 * 4. 오늘 수업 다 끝남
 * 5. fallback(정보가 없거나 아직 로딩 중일 때)
 *
 * 문구는 종류별로 여러 후보를 두되, 리렌더마다 흔들리지 않도록
 * "그 날짜"를 시드로 고정해서 고른다.
 */

export type GreetingKind =
  | "unreadNotice"
  | "upcomingClass"
  | "freeDay"
  | "classesDone"
  | "fallback";

export interface GreetingMessage {
  kind: GreetingKind;
  /** 첫 줄(강조). 대부분 "OOO님," */
  lead: string;
  /** 둘째 줄 */
  body: string;
}

export interface GreetingClass {
  name?: string;
  /** 시작 시각(시 단위 실수, 예: 9.5 === 09:30) */
  startTime: number;
  /** 종료 시각(시 단위 실수) */
  endTime: number;
}

export interface GreetingInput {
  nickname?: string | null;
  now: Date;
  /** 아직 안 본 학교 공지가 있는지 */
  hasUnreadNotice: boolean;
  /** 안 본 공지 중 학사 공지가 있는지(문구를 학사 공지로 특정한다) */
  hasUnreadAcademicNotice?: boolean;
  /** 오늘 시간표에 등록된 수업(정렬 여부 무관) */
  todayClasses: GreetingClass[];
  /** 대표 시간표가 존재하는지. 없으면 "공강"으로 단정할 수 없다. */
  hasTimetable: boolean;
  /**
   * 판단에 쓰는 데이터가 준비됐는지(로그인/로딩 완료).
   * false면 섣부른 단정 대신 fallback 인사말을 쓴다.
   */
  isReady: boolean;
}

export const DEFAULT_GREETING_NICKNAME = "유니";

/** 다음 수업 임박으로 볼 기준(분) */
export const UPCOMING_CLASS_THRESHOLD_MINUTES = 30;

/** "OOO님," 리드를 쓰는 종류의 둘째 줄 후보 */
const BODY_VARIANTS: Record<
  Exclude<GreetingKind, "freeDay" | "upcomingClass">,
  string[]
> = {
  unreadNotice: ["새 공지사항 놓치지 마세요", "새로운 공지가 올라왔어요"],
  classesDone: ["고생하셨어요", "오늘 수업 다 끝났어요"],
  fallback: ["오늘 하루 어때요?", "오늘도 화이팅이에요!"],
};

/** 공강은 이름 없이 두 줄 모두 문구로 채운다. */
const FREE_DAY_VARIANTS: Array<Pick<GreetingMessage, "lead" | "body">> = [
  { lead: "오늘 공강이에요!", body: "친구랑 시간표 맞춰볼까요?" },
  { lead: "오늘은 수업이 없어요.", body: "여유롭게 시작해요" },
];

const KIND_SEED: Record<GreetingKind, number> = {
  unreadNotice: 0,
  upcomingClass: 1,
  freeDay: 2,
  classesDone: 3,
  fallback: 4,
};

const toMinutes = (hours: number) => Math.round(hours * 60);

const getMinutesOfDay = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

/** 9 → "9시", 9.5 → "9시 30분" */
export const formatClassStartTime = (startTime: number) => {
  const minutes = toMinutes(startTime);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`;
};

/** 같은 날에는 같은 문구가 나오도록 날짜를 시드로 쓴다. */
const pickVariantIndex = (kind: GreetingKind, now: Date, length: number) => {
  const daySeed =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return (daySeed + KIND_SEED[kind]) % length;
};

const pickBody = (
  kind: Exclude<GreetingKind, "freeDay" | "upcomingClass">,
  now: Date,
) => {
  const bodies = BODY_VARIANTS[kind];
  return bodies[pickVariantIndex(kind, now, bodies.length)];
};

export const resolveGreeting = ({
  nickname,
  now,
  hasUnreadNotice,
  hasUnreadAcademicNotice = false,
  todayClasses,
  hasTimetable,
  isReady,
}: GreetingInput): GreetingMessage => {
  const name = nickname?.trim() || DEFAULT_GREETING_NICKNAME;
  const nameLead = `${name}님,`;

  const withName = (
    kind: Exclude<GreetingKind, "freeDay" | "upcomingClass">,
  ): GreetingMessage => ({
    kind,
    lead: nameLead,
    body: pickBody(kind, now),
  });

  if (hasUnreadAcademicNotice) {
    return {
      kind: "unreadNotice",
      lead: nameLead,
      body: "새로운 학사 공지를 확인해보세요",
    };
  }

  if (hasUnreadNotice) return withName("unreadNotice");

  if (!isReady) return withName("fallback");

  const nowMinutes = getMinutesOfDay(now);
  const sortedClasses = [...todayClasses].sort(
    (a, b) => a.startTime - b.startTime,
  );

  const nextClass = sortedClasses.find(
    (classItem) => toMinutes(classItem.startTime) > nowMinutes,
  );

  if (nextClass) {
    const minutesUntilStart = toMinutes(nextClass.startTime) - nowMinutes;

    if (minutesUntilStart <= UPCOMING_CLASS_THRESHOLD_MINUTES) {
      const className = nextClass.name?.trim();
      return {
        kind: "upcomingClass",
        lead: nameLead,
        body: className
          ? `${formatClassStartTime(nextClass.startTime)}에 ${className} 수업이에요`
          : `${minutesUntilStart}분 뒤 수업이 있어요`,
      };
    }
  }

  if (hasTimetable && sortedClasses.length === 0) {
    const variant =
      FREE_DAY_VARIANTS[
        pickVariantIndex("freeDay", now, FREE_DAY_VARIANTS.length)
      ];
    return { kind: "freeDay", lead: variant.lead, body: variant.body };
  }

  const isEveryClassDone =
    sortedClasses.length > 0 &&
    sortedClasses.every(
      (classItem) => toMinutes(classItem.endTime) <= nowMinutes,
    );

  if (isEveryClassDone) return withName("classesDone");

  return withName("fallback");
};
