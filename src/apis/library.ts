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

export interface StudyRoomRule {
  minTime?: number;
  maxTime?: number;
  timeUnit?: string;
  useCompanionRegistration?: boolean;
  useOutsiderRegistration?: boolean;
}

export interface StudyRoomDetail {
  id: number;
  name: string;
  minQuota: number;
  maxQuota: number;
  quota: string;
  floor?: { value?: number; label?: string; name?: string };
  building?: { id?: number; name?: string };
  description?: string;
  attention?: string;
  isChargeable: boolean;
  timeLine?: StudyRoomTimeSlot[];
  rule?: StudyRoomRule;
}

export interface CompanionPatron {
  id: number;
  name: string;
  memberNo: string;
  department?: string;
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
  roomId?: number;
  roomName: string;
  beginTime: string;
  endTime: string;
  isTempCharge?: boolean;
  isReturnable?: boolean;
  isRenewable?: boolean;
  isFavoriteSeat?: boolean;
  checkinExpiryDate?: string;
}

export interface StudyRoomReserveParams {
  roomId: number;
  roomUseSectionId?: number;
  beginTime: string; // 'YYYY-MM-DD HH:mm'
  endTime: string;   // 'YYYY-MM-DD HH:mm'
  companionCnt: number;
  companionPatrons?: number[];
  purpose?: string;
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
      const list = data?.data?.list || data?.list;
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (e) {
    console.warn('[LibraryApi] Direct fetch failed, trying agent bridge:', e);
  }

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
    const list = res.data?.list || res.data?.data?.list || (Array.isArray(res.data) ? res.data : []);
    if (list.length > 0) {
      return list;
    }
  }

  return [];
}

/**
 * 2. 열람실 개별 좌석 목록 조회
 */
export async function getRoomSeats(roomId: number, hopeDate?: string): Promise<{ success: boolean; seats: LibrarySeat[]; errorCode?: string; errorMessage?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, seats: [], errorCode: 'NOT_IN_APP', errorMessage: '모바일 앱 환경에서만 조회 가능합니다.' };
  }

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

  if (!res.success) {
    return {
      success: false,
      seats: [],
      errorCode: res.errorCode,
      errorMessage: res.errorMessage || '도서관 좌석 조회를 실패했습니다.',
    };
  }

  // 데이터 언래핑: res.data가 { list: [...] } 이거나 { data: { list: [...] } } 이거나 배열일 수 있음
  const rawList: any[] = res.data?.list || res.data?.data?.list || (Array.isArray(res.data) ? res.data : []);

  const seats = rawList.map((s: any) => {
    const isOccupied = Boolean(s.isOccupied) || s.seatChargeState === 'CHARGE';
    const isActive = s.isActive !== false;
    // 학산도서관 열람실은 당일 현장 즉시 배정 방식이므로 API상 isReservable이 false라도
    // 비어있고 활성화된 좌석이면 즉시 배정(isReservable: true) 가능함
    const isReservable = Boolean(s.isReservable) || (!isOccupied && isActive);

    return {
      id: s.id,
      code: s.code || String(s.id),
      name: s.name || s.code,
      isActive,
      isReservable,
      isOccupied,
      remainingTime: s.remainingTime,
    };
  });

  return { success: true, seats };
}

/**
 * 3. 열람실 좌석 배정 (예약)
 */
export async function reserveSeat(
  seatId: number,
  beginTime?: string,
  endTime?: string
): Promise<{ success: boolean; message?: string; errorCode?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, message: '모바일 앱 환경에서만 좌석 배정이 가능합니다.', errorCode: 'NOT_IN_APP' };
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
  return { success: false, message: res.errorMessage || '좌석 배정에 실패했습니다.', errorCode: res.errorCode };
}

/**
 * 4. 열람실 좌석 배정 확정 (입실 체크인)
 */
