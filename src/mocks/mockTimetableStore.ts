import {
  MOCK_COURSES,
  MOCK_COURSE_OFFERINGS,
  MOCK_SEMESTER,
  MOCK_SEMESTERS,
} from "@/mocks/mockTimetableWizardData";
import type {
  Term,
  TimeTable,
  TimeTableCourseItemRequest,
  TimeTableCustomItemRequest,
  TimeTableDetail,
  TimeTableDetailItem,
  TimeTableItemSummary,
  TimeTableVisibility,
} from "@/types/timetables";

// apis/timetables.ts를 model 레이어에서 그대로 대체하는 인메모리 CRUD 저장소.
// 새로고침 시 초기화되며, 실 로그인 세션 없이 저장/덮어쓰기 플로우를 끝까지 검증하기 위해 존재한다.

export class MockApiError extends Error {
  response: { status: number; data: { data: null; msg: string } };
  constructor(msg: string, status = 400) {
    super(msg);
    this.response = { status, data: { data: null, msg } };
  }
}

let timeTableIdCounter = 5000;
let itemIdCounter = 50000;

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const meetingsOverlap = (
  a: { day: string; startTime: string; endTime: string },
  b: { day: string; startTime: string; endTime: string },
) =>
  a.day === b.day &&
  timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
  timeToMinutes(b.startTime) < timeToMinutes(a.endTime);

const buildCourseDetailItem = (id: number, subjectNumber: string, memo?: string | null): TimeTableDetailItem => {
  const offering = MOCK_COURSE_OFFERINGS.find((o) => o.subjectNumber === subjectNumber);
  if (!offering) throw new MockApiError("존재하지 않는 개설 강의입니다.");
  const course = MOCK_COURSES.find((c) => c.id === offering.courseId)!;
  return {
    id,
    type: "COURSE",
    memo: memo ?? null,
    course: {
      // 실 서버와 동일한 우회: courseOfferingId 자리에 courseId가 들어온다는 전제
      courseOfferingId: offering.courseId,
      courseId: offering.courseId,
      title: offering.courseTitle,
      professor: offering.professor ?? "",
      subjectNumber: offering.subjectNumber,
      credit: course.credit,
      meetings: offering.meetings.map((m) => ({ ...m, sequence: null })),
    },
    customSchedule: null,
  };
};

const timeTables: TimeTable[] = [
  {
    id: 4001,
    semesterId: MOCK_SEMESTER.id,
    year: MOCK_SEMESTER.year,
    term: MOCK_SEMESTER.term,
    timeTableName: "기존 시간표 (목)",
    isPrimary: true,
    visibility: "PRIVATE",
  },
];

const itemsByTimeTableId = new Map<number, TimeTableDetailItem[]>([
  [
    4001,
    [
      buildCourseDetailItem(itemIdCounter++, "2600002001"),
      buildCourseDetailItem(itemIdCounter++, "2600011001"),
    ],
  ],
]);

export const mockGetTimeTables = (year?: number, term?: Term): TimeTable[] =>
  year !== undefined && term !== undefined
    ? timeTables.filter((t) => t.year === year && t.term === term)
    : [...timeTables];

export const mockGetTimeTablesBySemester = (semesterId: number): TimeTable[] =>
  timeTables.filter((t) => t.semesterId === semesterId);

export const mockCreateTimeTable = (semesterId: number, timeTableName: string): TimeTable => {
  if (timeTables.some((t) => t.semesterId === semesterId && t.timeTableName === timeTableName)) {
    throw new MockApiError("이미 같은 이름의 시간표가 존재합니다.");
  }
  const semester = MOCK_SEMESTERS.find((s) => s.id === semesterId);
  const created: TimeTable = {
    id: timeTableIdCounter++,
    semesterId,
    year: semester?.year ?? MOCK_SEMESTER.year,
    term: semester?.term ?? MOCK_SEMESTER.term,
    timeTableName,
    isPrimary: !timeTables.some((t) => t.semesterId === semesterId),
    visibility: "PRIVATE",
  };
  timeTables.push(created);
  itemsByTimeTableId.set(created.id, []);
  return created;
};

export const mockUpdateTimeTableName = (timeTableId: number, timeTableName: string): TimeTable => {
  const t = timeTables.find((tt) => tt.id === timeTableId);
  if (!t) throw new MockApiError("존재하지 않는 시간표입니다.", 404);
  t.timeTableName = timeTableName;
  return t;
};

export const mockUpdateTimeTableVisibility = (
  timeTableId: number,
  visibility: TimeTableVisibility,
): TimeTable => {
  const t = timeTables.find((tt) => tt.id === timeTableId);
  if (!t) throw new MockApiError("존재하지 않는 시간표입니다.", 404);
  t.visibility = visibility;
  return t;
};

