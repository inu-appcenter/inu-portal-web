import { executeAgentActionBridge, checkLmsAccountLinked, isMobileAppEnvironment } from './mobileAgentBridge';

export interface LmsAssignmentEvent {
  id: number;
  name: string;
  description?: string;
  course?: {
    id: number;
    fullname: string;
    shortname?: string;
  };
  modulename?: string;
  activityname?: string;
  timesort: number; // unix timestamp (seconds)
  formattedTime?: string;
  isUrgent?: boolean;
  daysRemaining?: number;
  url?: string;
  actionName?: string;
  isCompleted?: boolean;
}

export interface LmsCourse {
  id: number;
  fullname: string;
  shortname: string;
  enrolledusercount?: number;
}

export interface LmsModule {
  id: number; // cmid
  name: string;
  modname: string; // 'vod', 'assign', 'quiz', 'ubboard', 'resource', 'folder'
  instance?: number;
  url?: string;
  isCompleted?: boolean;
}

export interface LmsSection {
  id: number;
  name: string;
  summary?: string;
  modules: LmsModule[];
}

export interface LmsCourseGrade {
  courseid: number;
  grade: string;
  rawgrade?: string;
  rank?: number;
}

const LMS_SERVER_URL = 'https://lms.inu.ac.kr/webservice/rest/server.php';

/**
 * 1. 다가오는 과제, 퀴즈 및 동영상 학습 일정 조회
 */
export async function getUpcomingLmsAssignments(daysAhead = 14): Promise<LmsAssignmentEvent[]> {
  if (!isMobileAppEnvironment()) {
    return [];
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const timesortfrom = nowSec - 86400 * 2;
  const timesortto = nowSec + 86400 * daysAhead;

  const res = await executeAgentActionBridge({
    actionId: `act_lms_upcoming_${Date.now()}`,
    authDomain: 'LMS',
    request: {
      method: 'GET',
      url: LMS_SERVER_URL,
      params: {
        wsfunction: 'core_calendar_get_action_events_by_timesort',
        timesortfrom,
        timesortto,
        limitnum: 25,
      },
    },
  });

  if (res.success && res.data?.events) {
    const rawEvents: any[] = res.data.events;
    return rawEvents.map((ev) => {
      const dueMs = ev.timesort * 1000;
      const diffMs = dueMs - Date.now();
      const days = Math.ceil(diffMs / (86400 * 1000));
      return {
        id: ev.id,
        name: ev.name,
        description: ev.description,
        course: ev.course,
        modulename: ev.modulename,
        activityname: ev.activityname,
        timesort: ev.timesort,
        daysRemaining: days,
        isUrgent: days <= 2,
        url: ev.url || ev.action?.url,
        actionName: ev.action?.name,
      };
    });
  }

  return [];
}

/**
 * 2. 수강 중인 강좌 목록 조회 (core_enrol_get_users_courses)
 */
export async function getMyLmsCourses(): Promise<LmsCourse[]> {
  if (!isMobileAppEnvironment()) {
    return [];
  }

  const lmsStatus = await checkLmsAccountLinked();
  const userId = lmsStatus.user?.id;
  if (!userId) return [];

  const res = await executeAgentActionBridge({
    actionId: `act_lms_courses_${Date.now()}`,
    authDomain: 'LMS',
    request: {
      method: 'GET',
      url: LMS_SERVER_URL,
      params: {
        wsfunction: 'core_enrol_get_users_courses',
        userid: userId,
      },
    },
  });

  if (res.success && Array.isArray(res.data)) {
    return res.data.map((c: any) => ({
      id: c.id,
      fullname: c.fullname,
      shortname: c.shortname,
      enrolledusercount: c.enrolledusercount,
    }));
  }

  return [];
}

/**
 * 3. 강좌별 주차/섹션 학습 콘텐츠 목록 조회 (core_course_get_contents)
 */
export async function getCourseContents(courseId: number): Promise<LmsSection[]> {
  if (!isMobileAppEnvironment()) {
    return [];
  }

  const res = await executeAgentActionBridge({
    actionId: `act_course_contents_${courseId}_${Date.now()}`,
    authDomain: 'LMS',
    request: {
      method: 'GET',
      url: LMS_SERVER_URL,
      params: {
        wsfunction: 'core_course_get_contents',
        courseid: courseId,
      },
    },
  });

  if (res.success && Array.isArray(res.data)) {
    return res.data.map((sec: any) => ({
      id: sec.id,
      name: sec.name || '주차',
      summary: sec.summary,
      modules: (sec.modules || []).map((m: any) => ({
        id: m.id, // cmid
        name: m.name,
        modname: m.modname,
        instance: m.instance,
        url: m.url,
      })),
    }));
  }

  return [];
}

/**
 * 4. 강좌별 학습 활동 완료 상태 조회 (core_completion_get_activities_completion_status)
 * 반환값: Record<cmid, isCompleted>
 */
export async function getCourseCompletionMap(courseId: number): Promise<Record<number, boolean>> {
  if (!isMobileAppEnvironment()) {
    return {};
  }

  const lmsStatus = await checkLmsAccountLinked();
  const userId = lmsStatus.user?.id;
  if (!userId) return {};

  const res = await executeAgentActionBridge({
    actionId: `act_course_completion_${courseId}_${Date.now()}`,
    authDomain: 'LMS',
    request: {
      method: 'GET',
      url: LMS_SERVER_URL,
      params: {
        wsfunction: 'core_completion_get_activities_completion_status',
        courseid: courseId,
        userid: userId,
      },
    },
  });

  const completionMap: Record<number, boolean> = {};
  if (res.success && res.data?.statuses && Array.isArray(res.data.statuses)) {
    res.data.statuses.forEach((st: any) => {
      // state: 1 = complete, 2 = complete pass, 3 = complete fail
      completionMap[st.cmid] = st.state === 1 || st.state === 2 || Boolean(st.isoverallcomplete);
    });
  }

  return completionMap;
}

/**
 * 5. 강좌 성적 개요 조회 (gradereport_overview_get_course_grades)
 */
export async function getCourseGradesOverview(): Promise<LmsCourseGrade[]> {
  if (!isMobileAppEnvironment()) {
    return [];
  }

  const res = await executeAgentActionBridge({
    actionId: `act_course_grades_${Date.now()}`,
    authDomain: 'LMS',
    request: {
      method: 'GET',
      url: LMS_SERVER_URL,
      params: {
        wsfunction: 'gradereport_overview_get_course_grades',
      },
    },
  });

  if (res.success && res.data?.grades && Array.isArray(res.data.grades)) {
    return res.data.grades.map((g: any) => ({
      courseid: g.courseid,
      grade: g.grade,
      rawgrade: g.rawgrade,
      rank: g.rank,
    }));
  }

  return [];
}