export async function checkinSeat(seatChargeId: number, roomId?: number): Promise<{ success: boolean; message?: string }> {
  if (!isMobileAppEnvironment()) return { success: false, message: '모바일 앱 환경에서만 가능합니다.' };

  // 1. 도서관 게이트 출입 확인 시도
  if (roomId) {
    try {
      await executeAgentActionBridge({
        actionId: `act_check_arrival_${roomId}_${Date.now()}`,
        authDomain: 'LIBRARY',
        request: {
          method: 'POST',
          url: `https://lib.inu.ac.kr/pyxis-api/1/api/rooms/${roomId}/check-arrival`,
          body: { methodCode: 'GATE' },
        },
      });
    } catch {}
  }

  // 2. 좌석 배정 확정 (체크인) 호출 (WAF 호환 Method Override 사용)
  const res = await executeAgentActionBridge({
    actionId: `act_checkin_seat_${seatChargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/seat-charges/${seatChargeId}?smufMethodCode=MOBILE`,
      headers: {
        'X-HTTP-Method-Override': 'PUT',
      },
    },
  });

  if (res.success) {
    return { success: true };
  }

  return {
    success: false,
    message:
      res.errorMessage ||
      res.data?.message ||
      '도서관 게이트(출입구) 통과 기록이 확인되지 않았습니다. 게이트 통과 후 다시 시도하거나 키오스크에서 태그해주세요.',
  };
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
    const rawList: any[] = res.data?.list || res.data?.data?.list || (Array.isArray(res.data) ? res.data : []);
    if (res.success && rawList.length > 0) {
      return rawList.map((r: any) => ({
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
export async function getStudyRoomDetail(roomId: number, hopeDate: string): Promise<{ success: boolean; detail: StudyRoomDetail | null; errorCode?: string; errorMessage?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, detail: null, errorCode: 'NOT_IN_APP', errorMessage: '모바일 앱 환경에서만 조회 가능합니다.' };
  }

  const res = await executeAgentActionBridge({
    actionId: `act_study_room_detail_${roomId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/rooms/${roomId}`,
      params: { hopeDate },
    },
  });

  if (!res.success) {
    return {
      success: false,
      detail: null,
      errorCode: res.errorCode,
      errorMessage: res.errorMessage || '스터디룸 상세 조회를 실패했습니다.',
    };
  }

  const d = res.data?.id ? res.data : (res.data?.data?.id ? res.data.data : null);
  if (d) {
    return {
      success: true,
      detail: {
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
        rule: d.rule ? {
          minTime: d.rule.minTime,
          maxTime: d.rule.maxTime,
          timeUnit: d.rule.timeUnit,
          useCompanionRegistration: d.rule.useCompanionRegistration,
          useOutsiderRegistration: d.rule.useOutsiderRegistration,
        } : undefined,
      },
    };
  }

  return { success: false, detail: null };
}

/**
 * 한국 시간(KST) 기준 YYYY-MM-DD 반환
 */
function getKoreanTodayString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const d = new Date();
    d.setHours(d.getHours() + 9);
    return d.toISOString().split('T')[0];
  }
}

/**
 * 6-1. 동반이용자 검색 및 검증 (이름, 학번)
 */
export async function checkCompanionPatron(
  roomId: number,
  name: string,
  memberNo: string,
  hopeDate: string
): Promise<{ success: boolean; patron?: CompanionPatron; message?: string; errorCode?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, message: '모바일 앱 환경에서만 조회 가능합니다.', errorCode: 'NOT_IN_APP' };
  }

  const todayKst = getKoreanTodayString();
  // 과거 일자 방지: 전달된 hopeDate가 오늘(KST) 이전이면 오늘 날짜로 보정
  const validHopeDate = (!hopeDate || hopeDate < todayKst) ? todayKst : hopeDate;

  // 학산도서관 공식 API 엔드포인트: /pyxis-api/api/rooms/{roomId}/check-companions (홈페이지ID 경로 없음)
  let res = await executeAgentActionBridge({
    actionId: `act_check_companion_${roomId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: `https://lib.inu.ac.kr/pyxis-api/api/rooms/${roomId}/check-companions`,
      params: {
        name: name.trim(),
        memberNo: memberNo.trim(),
        hopeDate: validHopeDate,
      },
    },
  });

  // 혹시 경로 차이로 실패했을 경우 /1/api/... 로 1회 fallback 시도
  if (!res.success && (res.errorCode === 'HTTP_404' || res.errorCode === 'HTTP_400' || res.errorMessage?.includes('bad request'))) {
    res = await executeAgentActionBridge({
      actionId: `act_check_companion_fallback_${roomId}_${Date.now()}`,
      authDomain: 'LIBRARY',
      request: {
        method: 'GET',
        url: `https://lib.inu.ac.kr/pyxis-api/1/api/rooms/${roomId}/check-companions`,
        params: {
          name: name.trim(),
          memberNo: memberNo.trim(),
          hopeDate: validHopeDate,
        },
      },
    });
  }

  const patronData = res.data?.id ? res.data : (res.data?.data?.id ? res.data.data : null);
  if (res.success && patronData) {
    return {
      success: true,
      patron: {
        id: patronData.id,
        name: patronData.name || name,
        memberNo: patronData.memberNo || memberNo,
        department: patronData.department?.name || patronData.patronType?.name || '',
      },
    };
  }

  let errorMsg = res.errorMessage || '동반 이용자를 찾을 수 없습니다.';
  if (res.data?.message) errorMsg = res.data.message;

  if (errorMsg === 'This is a bad request' || errorMsg.toLowerCase().includes('bad request')) {
    errorMsg = '동반 이용자 조회에 실패했습니다. 이름 또는 학번이 올바른지 확인해주세요.';
  } else if (res.data?.code === 'error.patron.notMatched' || res.errorCode === 'error.patron.notMatched') {
    errorMsg = '이름 또는 학번이 일치하지 않는 사용자입니다.';
  } else if (res.data?.code?.includes('penalty') || errorMsg.includes('penalty')) {
    errorMsg = '해당 사용자는 도서관 이용 제재(페널티) 상태입니다.';
  } else if (res.data?.code?.includes('reservation') || errorMsg.includes('reservation')) {
    errorMsg = '해당 사용자는 해당 시간대에 이미 다른 예약이 있습니다.';
  }

  return {
    success: false,
    message: errorMsg,
    errorCode: res.errorCode || res.data?.code,
  };
}

