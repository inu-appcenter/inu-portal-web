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

export interface LibrarySeat {
  id: number;
  code: string;
  name?: string;
  isActive: boolean;
  isReservable: boolean;
  isOccupied: boolean;
  remainingTime?: number;
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

export interface StudyRoomMinute {
  class: string; // 'disabled' | 'occupied' | '' | 'selected'
  selectable?: boolean;
}

export interface StudyRoomTimeSlot {
  hour: number;
  minutes: StudyRoomMinute[];
}

export interface StudyRoomDetail {
  id: number;
  name: string;
  minQuota: number;
  maxQuota: number;
  quota: string;
  floor?: { value: number; label: string };
  building?: { name: string };
  description?: string;
  attention?: string;
  isChargeable: boolean;
  timeLine?: StudyRoomTimeSlot[];
}

export interface StudyRoomReservation {
  id: number;
  roomId: number;
  roomName: string;
  beginTime: string;
  endTime: string;
  status?: string;
  companionCnt?: number;
  patronMessage?: string;
}

export interface CurrentSeatInfo {
  chargeId: number;
  seatId: number;
  seatName: string;
  roomName: string;
  beginTime: string;
  endTime: string;
}

export interface StudyRoomReserveParams {
  roomId: number;
  roomUseSectionId?: number;
  beginTime: string; // 'YYYY-MM-DD HH:mm'
  endTime: string;   // 'YYYY-MM-DD HH:mm'
  companionCnt: number;
  patronMessage?: string;
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
 * 2. 열람실 개별 좌석 목록 조회
 */
export async function getRoomSeats(roomId: number, hopeDate?: string): Promise<LibrarySeat[]> {
  if (!isMobileAppEnvironment()) return [];

  const params: Record<string, any> = {};
  if (hopeDate) params.hopeDate = hopeDate;

  const res = await executeAgentActionBridge({
    actionId: `act_room_seats_${roomId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/rooms/${roomId}/seats`,
      params,
    },
  });

  if (res.success && res.data?.data?.list) {
    return res.data.data.list.map((s: any) => ({
      id: s.id,
      code: s.code || String(s.id),
      name: s.name || s.code,
      isActive: Boolean(s.isActive),
      isReservable: Boolean(s.isReservable),
      isOccupied: Boolean(s.isOccupied),
      remainingTime: s.remainingTime,
    }));
  }

  return [];
}

/**
 * 3. 열람실 좌석 배정 (예약)
 */
export async function reserveSeat(
  seatId: number,
  beginTime?: string,
  endTime?: string
): Promise<{ success: boolean; message?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, message: '모바일 앱 환경에서만 좌석 배정이 가능합니다.' };
  }

  const body: Record<string, any> = {
    seatId,
    smufMethodCode: 'MOBILE',
  };
  if (beginTime) body.beginTime = beginTime;
  if (endTime) body.endTime = endTime;

  const res = await executeAgentActionBridge({
    actionId: `act_reserve_seat_${seatId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/seat-charges',
      body,
    },
  });

  if (res.success) {
    return { success: true };
  }
  return { success: false, message: res.errorMessage || '좌석 배정에 실패했습니다.' };
}

/**
 * 4. 열람실 좌석 입실 체크인
 */
export async function checkinSeat(seatChargeId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_checkin_seat_${seatChargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'PUT',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/seat-charges/${seatChargeId}`,
      params: { smufMethodCode: 'MOBILE' },
    },
  });

  return Boolean(res.success);
}

/**
 * 5. 스터디룸 목록 조회
 */
