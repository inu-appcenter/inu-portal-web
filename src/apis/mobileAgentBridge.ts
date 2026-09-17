import { parseAcademicBasicInfo } from "@/utils/ssvParser";

export interface AcademicInfoData {
  studentId: string;
  koreanName: string;
  departmentName: string;
  collegeName?: string;
  enrollmentStatus: string;
  completedSemesterCount?: string;
  acquiredCredits: string;
  gradeAverage: string;
  advisorProfessorName?: string;
  entranceDate?: string;
  latestEnrollmentChange?: string;
  displayFields?: Record<string, string>;
  rawFields: Record<string, string>;
}

/**
 * AI 요청에 포함해도 되는 비식별 학적 요약만 만든다.
 * 원본 학번·이름·지도교수 등 개인 식별 정보는 이 경계를 절대 넘지 않는다.
 */
function toAnonymousAcademicContext(data: any) {
  const studentId = data.studentId || data.student_id || "";
  const entryYear = /^\d{4}/.test(studentId) ? studentId.slice(0, 4) : undefined;
  const dept = data.departmentName || data.majorName || data.department_name || "";
  const status = data.enrollmentStatus || data.enrollmentStatusName || data.enrollment_status || "재학";

  return {
    ...(entryYear ? { entryYear } : {}),
    departmentName: dept,
    ...(data.collegeName ? { collegeName: data.collegeName } : {}),
    enrollmentStatus: status,
    ...(data.completedSemesterCount ? { completedSemesterCount: String(data.completedSemesterCount) } : {}),
    acquiredCredits: String(data.acquiredCredits || "0"),
    gradeAverage: String(data.gradeAverage || "0.0"),
    ...(data.entranceDate ? { entranceDate: String(data.entranceDate).slice(0, 4) } : {}),
    ...(data.latestEnrollmentChange ? { latestEnrollmentChange: data.latestEnrollmentChange } : {}),
    ...(data.advisorProfessorName ? { advisorProfessorName: data.advisorProfessorName } : {}),
  };
}

export interface AgentActionResult<T = any> {
  success: boolean;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * 모바일 앱(React Native) 웹뷰 환경인지 확인
 */
export function isMobileAppEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ReactNativeWebView);
}

/**
 * 모바일 네이티브 브릿지로 액션 요청을 전송하고 응답을 기다리는 헬퍼
 */