/**
 * 7. 스터디룸 예약 생성
 */
export async function reserveStudyRoom(params: StudyRoomReserveParams): Promise<{ success: boolean; message?: string; errorCode?: string }> {
  if (!isMobileAppEnvironment()) {
    return { success: false, message: '모바일 앱 환경에서만 예약할 수 있습니다.', errorCode: 'NOT_IN_APP' };
  }

  const combinedMessage = [params.purpose?.trim(), params.patronMessage?.trim()].filter(Boolean).join(' / ') || '학습 및 회의';

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
        companionPatrons: params.companionPatrons && params.companionPatrons.length > 0 ? params.companionPatrons : undefined,
        patronMessage: combinedMessage,
        smufMethodCode: 'MOBILE',
      },
    },
  });

  if (res.success) {
    return { success: true };
  }

  let message = res.errorMessage || '스터디룸 예약에 실패했습니다.';
  const code = res.errorCode || res.data?.code || '';

  if (code.includes('needCompanionList') || message.includes('needCompanionList')) {
    message = '동반 이용자 명단을 필수로 등록해야 예약할 수 있는 스터디룸입니다.';
  } else if (code.includes('roomHasNoChargeableHour') || message.includes('roomHasNoChargeableHour')) {
    message = '선택하신 날짜에는 해당 스터디룸을 예약할 수 없습니다. (휴관일 또는 운영 시간 외)';
  } else if (code.includes('hasReservation') || message.includes('hasReservation')) {
    message = '해당 시간대에 이미 예약된 내역이 있습니다. 다른 시간대를 선택해주세요.';
  } else if (code.includes('duplicate') || message.includes('duplicate')) {
    message = '해당 시간대에 이미 예약된 내역이 있습니다.';
  } else if (code.includes('minQuota') || message.includes('minQuota')) {
    message = '스터디룸 최소 수용 인원을 충족해야 합니다.';
  } else if (code.includes('sanction') || code.includes('penalty') || message.includes('sanction') || message.includes('penalty')) {
    message = '도서관 이용 제재(페널티) 상태로 예약이 불가합니다.';
  } else if (code.includes('time') || message.includes('timeLimit')) {
    message = '이용 가능한 예약 시간 범위를 확인해주세요.';
  } else if (message.includes('No message found under code') || message.includes('for locale')) {
    // Pyxis 서버가 번역 메시지를 찾지 못할 경우 에러 코드 추출하여 안내
    const codeMatch = message.match(/code\s+'([^']+)'/);
    const extractedCode = codeMatch ? codeMatch[1] : code;
    if (extractedCode.includes('NoChargeableHour') || extractedCode.includes('noChargeableHour')) {
      message = '선택하신 날짜에는 해당 스터디룸을 예약할 수 없습니다. (휴관일 또는 운영 시간 외)';
    } else {
      message = `예약에 실패했습니다. (${extractedCode || '알 수 없는 오류'})`;
    }
  }

  return { success: false, message, errorCode: code };
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

  if (!res.success || !res.data || res.data?.code === 'success.noRecord') {
    return [];
  }

  const rawList: any[] = res.data?.list || res.data?.data?.list || (Array.isArray(res.data) ? res.data : []);

  if (rawList.length > 0) {
    return rawList
      .filter((r: any) => {
        // 1. 좌석 정보(seat)가 있거나 열람실 좌석 배정 건인 경우 스터디룸 예약에서 제외
        if (r.seat || r.seatCharge) return false;
        // 2. 방 이름이 '열람실'인 경우 제외
        const name = r.room?.name || '';
        if (name.includes('열람실')) return false;
        return true;
      })
      .map((r: any) => ({
        id: r.id,
        roomId: r.room?.id,
        roomName: r.room?.name || '스터디룸',
        beginTime: r.beginTime,
        endTime: r.endTime,
        status: r.state?.name || r.status || 'RESERVED',
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
      params: { isMy: true },
    },
  });

  if (res.success && res.data) {
    const list = res.data?.list || res.data?.data?.list || (Array.isArray(res.data) ? res.data : []);
    const d = list.length > 0 ? list[0] : (res.data?.seat || res.data?.seatCharge ? res.data : null);
    if (d) {
      const isTemp = d.state?.code === 'TEMP_CHARGE' || d.state?.name?.includes('임시');
      return {
        chargeId: d.id || d.seatCharge?.id,
        seatId: d.seat?.id,
        seatName: d.seat?.name || d.seat?.code || '좌석',
        roomId: d.room?.id || d.seat?.room?.id,
        roomName: d.room?.name || d.seat?.room?.name || '열람실',
        beginTime: d.beginTime,
        endTime: d.endTime,
        isTempCharge: isTemp,
        isReturnable: Boolean(d.isReturnable),
        isRenewable: Boolean(d.isRenewable),
        isFavoriteSeat: Boolean(d.isFavoriteSeat),
        checkinExpiryDate: d.checkinExpiryDate,
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
export async function returnCurrentSeat(chargeId: number): Promise<{ success: boolean; message?: string }> {
  if (!isMobileAppEnvironment()) return { success: false, message: '모바일 앱 환경에서만 가능합니다.' };

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

  if (res.success) {
    return { success: true };
  }

  // 임시배정 상태로 인해 반납 불가 에러인 경우, 배정 취소(cancelSeatReservation)로 자동 대체 처리
  const msg = res.errorMessage || (res.data?.message ? String(res.data.message) : '');
  if (msg.includes('임시배정') || msg.includes('불가한 상태')) {
    const cancelRes = await cancelSeatReservation(chargeId);
    if (cancelRes.success) {
      return { success: true, message: '임시 배정 좌석이 정상 취소되었습니다.' };
    }
  }

  return {
    success: false,
    message: res.errorMessage || res.data?.message || '좌석 반납에 실패했습니다.',
  };
}

/**
 * 14. 열람실 좌석 배정/예약 취소하기 (임시배정 또는 예약 상태일 때)
 */
export async function cancelSeatReservation(chargeId: number): Promise<{ success: boolean; message?: string }> {
  if (!isMobileAppEnvironment()) return { success: false, message: '모바일 앱 환경에서만 가능합니다.' };

  const res = await executeAgentActionBridge({
    actionId: `act_cancel_seat_${chargeId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/seat-charges/${chargeId}?smufMethodCode=MOBILE`,
      headers: {
        'X-HTTP-Method-Override': 'DELETE',
      },
    },
  });

  return {
    success: Boolean(res.success),
    message: res.errorMessage || (res.data?.message ? String(res.data.message) : undefined),
  };
}

/**
 * 15. 선호좌석 지정 등록
 */
export async function setFavoriteSeat(seatId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_set_fav_${seatId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/favorite-seats',
      body: { seat: seatId },
    },
  });
  return Boolean(res.success);
}

/**
 * 16. 선호좌석 지정 해제
 */
export async function unsetFavoriteSeat(seatId: number): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const res = await executeAgentActionBridge({
    actionId: `act_unset_fav_${seatId}_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'POST',
      url: `https://lib.inu.ac.kr/pyxis-api/1/api/favorite-seats/${seatId}`,
      headers: {
        'X-HTTP-Method-Override': 'DELETE',
      },
    },
  });
  return Boolean(res.success);
}

/**
 * 17. 내 선호좌석 목록 조회 (실시간 점유 상태 포함)
 */
export async function getFavoriteSeats(): Promise<LibrarySeat[]> {
  if (!isMobileAppEnvironment()) return [];

  const res = await executeAgentActionBridge({
    actionId: `act_fav_seats_${Date.now()}`,
    authDomain: 'LIBRARY',
    request: {
      method: 'GET',
      url: 'https://lib.inu.ac.kr/pyxis-api/1/api/favorite-seats',
      params: { smufMethodCode: 'MOBILE' },
    },
  });

  const rawList: any[] = res.data?.list || res.data?.data?.list || (Array.isArray(res.data) ? res.data : []);
  return rawList.map((s: any) => {
    const isOccupied = Boolean(s.isOccupied) || s.seatChargeState === 'CHARGE';
    const isActive = s.isActive !== false;
    const roomName = s.room?.name || '';
    const seatCode = s.code || String(s.id);
    const fullName = roomName ? `${roomName} ${seatCode}번` : `${seatCode}번`;

    return {
      id: s.id,
      code: seatCode,
      name: fullName,
      isActive,
      isReservable: !isOccupied && isActive,
      isOccupied,
      remainingTime: s.remainingTime,
    };
  });
}