export async function getStudyRooms(): Promise<LibraryStudyRoom[]> {
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

  return [
    { id: 9, name: '205호', location: '중앙관 2층', quota: '4~8명', minQuota: 4, maxQuota: 8, tags: ['전자칠판', '화이트보드'] },
    { id: 10, name: '206호', location: '중앙관 2층', quota: '4~8명', minQuota: 4, maxQuota: 8, tags: ['전자칠판', '화이트보드'] },
    { id: 11, name: '207호', location: '중앙관 2층', quota: '2~4명', minQuota: 2, maxQuota: 4, tags: ['소형 스터디', '모니터'] },
    { id: 12, name: '208호', location: '중앙관 2층', quota: '2~4명', minQuota: 2, maxQuota: 4, tags: ['소형 스터디', '모니터'] },
    { id: 13, name: '209호', location: '중앙관 2층', quota: '4~8명', minQuota: 4, maxQuota: 8, tags: ['화이트보드'] },
    { id: 14, name: '305호', location: '중앙관 3층', quota: '7~14명', minQuota: 7, maxQuota: 14, tags: ['대형 세미나', '빔프로젝터'] },
    { id: 15, name: '306호', location: '중앙관 3층', quota: '7~14명', minQuota: 7, maxQuota: 14, tags: ['대형 세미나', '빔프로젝터'] },
    { id: 41, name: '스터디룸-1', location: '이룸관 3층', quota: '2~4명', minQuota: 2, maxQuota: 4, tags: ['화이트보드'] },
    { id: 42, name: '스터디룸-2', location: '이룸관 3층', quota: '2~4명', minQuota: 2, maxQuota: 4, tags: ['화이트보드'] },
    { id: 45, name: '스터디룸-5', location: '이룸관 3층', quota: '4~8명', minQuota: 4, maxQuota: 8, tags: ['전자칠판', '화이트보드'] },
  ];
}

/**
 * 6. 스터디룸 상세 및 날짜별 시간대 타임라인 조회
 */
export async function getStudyRoomDetail(roomId: number, hopeDate: string): Promise<StudyRoomDetail | null> {
  if (!isMobileAppEnvironment()) return null;

  const res = await executeAgentActionBridge({
    actionId: `act_study_room_detail_${roomId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/rooms/${roomId}`,
      params: { hopeDate },
    },
  });

  if (res.success && res.data?.data) {
    const d = res.data.data;
    return {
      id: d.id,
      name: d.name,
      minQuota: d.minQuota,
      maxQuota: d.maxQuota,
      quota: d.quota,
      floor: d.floor,
      building: d.building,
      description: d.description,
      attention: d.attention,
      isChargeable: Boolean(d.isChargeable),
      timeLine: d.timeLine,
    };
  }

  return null;
}

/**
 * 7. 스터디룸 예약 생성
 */
export async function reserveStudyRoom(params: StudyRoomReserveParams): Promise<{ success: boolean; message?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, message: '모바일 앱 환경에서만 예약할 수 있습니다.' };
  }

  const res = await executeAgentActionBridge({
    actionId: `act_reserve_study_room_${params.roomId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/room-charges',
      body: {
        roomId: params.roomId,
        roomUseSectionId: params.roomUseSectionId || 1,
        beginTime: params.beginTime,
        endTime: params.endTime,
        companionCnt: params.companionCnt,
        patronMessage: params.patronMessage || '학습 및 회의',
        smufMethodCode: 'MOBILE',
      },
    },
  });

  if (res.success) {
    return { success: true };
  }
  return { success: false, message: res.errorMessage || '스터디룸 예약에 실패했습니다.' };
}

/**
 * 8. 내 스터디룸 예약 목록 조회
 */
export async function getMyStudyRoomReservations(): Promise<StudyRoomReservation[]> {
  if (!isMobileAppEnvironment()) return [];

  const res = await executeAgentActionBridge({
    actionId: `act_my_room_charges_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/room-charges',
    },
  });

  if (res.success && res.data?.data?.list) {
    return res.data.data.list.map((r: any) => ({
      id: r.id,
      roomId: r.room?.id,
      roomName: r.room?.name || '스터디룸',
      beginTime: r.beginTime,
      endTime: r.endTime,
      status: r.status || 'RESERVED',
      companionCnt: r.companionCnt,
      patronMessage: r.patronMessage,
    }));
  }

  return [];
}

/**
 * 9. 스터디룸 예약 취소
 */
export async function cancelStudyRoomReservation(chargeId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_cancel_room_charge_${chargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'DELETE',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/room-charges/${chargeId}`,
    },
  });

  return Boolean(res.success);
}

/**
 * 10. 스터디룸 입실 확인/체크인
 */
export async function checkinStudyRoom(chargeId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_checkin_room_${chargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/room-charges/${chargeId}/checkin`,
    },
  });

  return Boolean(res.success);
}

/**
 * 11. 현재 내가 이용 중인 열람실 좌석 조회 (개인 세션)
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
 * 12. 내 좌석 연장하기
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
 * 13. 내 좌석 반납(퇴실)하기
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
