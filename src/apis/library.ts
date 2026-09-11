import { executeAgentActionBridge, isMobileAppEnvironment } from './mobileAgentBridge';

export interface LibrarySeatRoom {
  id: number;
  name: string;
  roomType?: { id: number; name: string };
  branch?: { id: number; name: string };
  seats?: {
    total: number;
    occupied: number;
    available: number;
  };
  totalSeats?: number;
  occupiedSeats?: number;
  availableSeats?: number;
}

export interface LibraryStudyRoom {
  id: number;
  name: string;
  location?: string;
  quota?: string;
  minQuota?: number;
  maxQuota?: number;
  tags?: string[];
  floor?: { label?: string };
  roomType?: { name?: string };
  availableSummary?: string;
}

export interface CurrentSeatInfo {
  chargeId: number;
  seatId: number;
  seatName: string;
  roomName: string;
  beginTime: string;
  endTime: string;
}

const PUBLIC_LIB_URL = 'https://lib.inu.ac.kr/pyxis-api/1/seat-rooms?branchGroupId=1&smufMethodCode=PC';

/**
 * 1. 실시간 열람실 좌석 현황 조회 (공개 API - 웹 fetch 또는 앱 브릿지)
 */
export async function getReadingRooms(): Promise<LibrarySeatRoom[]> {
  try {
    const res = await fetch(PUBLIC_LIB_URL);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.list) {
        return data.data.list;
      }
    }
  } catch (e) {
    console.warn('[LibraryApi] Direct fetch failed, trying agent bridge:', e);
  }

  // Fallback: 모바일 앱 브릿지를 통해 조회
  if (isMobileAppEnvironment()) {
    const res = await executeAgentActionBridge({
      actionId: `act_rooms_${Date.now()}`,
      authDomain: 'NONE',
      request: {
        method: 'GET',
        url: 'https://lib.inu.ac.kr/pyxis-api/1/seat-rooms',
        params: { branchGroupId: 1, smufMethodCode: 'PC' },
      },
    });
    if (res.success && res.data?.data?.list) {
      return res.data.data.list;
    }
  }

  return [];
}

/**
 * 2. 스터디룸 목록 조회
 */
export async function getStudyRooms(): Promise<LibraryStudyRoom[]> {
  // 모바일 앱 브릿지로 실시간 조회 시도
  if (isMobileAppEnvironment()) {
    const res = await executeAgentActionBridge({
      actionId: `act_study_rooms_${Date.now()}`,
      authDomain: 'LIBRARY',
      request: {
        method: 'GET',
        url: 'https://lib.inu.ac.kr/pyxis-api/1/api/rooms',
        params: { branchGroupId: 1 },
      },
    });
    if (res.success && (res.data?.data?.list || Array.isArray(res.data?.data))) {
      const list = res.data.data.list || res.data.data;
      return list.map((r: any) => ({
        id: r.id,
        name: r.name,
        location: r.building?.name ? `${r.building.name} ${r.floor?.label || ''}` : (r.floor?.label || '중앙관'),
        quota: r.quota || (r.minQuota && r.maxQuota ? `${r.minQuota}~${r.maxQuota}명` : '정원 문의'),
        minQuota: r.minQuota,
        maxQuota: r.maxQuota,
        tags: r.equipments ? r.equipments.map((e: any) => e.name) : ['화이트보드'],
      }));
    }
  }

  // 기본 스터디룸 정적/추천 목록 (비로그인 또는 웹 브라우저 환경)
  return [
    { id: 9, name: '205호', location: '중앙관 2층', quota: '4~8명', tags: ['전자칠판', '화이트보드'] },
    { id: 10, name: '206호', location: '중앙관 2층', quota: '4~8명', tags: ['전자칠판', '화이트보드'] },
    { id: 11, name: '207호', location: '중앙관 2층', quota: '2~4명', tags: ['소형 스터디', '모니터'] },
    { id: 12, name: '208호', location: '중앙관 2층', quota: '2~4명', tags: ['소형 스터디', '모니터'] },
    { id: 13, name: '209호', location: '중앙관 2층', quota: '4~8명', tags: ['화이트보드'] },
    { id: 14, name: '305호', location: '중앙관 3층', quota: '7~14명', tags: ['대형 세미나', '빔프로젝터'] },
    { id: 15, name: '306호', location: '중앙관 3층', quota: '7~14명', tags: ['대형 세미나', '빔프로젝터'] },
    { id: 41, name: '스터디룸-1', location: '이룸관 3층', quota: '2~4명', tags: ['화이트보드'] },
    { id: 42, name: '스터디룸-2', location: '이룸관 3층', quota: '2~4명', tags: ['화이트보드'] },
    { id: 45, name: '스터디룸-5', location: '이룸관 3층', quota: '4~8명', tags: ['전자칠판', '화이트보드'] },
  ];
}

/**
 * 3. 현재 내가 이용 중인 좌석 조회 (개인 세션)
 */
export async function getMyCurrentSeat(): Promise<CurrentSeatInfo | null> {
  if (!isMobileAppEnvironment()) return null;

  const res = await executeAgentActionBridge({
    actionId: `act_my_seat_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/seat-charges',
    },
  });

  if (res.success && res.data?.data) {
    const d = res.data.data;
    if (d.id || d.seatCharge?.id) {
      return {
        chargeId: d.id || d.seatCharge?.id,
        seatId: d.seat?.id,
        seatName: d.seat?.name || '좌석',
        roomName: d.seat?.room?.name || '열람실',
        beginTime: d.beginTime,
        endTime: d.endTime,
      };
    }
  }
  return null;
}

/**
 * 4. 내 좌석 연장하기
 */
export async function renewCurrentSeat(chargeId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_renew_${chargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/seat-renewed-charges',
      body: {
        seatCharge: chargeId,
        smufMethodCode: 'MOBILE',
      },
    },
  });
  return Boolean(res.success);
}

/**
 * 5. 내 좌석 반납(퇴실)하기
 */
export async function returnCurrentSeat(chargeId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_return_${chargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/seat-discharges',
      body: {
        seatCharge: chargeId,
        smufMethodCode: 'MOBILE',
      },
    },
  });
  return Boolean(res.success);
}
