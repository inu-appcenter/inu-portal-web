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
    let timer: NodeJS.Timeout;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (detail && detail.type === expectedResultType) {
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
      }
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

/**
 * 모바일 앱 백그라운드 SSO를 통해 최신 학적 정보 조회 실행
 */
export async function fetchAcademicInfoFromApp(): Promise<AgentActionResult<AcademicInfoData>> {
  return sendBridgeAction<AcademicInfoData>('fetchAcademicInfo', null, 25000);
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
 * LMS(사이버캠퍼스) 계정 연동 상태 확인
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
  watchType: 'STUDY_ROOM_SNIPER' | 'SPECIFIC_SEAT_SNIPER' | 'SEAT_EXPIRATION';
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
  if (!isMobileAppEnvironment()) return {};

  const context: Record<string, any> = {};

  try {
    const [portalLinked, lmsLinked] = await Promise.all([
      checkPortalAccountLinked(),
      checkLmsAccountLinked(),
    ]);

    const tasks: Promise<any>[] = [];

    // 포털 계정이 연동되어 있으면 학적 요약 정보 수집 (최대 2.5초 대기)
    if (portalLinked) {
      tasks.push(
        Promise.race([
          fetchAcademicInfoFromApp(),
          new Promise<null>((r) => setTimeout(() => r(null), 2500)),
        ]).then((res: any) => {
          if (res?.success && res.data) {
            context.academic = res.data;
          }
        }).catch(() => {})
      );
    }

    // LMS 계정이 연동되어 있으면 과제 일정 수집 (최대 2.5초 대기)
    if (lmsLinked) {
      const nowSec = Math.floor(Date.now() / 1000);
      tasks.push(
        Promise.race([
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
          new Promise<null>((r) => setTimeout(() => r(null), 2500)),
        ]).then((res: any) => {
          if (res?.success && res.data && !res.data.error) {
            context.lms = {
              events: Array.isArray(res.data.events) ? res.data.events : [],
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