export const mockUpdateTimeTablePrimary = (timeTableId: number): TimeTable => {
  const t = timeTables.find((tt) => tt.id === timeTableId);
  if (!t) throw new MockApiError("존재하지 않는 시간표입니다.", 404);
  timeTables.forEach((tt) => {
    if (tt.semesterId === t.semesterId) tt.isPrimary = tt.id === timeTableId;
  });
  return t;
};

export const mockDeleteTimeTable = (timeTableId: number): number => {
  const idx = timeTables.findIndex((tt) => tt.id === timeTableId);
  if (idx >= 0) timeTables.splice(idx, 1);
  itemsByTimeTableId.delete(timeTableId);
  return timeTableId;
};

export const mockCreateTimeTableCourseItem = (
  timeTableId: number,
  body: TimeTableCourseItemRequest,
): TimeTableItemSummary => {
  const offering = MOCK_COURSE_OFFERINGS.find((o) => o.courseId === body.courseOfferingId);
  if (!offering) throw new MockApiError("존재하지 않는 개설 강의입니다.");

  const items = itemsByTimeTableId.get(timeTableId) ?? [];
  const hasConflict = items.some((item) => {
    const meetings = item.course?.meetings ?? item.customSchedule?.meetings ?? [];
    return meetings.some((existing) => offering.meetings.some((nm) => meetingsOverlap(existing, nm)));
  });
  if (hasConflict) throw new MockApiError("동일한 시간의 시간표 요소가 존재합니다.", 409);

  const id = itemIdCounter++;
  const detailItem = buildCourseDetailItem(id, offering.subjectNumber, body.memo);
  itemsByTimeTableId.set(timeTableId, [...items, detailItem]);

  return { id, type: "COURSE", title: offering.courseTitle, memo: body.memo ?? null };
};

export const mockCreateTimeTableCustomItem = (
  timeTableId: number,
  body: TimeTableCustomItemRequest,
): TimeTableItemSummary => {
  const items = itemsByTimeTableId.get(timeTableId) ?? [];
  const id = itemIdCounter++;
  const detailItem: TimeTableDetailItem = {
    id,
    type: "CUSTOM",
    memo: body.memo ?? null,
    course: null,
    customSchedule: {
      customScheduleId: id,
      title: body.title,
      meetings: body.meetings.map((m) => ({
        id: itemIdCounter++,
        location: m.location ?? null,
        sequence: null,
        day: m.day,
        startTime: m.startTime,
        endTime: m.endTime,
      })),
    },
  };
  itemsByTimeTableId.set(timeTableId, [...items, detailItem]);
  return { id, type: "CUSTOM", title: body.title, memo: body.memo ?? null };
};

export const mockUpdateTimeTableCustomItem = (
  timeTableId: number,
  customScheduleId: number,
  body: TimeTableCustomItemRequest,
): TimeTableItemSummary => {
  const items = itemsByTimeTableId.get(timeTableId) ?? [];
  const updated = items.map((item) =>
    item.customSchedule?.customScheduleId === customScheduleId
      ? ({
          ...item,
          memo: body.memo ?? null,
          customSchedule: {
            customScheduleId,
            title: body.title,
            meetings: body.meetings.map((m) => ({
              id: itemIdCounter++,
              location: m.location ?? null,
              sequence: null,
              day: m.day,
              startTime: m.startTime,
              endTime: m.endTime,
            })),
          },
        } satisfies TimeTableDetailItem)
      : item,
  );
  itemsByTimeTableId.set(timeTableId, updated);
  const match = updated.find((i) => i.customSchedule?.customScheduleId === customScheduleId);
  return { id: match?.id ?? customScheduleId, type: "CUSTOM", title: body.title, memo: body.memo ?? null };
};

export const mockDeleteTimeTableItem = (timeTableId: number, timeTableItemId: number): number => {
  const items = itemsByTimeTableId.get(timeTableId) ?? [];
  itemsByTimeTableId.set(
    timeTableId,
    items.filter((i) => i.id !== timeTableItemId),
  );
  return timeTableItemId;
};

export const mockGetTimeTableDetail = (timeTableId: number): TimeTableDetail => {
  const t = timeTables.find((tt) => tt.id === timeTableId);
  if (!t) throw new MockApiError("존재하지 않는 시간표입니다.", 404);
  return {
    id: t.id,
    timeTableName: t.timeTableName,
    year: t.year,
    term: t.term,
    items: itemsByTimeTableId.get(timeTableId) ?? [],
  };
};
