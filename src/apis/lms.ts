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
  timesort: number; // unix timestamp (seconds)
  formattedTime?: string;
  isUrgent?: boolean;
  daysRemaining?: number;
}

export interface LmsCourse {
  id: number;
  fullname: string;
  shortname: string;
  enrolledusercount?: number;
}

const LMS_SERVER_URL = 'https://lms.inu.ac.kr/webservice/rest/server.php';

/**
 * 1. 다가오는 과제 및 퀴즈 일정 조회 (core_calendar_get_action_events_by_timesort)
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
        limitnum: 20,
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
        timesort: ev.timesort,
        daysRemaining: days,
        isUrgent: days <= 2,
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

  // 먼저 사용자 정보 조회
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
