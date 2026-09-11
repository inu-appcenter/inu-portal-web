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
        resolve({
          success: detail.success,
          data: detail.data,
          errorCode: detail.errorCode,
          errorMessage: detail.errorMessage,
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