function sendBridgeAction<T = any>(type: string, payload?: any, timeoutMs = 15000): Promise<AgentActionResult<T>> {
  return new Promise((resolve) => {
    if (!isMobileAppEnvironment()) {
      resolve({
        success: false,
        errorCode: 'NOT_IN_MOBILE_APP',
        errorMessage: '모바일 앱(INTIP 앱) 환경에서만 학교 시스템 직접 연동이 가능합니다.',
      });
      return;
    }

    const expectedResultType = `${type}Result`;
    const requestId = `req_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    let timer: NodeJS.Timeout;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      // detail에 requestId가 있으면 requestId로 매칭, 없으면(하위 호환) type으로 매칭
      const isMatch = detail.requestId ? detail.requestId === requestId : detail.type === expectedResultType;
      if (!isMatch) return;

      clearTimeout(timer);
      window.removeEventListener('intipAgentResult', handler);
      const resolvedData = detail.data?.data !== undefined ? detail.data.data : detail.data;
      const resolvedErrorCode = detail.errorCode || detail.data?.errorCode;
      const resolvedErrorMessage = detail.errorMessage || detail.data?.errorMessage;
      resolve({
        success: detail.success,
        data: resolvedData,
        errorCode: resolvedErrorCode,
        errorMessage: resolvedErrorMessage,
      });
    };

    window.addEventListener('intipAgentResult', handler);

    timer = setTimeout(() => {
      window.removeEventListener('intipAgentResult', handler);
      resolve({
        success: false,
        errorCode: 'TIMEOUT',
        errorMessage: '요청 시간이 초과되었습니다.',
      });
    }, timeoutMs);

    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type,
        requestId,
        payload,
      })
    );
  });
}

/**
 * 포털 계정(학번/비밀번호) 기기 내 등록 여부 확인
 */
export async function checkPortalAccountLinked(): Promise<boolean> {
  const res = await sendBridgeAction<{ linked: boolean }>('checkPortalAccount');
  return Boolean(res.success && res.data?.linked);
}

/**
 * 포털 계정(학번/비밀번호) 기기 보안 저장소에 1회 등록
 */
export async function savePortalAccount(studentId: string, password: string): Promise<AgentActionResult<{ linked: boolean }>> {
  return sendBridgeAction<{ linked: boolean }>('savePortalAccount', { studentId, password });
}

/**
 * 포털 계정 등록 해제 (기기 보안 저장소 삭제)
 */
export async function deletePortalAccount(): Promise<AgentActionResult<{ linked: boolean }>> {
  return sendBridgeAction<{ linked: boolean }>('deletePortalAccount');
}

let inflightAcademicPromise: Promise<AgentActionResult<AcademicInfoData>> | null = null;

/**
 * 모바일 앱 백그라운드 SSO를 통해 최신 학적 정보 조회 실행 및 웹 중앙화 파서 적용
 */
export async function fetchAcademicInfoFromApp(forceRefresh = false): Promise<AgentActionResult<AcademicInfoData>> {
  if (inflightAcademicPromise && !forceRefresh) {
    return inflightAcademicPromise;
  }

  inflightAcademicPromise = (async () => {
    try {
      // The native SSO flow can include portal login and an ERP redirect. Its own
      // scraper budget is 35 seconds, so this must remain longer than that budget.
      const bridgeRes = await sendBridgeAction<any>('fetchAcademicInfo', null, 45000);
      if (!bridgeRes.success) {
        return {
          success: false,
          errorCode: bridgeRes.errorCode,
          errorMessage: bridgeRes.errorMessage,
        };
      }

      try {
        const rawPayload = bridgeRes.data?.rawSsv || bridgeRes.data;
        if (typeof rawPayload === 'string') {
          const parsed = parseAcademicBasicInfo(rawPayload);
          return {
            success: true,
            data: parsed as unknown as AcademicInfoData,
          };
        } else if (rawPayload && typeof rawPayload === 'object' && rawPayload.studentId) {
          // 이미 파싱된 객체인 경우 (하위 호환)
          return {
            success: true,
            data: rawPayload as AcademicInfoData,
          };
        } else {
          throw new Error('ERP 원본 학적 응답 데이터가 비어있습니다.');
        }
      } catch (err: any) {
        return {
          success: false,
          errorCode: 'ERP_ERROR',
          errorMessage: err?.message || '학적 데이터 파싱 오류',
        };
      }
    } finally {
      inflightAcademicPromise = null;
    }
  })();

  return inflightAcademicPromise;
}

/**
 * 도서관 계정 연동 상태 확인
 */
export async function checkLibraryAccountLinked(): Promise<{ linked: boolean; user?: any }> {
  const res = await sendBridgeAction<{ linked: boolean; user?: any }>('checkLibraryAccount');
  return {
    linked: Boolean(res.success && res.data?.linked),
    user: res.data?.user,
  };
}

/**
 * 도서관 계정 정보 기기 보안 저장소에 등록
 */
export async function saveLibraryAccount(loginId: string, password: string): Promise<AgentActionResult<any>> {
  return sendBridgeAction('saveLibraryAccount', { loginId, password });
}

/**
 * AI 에이전트 범용 액션 실행 브릿지 호출 (모바일 기기에서 학교 시스템 직접 실행)
 */
export async function executeAgentActionBridge(instruction: any): Promise<AgentActionResult<any>> {
  return sendBridgeAction('executeAgentAction', { instruction }, 20000);
}

/**
 * 이러닝(LMS) 계정 연동 상태 확인
 */
export async function checkLmsAccountLinked(): Promise<{ linked: boolean; user?: any }> {
  const res = await sendBridgeAction<{ linked: boolean; user?: any }>('checkLmsAccount');
  return {
    linked: Boolean(res.success && res.data?.linked),
    user: res.data?.user,
  };
}

/**
 * LMS 계정 정보 기기 보안 저장소에 등록
 */
export async function saveLmsAccount(username: string, password: string): Promise<AgentActionResult<any>> {
  return sendBridgeAction('saveLmsAccount', { username, password });
}

export interface LocalWatchJob {
  id: string;
  type: 'STUDY_ROOM_SNIPER' | 'SPECIFIC_SEAT_SNIPER' | 'SEAT_EXPIRATION' | 'ASSIGNMENT_REMINDER';
  title: string;
  targetName: string;
  targetId?: string | number;
  roomId?: number;
  roomName?: string;
  seatId?: number;
  seatNo?: string;
  hopeDate?: string;
  targetHour?: number;
  durationMinutes?: number;
  seatName?: string;
  endTime?: string;
  createdAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'NOTIFIED' | 'EXPIRED' | 'CANCELLED';
}

/**
 * 모바일 기기 로컬 감시(스터디룸 스나이퍼 등) 목록 조회
 */
export async function getLocalWatchJobsFromApp(): Promise<AgentActionResult<LocalWatchJob[]>> {
  return sendBridgeAction<LocalWatchJob[]>('getLocalWatchJobs');
}

/**
 * 모바일 기기 로컬 감시 등록
 */
export async function registerLocalWatchJobInApp(payload: {
  watchType: 'STUDY_ROOM_SNIPER' | 'SPECIFIC_SEAT_SNIPER' | 'SEAT_EXPIRATION' | 'ASSIGNMENT_REMINDER';
  roomId?: number;
  roomName?: string;
  seatId?: number;
  seatNo?: string;
  hopeDate?: string;
  targetHour?: number;
  durationMinutes?: number;
  seatName?: string;
  endTime?: string;
}): Promise<AgentActionResult<LocalWatchJob>> {
  return sendBridgeAction<LocalWatchJob>('registerLocalWatchJob', payload);
}

/**
 * 모바일 기기 로컬 감시 취소
 */
export async function cancelLocalWatchJobInApp(id: string): Promise<AgentActionResult<{ id: string; cancelled: boolean }>> {
  return sendBridgeAction<{ id: string; cancelled: boolean }>('cancelLocalWatchJob', { id });
}

/**
 * AI 에이전트 질문 전송 시 기기 보안 영역(SSO)의 실시간 컨텍스트(학적, LMS 과제)를 신속하게 수집
 */
export async function resolveClientContext(): Promise<Record<string, any>> {
  const context: Record<string, any> = {};

  if (!isMobileAppEnvironment()) {
    return context;
  }

  try {
    const [portalLinked, lmsLinked] = await Promise.all([
      checkPortalAccountLinked(),
      checkLmsAccountLinked(),
    ]);

    const tasks: Promise<any>[] = [];

    // 포털 계정이 연동되어 있으면 실시간 최신 학적 정보를 모바일 앱 브릿지로 조회
    if (portalLinked) {
      context.portal = { linked: true };
      tasks.push(
        fetchAcademicInfoFromApp()
          .then((res) => {
            if (res?.success && res.data) {
              context.academicDisplay = res.data;
              context.academic = toAnonymousAcademicContext(res.data);
              try {
                localStorage.setItem("portal_student_info", JSON.stringify(res.data));
                localStorage.setItem("portal_info_last_updated", new Date().toISOString());
              } catch {}
            }
            context.portal = {
              linked: true,
              ...(res?.success ? {} : {
                academicErrorCode: res?.errorCode,
                academicErrorMessage: res?.errorMessage,
              }),
            };
          })
          .catch((err) => {
            context.portal = {
              linked: true,
              academicErrorCode: 'FETCH_ERROR',
              academicErrorMessage: err?.message || '학적 정보 조회 중 오류가 발생했습니다.',
            };
          })
      );
    } else {
      context.portal = { linked: false };
    }

    // LMS 계정이 연동되어 있으면 과제 일정 수집 (최대 2.5초 대기)
    if (lmsLinked) {
      const nowSec = Math.floor(Date.now() / 1000);
      tasks.push(
        Promise.race([
          Promise.all([
            executeAgentActionBridge({
            actionId: `ctx_lms_${Date.now()}`,
            authDomain: 'LMS',
            request: {
              method: 'GET',
              url: 'https://lms.inu.ac.kr/webservice/rest/server.php',
              params: {
                wsfunction: 'core_calendar_get_action_events_by_timesort',
                moodlewsrestformat: 'json',
                timesortfrom: nowSec - 86400,
                timesortto: nowSec + 86400 * 14,
                limitnum: 10,
              },
            },
            }),
            lmsLinked.user?.id ? executeAgentActionBridge({
              actionId: `ctx_lms_courses_${Date.now()}`,
              authDomain: 'LMS',
              request: {
                method: 'GET',
                url: 'https://lms.inu.ac.kr/webservice/rest/server.php',
                params: { wsfunction: 'core_enrol_get_users_courses', userid: lmsLinked.user.id, moodlewsrestformat: 'json' },
              },
            }) : Promise.resolve(null),
          ]),
          new Promise<null>((r) => setTimeout(() => r(null), 2500)),
        ]).then((result: any) => {
          const [res, coursesRes] = Array.isArray(result) ? result : [];
          if (res?.success && res.data && !res.data.error) {
            context.lms = {
              events: Array.isArray(res.data.events) ? res.data.events : [],
              courses: coursesRes?.success && Array.isArray(coursesRes.data) ? coursesRes.data : [],
            };
          }
        }).catch(() => {})
      );
    }

    await Promise.all(tasks);
  } catch (err) {
    console.debug('[resolveClientContext] non-blocking context gathering error:', err);
  }

  return context;
}
