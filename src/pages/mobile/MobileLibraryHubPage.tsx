import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import {
  getReadingRooms,
  getStudyRooms,
  getMyCurrentSeat,
  renewCurrentSeat,
  returnCurrentSeat,
  cancelSeatReservation,
  setFavoriteSeat,
  unsetFavoriteSeat,
  getFavoriteSeats,
  getRoomSeats,
  reserveSeat,
  checkinSeat,
  getStudyRoomDetail,
  reserveStudyRoom,
  checkCompanionPatron,
  CompanionPatron,
  getMyStudyRoomReservations,
  cancelStudyRoomReservation,
  checkinStudyRoom,
  LibrarySeatRoom,
  LibrarySeat,
  LibraryStudyRoom,
  CurrentSeatInfo,
  StudyRoomDetail,
  StudyRoomReservation,
} from "@/apis/library";
import { postRegisterCampusWatch } from "@/apis/agent";
import {
  registerLocalWatchJobInApp,
  checkLibraryAccountLinked,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import Skeleton from "@/components/common/Skeleton";
import {
  BookOpen,
  Users,
  Clock,
  Crosshair,
  RefreshCw,
  CheckCircle,
  RotateCw,
  LogOut,
  Bell,
  Sparkles,
  Calendar,
  ChevronRight,
  X,
  MapPin,
  KeyRound,
  AlertCircle,
  Star,
  UserPlus,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LibraryAccountModal } from "@/components/mobile/agent/LibraryAccountModal";

export default function MobileLibraryHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"seats" | "study" | "my">("seats");
  const [rooms, setRooms] = useState<LibrarySeatRoom[]>([]);
  const [studyRooms, setStudyRooms] = useState<LibraryStudyRoom[]>([]);
  const [mySeat, setMySeat] = useState<CurrentSeatInfo | null>(null);
  const [myStudyReservations, setMyStudyReservations] = useState<StudyRoomReservation[]>([]);
  const [favoriteSeats, setFavoriteSeats] = useState<LibrarySeat[]>([]);
  const [isLinked, setIsLinked] = useState<boolean | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMy, setIsLoadingMy] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 1. 열람실 좌석 선택 모달 상태
  const [selectedSeatRoom, setSelectedSeatRoom] = useState<LibrarySeatRoom | null>(null);
  const [roomSeats, setRoomSeats] = useState<LibrarySeat[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(false);

  // 2. 스터디룸 타임라인 & 예약 모달 상태
  const [selectedStudyRoom, setSelectedStudyRoom] = useState<LibraryStudyRoom | null>(null);
  const [studyRoomDetail, setStudyRoomDetail] = useState<StudyRoomDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reserveBeginTime, setReserveBeginTime] = useState<string>("10:00");
  const [reserveEndTime, setReserveEndTime] = useState<string>("12:00");
  const [reserveDurationHours, setReserveDurationHours] = useState<number>(2);
  const [reservePurpose, setReservePurpose] = useState<string>("조별 과제 및 토의");
  const [reserveNotes, setReserveNotes] = useState<string>("");
  const [companions, setCompanions] = useState<CompanionPatron[]>([]);
  const [companionName, setCompanionName] = useState<string>("");
  const [companionMemberNo, setCompanionMemberNo] = useState<string>("");
  const [isSearchingCompanion, setIsSearchingCompanion] = useState<boolean>(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState<boolean>(false);
  const [showAttention, setShowAttention] = useState<boolean>(true);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // 임시 배정 남은 시간(초) 카운트다운
  const [remainingCheckinSec, setRemainingCheckinSec] = useState<number | null>(null);

  useEffect(() => {
    if (!mySeat?.isTempCharge || !mySeat?.checkinExpiryDate) {
      setRemainingCheckinSec(null);
      return;
    }

    const calcRemaining = () => {
      if (!mySeat?.checkinExpiryDate) {
        setRemainingCheckinSec(null);
        return;
      }
      const expiry = new Date(mySeat.checkinExpiryDate).getTime();
      if (isNaN(expiry)) {
        setRemainingCheckinSec(null);
        return;
      }
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expiry - now) / 1000));
      setRemainingCheckinSec(diffSec);
    };

    calcRemaining();
    const timer = setInterval(calcRemaining, 1000);
    return () => clearInterval(timer);
  }, [mySeat?.isTempCharge, mySeat?.checkinExpiryDate]);

  // 임시 배정 상태일 때 15초 주기로 도서관 게이트 출입 로그 기반 자동 배정 확정 폴러
  useEffect(() => {
    if (!mySeat?.isTempCharge || !mySeat?.chargeId) return;

    const autoConfirmTimer = setInterval(async () => {
      try {
        const res = await checkinSeat(mySeat.chargeId, mySeat.roomId);
        if (res.success) {
          showToast("🎉 도서관 게이트 입실이 감지되어 좌석 배정이 자동으로 확정되었습니다!");
          loadMyStatus();
        }
      } catch {}
    }, 15000);

    return () => clearInterval(autoConfirmTimer);
  }, [mySeat?.isTempCharge, mySeat?.chargeId, mySeat?.roomId]);

  useHeader({
    title: "학산도서관 스마트 허브",
    subHeader: null,
    hasback: true,
  });

  // 열람실/스터디룸 전체 목록 조회 (독립 실행)
  const loadRoomsData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, studyData] = await Promise.all([
        getReadingRooms().catch(() => []),
        getStudyRooms().catch(() => []),
      ]);
      setRooms(roomsData);
      setStudyRooms(studyData);
    } finally {
      setIsLoading(false);
    }
  };

  // 내 이용 현황 및 선호좌석 조회 (병렬 독립 실행 및 즉각 갱신)
  const loadMyStatus = async () => {
    if (!isMobileAppEnvironment()) return;
    setIsLoadingMy(true);
    try {
      const linkRes = await checkLibraryAccountLinked().catch(() => ({ linked: false }));
      setIsLinked(linkRes.linked);
      if (linkRes.linked) {
        const [seat, studyRes, favs] = await Promise.all([
          getMyCurrentSeat().catch(() => null),
          getMyStudyRoomReservations().catch(() => []),
          getFavoriteSeats().catch(() => []),
        ]);
        setMySeat(seat);
        // 스터디룸 예약 목록에 현재 배정된 열람실 좌석이 중복 포함되지 않도록 안전 필터링
        const filteredStudyRes = (studyRes || []).filter(
          (res) => !(res.roomName || "").includes("열람실") && (!seat || res.id !== seat.chargeId)
        );
        setMyStudyReservations(filteredStudyRes);
        setFavoriteSeats(favs);
      }
    } finally {
      setIsLoadingMy(false);
    }
  };

  const loadData = () => {
    loadRoomsData();
    loadMyStatus();
  };

  useEffect(() => {
    loadData();

    const handleOpenModal = () => setIsAuthModalOpen(true);
    window.addEventListener("openLibraryAccountModal", handleOpenModal);
    return () => {
      window.removeEventListener("openLibraryAccountModal", handleOpenModal);
    };
  }, []);

  // 탭이 '내 이용 현황'으로 바뀔 때 즉시 최신 내역 단독 재조회
  useEffect(() => {
    if (activeTab === "my") {
      loadMyStatus();
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // --- 열람실 좌석 선택 모달 열기 ---
  const handleOpenSeatPicker = async (room: LibrarySeatRoom) => {
    if (!isMobileAppEnvironment()) {
      alert("좌석 선택 및 즉시 배정은 INTIP 모바일 앱 환경에서 이용하실 수 있습니다.");
      return;
    }
    setSelectedSeatRoom(room);
    setIsLoadingSeats(true);
    try {
      const res = await getRoomSeats(room.id);
      if (res.success) {
        setRoomSeats(res.seats);
      } else if (res.errorCode === "AUTH_REQUIRED" || res.errorMessage?.includes("로그인")) {
        alert("열람실 좌석 조회를 위해 학산도서관 계정 연동이 필요합니다.");
        window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
        setSelectedSeatRoom(null);
      } else {
        alert(res.errorMessage || "좌석 목록을 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("좌석 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // 좌석 배정 신청
  const handleAssignSeat = async (seat: LibrarySeat) => {
    if (seat.isOccupied || seat.isActive === false) {
      alert("현재 배정할 수 없는 좌석입니다.");
      return;
    }

    const roomName = selectedSeatRoom?.name || "열람실";
    const confirmPrompt =
      `[${roomName}] ${seat.code}번 좌석을 배정하시겠습니까?\n\n` +
      `⚠️ [배정 확정 및 이용 규정 안내]\n` +
      `• 배정 즉시 20분간 '임시 배정' 상태가 됩니다.\n` +
      `• 20분 내로 도서관 1층 게이트를 통과하시거나 키오스크에서 입실 확인을 완료해야 합니다.\n` +
      `• 20분이 지나도 미입실 시 예약이 자동 취소되며, 3회 누적 시 7일간 도서관 이용이 정지됩니다.\n` +
      `• 도착이 어려울 경우 20분 내 [예약 취소]를 누르면 페널티 없이 취소됩니다.`;

    if (!window.confirm(confirmPrompt)) return;

    try {
      const res = await reserveSeat(seat.id);
      if (res.success) {
        showToast(`🎉 ${seat.code}번 좌석이 성공적으로 배정되었습니다!`);
        setSelectedSeatRoom(null);
        setActiveTab("my");
        // 내 이용 현황을 즉시 먼저 갱신하여 탭 전환 시 바로 표시되도록 보장
        await loadMyStatus();
        loadRoomsData();
      } else if (res.errorCode === "AUTH_REQUIRED" || res.message?.includes("로그인")) {
        alert("좌석 배정을 위해 학산도서관 계정 연동이 필요합니다.");
        window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
      } else {
        alert(res.message || "좌석 배정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("좌석 배정 중 오류가 발생했습니다.");
    }
  };

  // 선호좌석 삭제
  const handleRemoveFavoriteSeat = async (seatId: number) => {
    if (!window.confirm("선호좌석 지정을 해제하시겠습니까?")) return;
    try {
      const ok = await unsetFavoriteSeat(seatId);
      if (ok) {
        showToast("⭐ 선호좌석이 해제되었습니다.");
        loadMyStatus();
      } else {
        alert("선호좌석 해제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 선호좌석 빈자리 감시 등록
  const handleRegisterFavSeatSniper = async (fav: LibrarySeat) => {
    if (!isMobileAppEnvironment()) {
      alert("특정 좌석 빈자리 실시간 감시는 INTIP 모바일 앱에서 이용할 수 있습니다.");
      return;
    }
    if (!window.confirm(`[${fav.name}]\n현재 이용 중인 좌석입니다.\n자리가 비었을 때(퇴실/반납 시) 알림을 받으시겠습니까?`)) {
      return;
    }
    try {
      await registerLocalWatchJobInApp({
        watchType: "SPECIFIC_SEAT_SNIPER",
        roomId: 0,
        roomName: fav.name || "선호좌석",
        seatId: fav.id,
        seatNo: fav.code,
        durationMinutes: 90,
      });
      showToast(`🎯 [${fav.name}] 빈자리 감시가 시작되었습니다! (최대 90분)`);
    } catch (e) {
      console.error(e);
      alert("빈자리 감시 등록에 실패했습니다.");
    }
  };

  // Helper: 시간 변환 및 10분 단위 옵션
  const parseTimeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const formatMinutesToTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const hh = h < 10 ? `0${h}` : `${h}`;
    const mm = m < 10 ? `0${m}` : `${m}`;
    return `${hh}:${mm}`;
  };

  const timeOptions10Min: string[] = (() => {
    const list: string[] = [];
    for (let h = 9; h <= 22; h++) {
      for (let m = 0; m < 60; m += 10) {
        if (h === 22 && m > 0) break;
        const hh = h < 10 ? `0${h}` : `${h}`;
        const mm = m < 10 ? `0${m}` : `${m}`;
        list.push(`${hh}:${mm}`);
      }
    }
    return list;
  })();

  // --- 스터디룸 타임라인 & 예약 모달 열기 ---
  const handleOpenStudyBooking = async (sRoom: LibraryStudyRoom) => {
    if (!isMobileAppEnvironment()) {
      alert("스터디룸 타임라인 조회 및 예약은 INTIP 모바일 앱 환경에서 지원됩니다.");
      return;
    }
    setSelectedStudyRoom(sRoom);
    setCompanions([]);
    setCompanionName("");
    setCompanionMemberNo("");
    setIsPrivacyAgreed(false);
    setReservePurpose("조별 과제 및 토의");
    setReserveNotes("");
    setReserveBeginTime("10:00");
    setReserveEndTime("12:00");
    setReserveDurationHours(2);
    setShowAttention(true);
    await loadStudyTimeline(sRoom.id, selectedDate);
  };

  const loadStudyTimeline = async (roomId: number, dateStr: string) => {
    setIsLoadingTimeline(true);
    try {
      const res = await getStudyRoomDetail(roomId, dateStr);
      if (res.success && res.detail) {
        setStudyRoomDetail(res.detail);
      } else if (res.errorCode === "AUTH_REQUIRED" || res.errorMessage?.includes("로그인")) {
        alert("스터디룸 시간표 조회를 위해 학산도서관 계정 연동이 필요합니다.");
        window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
        setSelectedStudyRoom(null);
      } else {
        setStudyRoomDetail(null);
      }
    } catch (e) {
      console.error(e);
      setStudyRoomDetail(null);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (selectedStudyRoom) {
      loadStudyTimeline(selectedStudyRoom.id, newDate);
    }
  };

  // 시작 시간 변경 시 자동 종료시간 및 지속시간 재계산
  const handleBeginTimeChange = (newBegin: string) => {
    setReserveBeginTime(newBegin);
    const startMin = parseTimeToMinutes(newBegin);
    const currentEndMin = parseTimeToMinutes(reserveEndTime);
    const duration = currentEndMin - startMin;
    const minTime = studyRoomDetail?.rule?.minTime || 30;
    const maxTime = studyRoomDetail?.rule?.maxTime || 240;

    if (duration < minTime || duration > maxTime) {
      const defDuration = Math.min(120, maxTime);
      const newEnd = Math.min(22 * 60, startMin + defDuration);
      setReserveEndTime(formatMinutesToTime(newEnd));
      setReserveDurationHours(Math.max(1, Math.round(defDuration / 60)));
    } else {
      setReserveDurationHours(Math.max(1, Math.round(duration / 60)));
    }
  };

  // 빠른 이용 시간 선택 버튼
  const handleSelectDuration = (minutes: number) => {
    const startMin = parseTimeToMinutes(reserveBeginTime);
    const newEnd = Math.min(22 * 60, startMin + minutes);
    setReserveEndTime(formatMinutesToTime(newEnd));
    setReserveDurationHours(Math.max(1, Math.round(minutes / 60)));
  };

  // 동반이용자 검색 및 추가
  const handleAddCompanion = async () => {
    if (!selectedStudyRoom) return;
    const name = companionName.trim();
    const memberNo = companionMemberNo.trim();
    if (!name || !memberNo) {
      alert("동반 이용자의 이름과 학번을 모두 입력해주세요.");
      return;
    }
    if (companions.some((c) => c.memberNo === memberNo)) {
      alert("이미 등록된 동반 이용자입니다.");
      return;
    }
    const maxCompanions = Math.max(
      0,
      (studyRoomDetail?.maxQuota || selectedStudyRoom.maxQuota || 10) - 1
    );
    if (companions.length >= maxCompanions) {
      alert(`최대 동반 가능 인원(${maxCompanions}명)을 초과할 수 없습니다.`);
      return;
    }

    setIsSearchingCompanion(true);
    try {
      const res = await checkCompanionPatron(selectedStudyRoom.id, name, memberNo, selectedDate);
      if (res.success && res.patron) {
        setCompanions((prev) => [...prev, res.patron!]);
        setCompanionName("");
        setCompanionMemberNo("");
        showToast(`✅ 동반 이용자 '${res.patron.name}'님이 추가되었습니다.`);
      } else {
        alert(res.message || "동반 이용자를 찾을 수 없습니다. 이름과 학번을 확인해주세요.");
      }
    } catch (e) {
      console.error(e);
      alert("동반 이용자 확인 중 오류가 발생했습니다.");
    } finally {
      setIsSearchingCompanion(false);
    }
  };

  // 동반이용자 삭제
  const handleRemoveCompanion = (id: number) => {
    setCompanions((prev) => prev.filter((c) => c.id !== id));
  };

  // 스터디룸 예약 제출
  const handleSubmitStudyBooking = async () => {
    if (!selectedStudyRoom) return;

    if (!reservePurpose.trim()) {
      alert("예약 용도(사용 목적)를 입력해주세요.");
      return;
    }

    const minQuota = studyRoomDetail?.minQuota || selectedStudyRoom.minQuota || 1;
    const maxQuota = studyRoomDetail?.maxQuota || selectedStudyRoom.maxQuota || 10;
    const minCompanions = Math.max(0, minQuota - 1);
    const maxCompanions = Math.max(0, maxQuota - 1);

    if (minCompanions > 0 && companions.length < minCompanions) {
      alert(
        `[${selectedStudyRoom.name}]은(는) 본인 포함 최소 ${minQuota}인실입니다.\n동반 이용자를 최소 ${minCompanions}명 이상 등록해야 예약할 수 있습니다. (현재: ${companions.length}명 등록됨)`
      );
      return;
    }

    if (companions.length > maxCompanions) {
      alert(`최대 동반 가능 인원(${maxCompanions}명)을 초과할 수 없습니다.`);
      return;
    }

    if (!isPrivacyAgreed) {
      alert("동반이용자 개인정보 수집 및 이용에 동의해야 예약할 수 있습니다.");
      return;
    }

    const startMin = parseTimeToMinutes(reserveBeginTime);
    const endMin = parseTimeToMinutes(reserveEndTime);
    const durationMin = endMin - startMin;
    const minTimeAllowed = studyRoomDetail?.rule?.minTime || 30;
    const maxTimeAllowed = studyRoomDetail?.rule?.maxTime || 240;

    if (durationMin <= 0) {
      alert("종료 시간은 시작 시간 이후여야 합니다.");
      return;
    }

    if (durationMin < minTimeAllowed || durationMin > maxTimeAllowed) {
      alert(
        `이용 가능 시간은 ${minTimeAllowed}분 ~ ${maxTimeAllowed}분입니다. (선택된 시간: ${durationMin}분)`
      );
      return;
    }

    const beginFull = `${selectedDate} ${reserveBeginTime}`;
    const endFull = `${selectedDate} ${reserveEndTime}`;

    const companionListText =
      companions.length > 0
        ? `\n동반자 (${companions.length}명): ${companions.map((c) => `${c.name}(${c.memberNo})`).join(", ")}`
        : "";

    const confirmMsg =
      `[${selectedStudyRoom.name}]\n` +
      `일시: ${beginFull} ~ ${reserveEndTime} (${durationMin}분)\n` +
      `총 인원: ${companions.length + 1}명 (본인 + 동반자 ${companions.length}명)${companionListText}\n` +
      `용도: ${reservePurpose}\n` +
      (reserveNotes.trim() ? `요청사항: ${reserveNotes.trim()}\n` : "") +
      `\n위 내용으로 예약하시겠습니까?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const res = await reserveStudyRoom({
        roomId: selectedStudyRoom.id,
        beginTime: beginFull,
        endTime: endFull,
        companionCnt: companions.length,
        companionPatrons: companions.map((c) => c.id),
        purpose: reservePurpose,
        patronMessage: reserveNotes,
      });

      if (res.success) {
        showToast(`🎉 '${selectedStudyRoom.name}' 예약이 완료되었습니다!`);
        setSelectedStudyRoom(null);
        setActiveTab("my");
        loadData();
      } else {
        alert(res.message || "스터디룸 예약에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("예약 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // --- 스터디룸 예약 취소 및 체크인 ---
  const handleCancelStudyReservation = async (chargeId: number, roomName: string) => {
    if (!window.confirm(`'${roomName}' 스터디룸 예약을 취소하시겠습니까?`)) return;
    try {
      const ok = await cancelStudyRoomReservation(chargeId);
      if (ok) {
        showToast("스터디룸 예약이 취소되었습니다.");
        loadData();
      } else {
        alert("예약 취소에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckinStudyReservation = async (chargeId: number) => {
    try {
      const ok = await checkinStudyRoom(chargeId);
      if (ok) {
        showToast("✅ 스터디룸 입실 체크인이 완료되었습니다!");
        loadData();
      } else {
        alert("체크인 가능 시간이 아니거나 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 열람실 좌석 체크인, 연장, 반납 ---
  const handleCheckinSeat = async () => {
    if (!mySeat) return;
    try {
      const res = await checkinSeat(mySeat.chargeId, mySeat.roomId);
      if (res.success) {
        showToast("🎉 좌석 배정이 정상 확정되었습니다!");
        loadData();
      } else {
        alert(
          res.message ||
            "도서관 게이트(출입구) 통과 기록이 확인되지 않았습니다.\n도서관 게이트 통과 후 '배정 확정'을 다시 누르시거나 도서관 키오스크에서 태그해주세요."
        );
      }
    } catch (e) {
      console.error(e);
      alert("배정 확정 처리 중 오류가 발생했습니다.");
    }
  };

  const handleToggleFavoriteSeat = async () => {
    if (!mySeat) return;
    try {
      if (mySeat.isFavoriteSeat) {
        await unsetFavoriteSeat(mySeat.seatId);
        showToast("⭐ 선호좌석 지정이 해제되었습니다.");
      } else {
        await setFavoriteSeat(mySeat.seatId);
        showToast("⭐ 선호좌석으로 정상 등록되었습니다!");
      }
      loadData();
    } catch (e) {
      console.error(e);
      alert("선호좌석 처리 중 오류가 발생했습니다.");
    }
  };

  const handleRenewSeat = async () => {
    if (!mySeat) return;
    try {
      const ok = await renewCurrentSeat(mySeat.chargeId);
      if (ok) {
        showToast("🔄 좌석 이용 시간이 1시간 정상 연장되었습니다.");
        loadData();
      } else {
        alert("좌석 연장 가능 시간이 아니거나 연장에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturnSeat = async () => {
    if (!mySeat) return;
    const isTemp = mySeat.isTempCharge;
    const confirmMsg = isTemp
      ? "아직 입실하지 않은 임시 배정 상태입니다.\n좌석 배정을 취소하시겠습니까?"
      : "정말 퇴실 반납하시겠습니까?";

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isTemp) {
        const cancelRes = await cancelSeatReservation(mySeat.chargeId);
        if (cancelRes.success) {
          showToast("🚪 좌석 배정이 정상 취소되었습니다.");
          setMySeat(null);
          loadData();
          return;
        }
      }

      const res = await returnCurrentSeat(mySeat.chargeId);
      if (res.success) {
        showToast(res.message || "🚪 좌석이 정상 반납되었습니다.");
        setMySeat(null);
        loadData();
      } else {
        alert(res.message || "좌석 반납/취소에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("좌석 반납/취소 중 오류가 발생했습니다.");
    }
  };

  // --- 감시 알림 등록 ---
  // 1. 열람실 전체 빈자리 감시 (서버 FCM)
  const handleRegisterSeatSniper = async (room: LibrarySeatRoom) => {
    try {
      await postRegisterCampusWatch({
        domain: "LIBRARY_SEAT",
        targetId: String(room.id),
        targetName: room.name,
        durationMinutes: 90,
      });
      showToast(`🎯 '${room.name}' 빈자리 감시가 시작되었습니다! (최대 90분)`);
    } catch (e) {
      console.error(e);
      alert("빈자리 감시 등록에 실패했습니다.");
    }
  };

  // 2. 열람실 특정 좌석 번호 빈자리 감시 (모바일 기기 로컬 폴러)
  const handleRegisterSpecificSeatSniper = async (seat: LibrarySeat) => {
    if (!selectedSeatRoom) return;
    if (!isMobileAppEnvironment()) {
      alert("특정 좌석 빈자리 실시간 감시는 INTIP 모바일 앱에서 이용할 수 있습니다.");
      return;
    }

    const seatDisplay = `${selectedSeatRoom.name} ${seat.code}번 좌석`;
    if (!window.confirm(`[${seatDisplay}]\n현재 다른 학우가 사용 중인 좌석입니다.\n자리가 비었을 때(퇴실/반납 시) 알림을 받으시겠습니까?`)) {
      return;
    }

    try {
      await registerLocalWatchJobInApp({
        watchType: "SPECIFIC_SEAT_SNIPER",
        roomId: selectedSeatRoom.id,
        roomName: selectedSeatRoom.name,
        seatId: seat.id,
        seatNo: seat.code,
        durationMinutes: 90,
      });
      showToast(`🎯 [${seatDisplay}] 빈자리 감시가 시작되었습니다! (최대 90분)`);
      setSelectedSeatRoom(null);
    } catch (e) {
      console.error(e);
      alert("특정 좌석 빈자리 감시 등록에 실패했습니다.");
    }
  };

  // 3. 스터디룸 희망 시간대 취소표 감시 (모바일 기기 로컬 폴러)
  const handleRegisterStudySlotSniper = async () => {
    if (!selectedStudyRoom) return;
    if (!isMobileAppEnvironment()) {
      alert("스터디룸 취소표 감시는 INTIP 모바일 앱에서 이용할 수 있습니다.");
      return;
    }

    const startHour = parseInt(reserveBeginTime.split(":")[0], 10);
    const dateLabel = selectedDate === new Date().toISOString().split("T")[0] ? "오늘" : selectedDate;

    if (
      !window.confirm(
        `[${selectedStudyRoom.name}]\n일자: ${dateLabel} (${selectedDate})\n희망 시간: ${startHour}:00 (${reserveDurationHours}시간)\n취소표가 발생했을 때 즉시 알림을 받으시겠습니까?`
      )
    ) {
      return;
    }

    try {
      await registerLocalWatchJobInApp({
        watchType: "STUDY_ROOM_SNIPER",
        roomId: selectedStudyRoom.id,
        roomName: selectedStudyRoom.name,
        hopeDate: selectedDate,
        targetHour: startHour,
        durationMinutes: 60,
      });
      showToast(`🎯 [${selectedStudyRoom.name} ${startHour}시] 취소표 감시가 시작되었습니다!`);
      setSelectedStudyRoom(null);
    } catch (e) {
      console.error(e);
      alert("취소표 감시 등록에 실패했습니다.");
    }
  };

  const handleRegisterStudySniper = async (sRoom: LibraryStudyRoom) => {
    if (!isMobileAppEnvironment()) {
      alert("취소표 백그라운드 감시는 INTIP 모바일 앱에서 이용할 수 있습니다.");
      return;
    }
    // 카드에서 바로 누를 때는 현재 시간 기준 다음 정시 또는 기본 15시
    const nextHour = Math.min(20, Math.max(9, new Date().getHours() + 1));
    const today = new Date().toISOString().split("T")[0];
    try {
      await registerLocalWatchJobInApp({
        watchType: "STUDY_ROOM_SNIPER",
        roomId: sRoom.id,
        roomName: sRoom.name,
        hopeDate: today,
        targetHour: nextHour,
        durationMinutes: 60,
      });
      showToast(`🎯 '${sRoom.name}' 오늘 ${nextHour}시 취소표 감시가 시작되었습니다! (60분)`);
    } catch (e) {
      console.error(e);
      alert("취소표 감시 등록에 실패했습니다.");
    }
  };

  const handleRegisterSeatReminder = async () => {
    if (!mySeat) return;
    try {
      await registerLocalWatchJobInApp({
        watchType: "SEAT_EXPIRATION",
        seatName: `${mySeat.roomName} ${mySeat.seatName}`,
        endTime: mySeat.endTime,
      });
      showToast("⏰ 좌석 만료 20분 전 정각 알람이 예약되었습니다.");
    } catch (e) {
      console.error(e);
      alert("알람 등록에 실패했습니다.");
    }
  };

  // 날짜 옵션 생성 (오늘, 내일, 모레)
  const dateOptions = [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const str = d.toISOString().split("T")[0];
    const label = offset === 0 ? "오늘" : offset === 1 ? "내일" : "모레";
    return { value: str, label: `${label} (${str.slice(5)})` };
  });

  return (
    <Container>
      {/* 상단 탭 네비게이션 */}
      <TabBar>
        <TabItem $active={activeTab === "seats"} onClick={() => setActiveTab("seats")}>
          <BookOpen size={16} />
          <span>열람실 좌석</span>
        </TabItem>
        <TabItem $active={activeTab === "study"} onClick={() => setActiveTab("study")}>
          <Users size={16} />
          <span>스터디룸 예약</span>
        </TabItem>
        <TabItem $active={activeTab === "my"} onClick={() => setActiveTab("my")}>
          <Clock size={16} />
          <span>내 이용 현황</span>
          {(mySeat || myStudyReservations.length > 0) && <BadgeDot />}
        </TabItem>
      </TabBar>

      {/* 도서관 계정 연동 유도 배너 */}
      {isLinked === false && (
        <AuthBannerCard onClick={() => setIsAuthModalOpen(true)}>
          <BannerLeft>
            <KeyRound size={18} color="#d97706" />
            <BannerText>
              <strong style={{ color: "#92400e" }}>도서관 계정 연동하기</strong>
              <span style={{ color: "#b45309" }}>학산도서관 계정을 연동하면 좌석 배정 및 스터디룸 예약이 가능해요</span>
            </BannerText>
          </BannerLeft>
          <ChevronRight size={18} color="#d97706" />
        </AuthBannerCard>
      )}

      {/* 스마트 감시 대시보드 바로가기 배너 */}
      <BannerCard onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}>
        <BannerLeft>
          <Sparkles size={18} color="#2563eb" />
          <BannerText>
            <strong>스마트 감시 & 리마인더 관리</strong>
            <span>실시간 빈자리 감시 및 자동 만료 알람 내역</span>
          </BannerText>
        </BannerLeft>
        <ChevronRight size={18} color="#94a3b8" />
      </BannerCard>

      {/* 액션 피드백 토스트 */}
      {actionMessage && (
        <ToastMessage>
          <CheckCircle size={16} color="#16a34a" />
          <span>{actionMessage}</span>
        </ToastMessage>
      )}

      {/* ================= 1. 열람실 좌석 탭 ================= */}
      {activeTab === "seats" && (
        <Section>
          {/* 내 선호좌석 퀵 리스트 */}
          {favoriteSeats.length > 0 && (
            <FavSection>
              <FavHeader>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Star size={15} color="#f59e0b" fill="#f59e0b" />
                  <FavTitle>내 선호좌석 ({favoriteSeats.length})</FavTitle>
                </div>
              </FavHeader>
              <FavGrid>
                {favoriteSeats.map((fav) => (
                  <FavCard key={fav.id}>
                    <FavCardTop>
                      <FavName>{fav.name}</FavName>
                      <FavBadge $isAvail={!fav.isOccupied}>
                        {!fav.isOccupied ? "배정 가능" : "이용 중"}
                      </FavBadge>
                    </FavCardTop>
                    <FavBtnRow>
                      {!fav.isOccupied ? (
                        <FavActionBtn onClick={() => handleAssignSeat(fav)}>
                          <CheckCircle size={13} />
                          <span>즉시 배정</span>
                        </FavActionBtn>
                      ) : (
                        <FavActionBtn onClick={() => handleRegisterFavSeatSniper(fav)}>
                          <Crosshair size={13} />
                          <span>빈자리 알림</span>
                        </FavActionBtn>
                      )}
                      <FavDeleteBtn onClick={() => handleRemoveFavoriteSeat(fav.id)} title="선호좌석 해제">
                        <X size={14} />
                      </FavDeleteBtn>
                    </FavBtnRow>
                  </FavCard>
                ))}
              </FavGrid>
            </FavSection>
          )}

          <SectionHeader>
            <SectionTitle>실시간 열람실 좌석 현황</SectionTitle>
            <RefreshButton onClick={loadData}>
              <RefreshCw size={14} />
              <span>새로고침</span>
            </RefreshButton>
          </SectionHeader>

          {isLoading ? (
            <SkeletonList>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i}>
                  <Skeleton width="45%" height="20px" style={{ borderRadius: "6px" }} />
                  <Skeleton width="100%" height="10px" style={{ borderRadius: "999px" }} />
                  <Skeleton width="100%" height="36px" style={{ borderRadius: "8px" }} />
                </SkeletonCard>
              ))}
            </SkeletonList>
          ) : rooms.length === 0 ? (
            <EmptyBox>현재 조회 가능한 열람실이 없습니다.</EmptyBox>
          ) : (
            <RoomGrid>
              {rooms.map((room) => {
                const total = room.seats?.total ?? room.totalSeats ?? 0;
                const available = room.seats?.available ?? room.availableSeats ?? 0;
                const occupied = room.seats?.occupied ?? room.occupiedSeats ?? 0;
                const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
                const isFull = available === 0 && total > 0;

                return (
                  <RoomCard key={room.id} $isFull={isFull}>
                    <RoomHeader>
                      <RoomName>{room.name}</RoomName>
                      <SeatBadge $isFull={isFull}>
                        {isFull ? "만석" : `잔여 ${available}석`}
                      </SeatBadge>
                    </RoomHeader>

                    {/* 점유율 프로그레스 바 */}
                    <ProgressBarContainer>
                      <ProgressBarFill $rate={occupancyRate} $isFull={isFull} />
                    </ProgressBarContainer>
                    <SeatStatRow>
                      <span>총 {total}석</span>
                      <span>
                        이용 중 {occupied}석 ({occupancyRate}%)
                      </span>
                    </SeatStatRow>

                    {/* 버튼 영역: 좌석 직접 배정 + 빈자리 감시 */}
                    <ButtonRow>
                      <PrimaryActionBtn onClick={() => handleOpenSeatPicker(room)}>
                        <BookOpen size={14} />
                        <span>좌석 선택 배정</span>
                      </PrimaryActionBtn>

                      {isFull && (
                        <SniperActionBtn onClick={() => handleRegisterSeatSniper(room)}>
                          <Crosshair size={14} />
                          <span>빈자리 알림</span>
                        </SniperActionBtn>
                      )}
                    </ButtonRow>
                  </RoomCard>
                );
              })}
            </RoomGrid>
          )}
        </Section>
      )}

      {/* ================= 2. 스터디룸 예약 탭 ================= */}
      {activeTab === "study" && (
        <Section>
          <SectionHeader>
            <SectionTitle>스터디룸 시간대 확인 및 예약</SectionTitle>
            <RefreshButton onClick={loadData}>
              <RefreshCw size={14} />
              <span>새로고침</span>
            </RefreshButton>
          </SectionHeader>

          <NoticeBanner>
            💡 날짜별 10분 단위 예약 현황을 실시간으로 확인하고 직접 예약할 수 있습니다.
          </NoticeBanner>

          {isLoading ? (
            <SkeletonList>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i}>
                  <Skeleton width="50%" height="20px" style={{ borderRadius: "6px" }} />
                  <Skeleton width="80%" height="14px" style={{ borderRadius: "4px" }} />
                  <Skeleton width="100%" height="36px" style={{ borderRadius: "8px" }} />
                </SkeletonCard>
              ))}
            </SkeletonList>
          ) : (
            <StudyGrid>
              {studyRooms.map((s) => (
                <StudyCard key={s.id}>
                  <StudyHeader>
                    <div>
                      <StudyName>{s.name}</StudyName>
                      <StudyLocation>
                        <MapPin size={12} />
                        <span>{s.location}</span>
                      </StudyLocation>
                    </div>
                    <QuotaBadge>{s.quota}</QuotaBadge>
                  </StudyHeader>

                  {s.tags && s.tags.length > 0 && (
                    <TagRow>
                      {s.tags.map((t, idx) => (
                        <TagChip key={idx}>{t}</TagChip>
                      ))}
                    </TagRow>
                  )}

                  <ButtonRow>
                    <PrimaryActionBtn onClick={() => handleOpenStudyBooking(s)}>
                      <Calendar size={14} />
                      <span>시간표 조회 & 예약</span>
                    </PrimaryActionBtn>
                    <SniperActionBtn onClick={() => handleRegisterStudySniper(s)}>
                      <Crosshair size={14} />
                      <span>취소표 감시</span>
                    </SniperActionBtn>
                  </ButtonRow>
                </StudyCard>
              ))}
            </StudyGrid>
          )}
        </Section>
      )}

      {/* ================= 3. 내 이용 현황 탭 ================= */}
      {activeTab === "my" && (
        <Section>
          <SectionHeader>
            <SectionTitle>내 도서관 이용 및 예약 현황</SectionTitle>
            <RefreshButton onClick={loadData}>
              <RefreshCw size={14} />
              <span>새로고침</span>
            </RefreshButton>
          </SectionHeader>

          {/* 3-1. 열람실 좌석 섹션 */}
          <SubTitle>현재 이용 중인 열람실 좌석</SubTitle>
          {mySeat ? (
            <ActiveSeatCard>
              <ActiveSeatHeader>
                <ActiveBadge $isTemp={mySeat.isTempCharge}>
                  {mySeat.isTempCharge ? "임시 배정 (미입실)" : "이용 중"}
                </ActiveBadge>
                <SeatRoomTitle>
                  {mySeat.roomName} <strong>{mySeat.seatName}</strong>
                </SeatRoomTitle>
              </ActiveSeatHeader>

              {mySeat.isTempCharge && (
                <TempNoticeBox>
                  <AlertCircle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <strong style={{ fontSize: "13px", color: "#78350f" }}>배정 확정 안내</strong>
                      {remainingCheckinSec !== null && (
                        <ExpiryBadge $urgent={remainingCheckinSec < 300}>
                          ⏳ 남은 시간: {Math.floor(remainingCheckinSec / 60)}분{" "}
                          {(remainingCheckinSec % 60) < 10 ? `0${remainingCheckinSec % 60}` : remainingCheckinSec % 60}초
                        </ExpiryBadge>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.45 }}>
                      학산도서관 1층 게이트 통과 후 <strong>[배정 확정]</strong>을 누르시거나, 도서관 내에 계시면 잠시 후 자동으로 배정이 확정됩니다.
                    </span>
                    <NoticeBulletList>
                      <li>• 20분 내 미입실 시 예약이 자동 취소되며, <strong>누적 3회 시 7일간 이용이 정지</strong>됩니다.</li>
                      <li>• 지금 이용하기 어려우실 경우 20분 내 <strong>[예약 취소]</strong>를 누르시면 페널티 없이 취소됩니다.</li>
                    </NoticeBulletList>
                  </div>
                </TempNoticeBox>
              )}

              <SeatTimeInfo>
                <Clock size={16} color="#2563eb" />
                <span>
                  이용 시간:{" "}
                  {mySeat.beginTime
                    ? mySeat.beginTime.length >= 16
                      ? mySeat.beginTime.slice(11, 16)
                      : mySeat.beginTime
                    : "-"}
                  {" ~ "}
                  {mySeat.endTime
                    ? mySeat.endTime.length >= 16
                      ? mySeat.endTime.slice(11, 16)
                      : mySeat.endTime
                    : "-"}
                </span>
              </SeatTimeInfo>

              <ActionRow>
                {mySeat.isTempCharge ? (
                  <>
                    <ActionButton
                      onClick={handleCheckinSeat}
                      style={{ background: "#2563eb", color: "#fff", border: "none" }}
                    >
                      <CheckCircle size={14} />
                      <span>배정 확정</span>
                    </ActionButton>
                    <ActionButton onClick={handleToggleFavoriteSeat}>
                      <Star
                        size={14}
                        color={mySeat.isFavoriteSeat ? "#f59e0b" : "#64748b"}
                        fill={mySeat.isFavoriteSeat ? "#f59e0b" : "none"}
                      />
                      <span>{mySeat.isFavoriteSeat ? "선호좌석 해제" : "선호좌석지정"}</span>
                    </ActionButton>
                    <ActionButton onClick={handleReturnSeat} $danger>
                      <LogOut size={14} />
                      <span>예약 취소</span>
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton
                      onClick={handleRenewSeat}
                      style={{ background: "#2563eb", color: "#fff", border: "none" }}
                    >
                      <RotateCw size={14} />
                      <span>1시간 연장</span>
                    </ActionButton>
                    <ActionButton onClick={handleToggleFavoriteSeat}>
                      <Star
                        size={14}
                        color={mySeat.isFavoriteSeat ? "#f59e0b" : "#64748b"}
                        fill={mySeat.isFavoriteSeat ? "#f59e0b" : "none"}
                      />
                      <span>{mySeat.isFavoriteSeat ? "선호좌석 해제" : "선호좌석지정"}</span>
                    </ActionButton>
                    <ActionButton onClick={handleReturnSeat} $danger>
                      <LogOut size={14} />
                      <span>퇴실 반납</span>
                    </ActionButton>
                  </>
                )}
              </ActionRow>

              <ReminderRow onClick={handleRegisterSeatReminder}>
                <Bell size={14} color="#d97706" />
                <span>종료 20분 전 정각 알람 신청하기</span>
              </ReminderRow>
            </ActiveSeatCard>
          ) : isLoadingMy ? (
            <EmptyBox>좌석 이용 현황 확인 중...</EmptyBox>
          ) : (
            <EmptyBox>현재 배정된 열람실 좌석이 없습니다.</EmptyBox>
          )}

          {/* 3-2. 스터디룸 예약 섹션 */}
          <SubTitle style={{ marginTop: "24px" }}>내 스터디룸 예약 내역</SubTitle>
          {myStudyReservations.length > 0 ? (
            <ReservationList>
              {myStudyReservations.map((res) => {
                const isCheckinCompleted =
                  res.status === "USE" ||
                  res.status === "이용중" ||
                  res.status === "입실" ||
                  res.status === "CHARGE";

                return (
                  <ReservationCard key={res.id}>
                    <ReservationTop>
                      <strong>{res.roomName}</strong>
                      <ReservationStatus>{res.status || "예약됨"}</ReservationStatus>
                    </ReservationTop>
                    <ReservationTime>
                      <Clock size={13} />
                      <span>
                        {res.beginTime} ~ {res.endTime}
                      </span>
                    </ReservationTime>
                    {res.companionCnt && (
                      <ReservationNote>동반 인원: {res.companionCnt}명</ReservationNote>
                    )}

                    <ReservationActionRow>
                      {!isCheckinCompleted && (
                        <SmallActionBtn onClick={() => handleCheckinStudyReservation(res.id)}>
                          <CheckCircle size={13} />
                          <span>입실 체크인</span>
                        </SmallActionBtn>
                      )}
                      <SmallActionBtn
                        $danger
                        onClick={() => handleCancelStudyReservation(res.id, res.roomName)}
                      >
                        <X size={13} />
                        <span>예약 취소</span>
                      </SmallActionBtn>
                    </ReservationActionRow>
                  </ReservationCard>
                );
              })}
            </ReservationList>
          ) : isLoadingMy ? (
            <EmptyBox>스터디룸 예약 내역 확인 중...</EmptyBox>
          ) : (
            <EmptyBox>진행 중인 스터디룸 예약이 없습니다.</EmptyBox>
          )}

          {/* 3-3. 내 선호좌석 목록 섹션 */}
          <SubTitle style={{ marginTop: "24px" }}>내 선호좌석 목록 ({favoriteSeats.length})</SubTitle>
          {favoriteSeats.length > 0 ? (
            <FavGrid>
              {favoriteSeats.map((fav) => (
                <FavCard key={fav.id}>
                  <FavCardTop>
                    <FavName>{fav.name}</FavName>
                    <FavBadge $isAvail={!fav.isOccupied}>
                      {!fav.isOccupied ? "배정 가능" : "이용 중"}
                    </FavBadge>
                  </FavCardTop>
                  <FavBtnRow>
                    {!fav.isOccupied ? (
                      <FavActionBtn onClick={() => handleAssignSeat(fav)}>
                        <CheckCircle size={13} />
                        <span>즉시 배정</span>
                      </FavActionBtn>
                    ) : (
                      <FavActionBtn onClick={() => handleRegisterFavSeatSniper(fav)}>
                        <Crosshair size={13} />
                        <span>빈자리 알림</span>
                      </FavActionBtn>
                    )}
                    <FavDeleteBtn onClick={() => handleRemoveFavoriteSeat(fav.id)} title="선호좌석 해제">
                      <X size={14} />
                    </FavDeleteBtn>
                  </FavBtnRow>
                </FavCard>
              ))}
            </FavGrid>
          ) : (
            <EmptyBox>등록된 선호좌석이 없습니다. 열람실 좌석에서 ★을 눌러 등록해보세요.</EmptyBox>
          )}
        </Section>
      )}

      {/* ================= 모달 1: 열람실 좌석 선택 모달 ================= */}
      {selectedSeatRoom && (
        <ModalOverlay onClick={() => setSelectedSeatRoom(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>{selectedSeatRoom.name} 좌석 선택</ModalTitle>
                <ModalSubtitle>비어있는 파란색 좌석을 터치하여 배정하세요.</ModalSubtitle>
              </div>
              <CloseBtn onClick={() => setSelectedSeatRoom(null)}>
                <X size={20} />
              </CloseBtn>
            </ModalHeader>

            {isLoadingSeats ? (
              <ModalLoading>
                <RefreshCw size={24} className="spin" />
                <span>좌석 배치도를 불러오는 중...</span>
              </ModalLoading>
            ) : roomSeats.length === 0 ? (
              <EmptyBox>조회된 좌석이 없습니다.</EmptyBox>
            ) : (
              <>
                <SeatLegendRow>
                  <SeatLegendItem>
                    <SeatLegendBox $color="#eff6ff" $border="#93c5fd" />
                    <span>배정 가능 (터치 시 배정)</span>
                  </SeatLegendItem>
                  <SeatLegendItem>
                    <SeatLegendBox $color="#fef2f2" $border="#fca5a5" />
                    <span>사용 중 (터치 시 빈자리 알림)</span>
                  </SeatLegendItem>
                </SeatLegendRow>

                <SeatGridContainer>
                  {roomSeats.map((seat) => {
                    const isAvailable = !seat.isOccupied && seat.isActive !== false;
                    return (
                      <SeatButton
                        key={seat.id}
                        $isOccupied={seat.isOccupied}
                        $isReservable={isAvailable}
                        $isDisabled={seat.isActive === false}
                        disabled={seat.isActive === false}
                        title={
                          isAvailable
                            ? `${seat.code}번 좌석 배정하기`
                            : seat.isOccupied
                            ? `${seat.code}번 좌석 빈자리 알림받기`
                            : `${seat.code}번 미운영 좌석`
                        }
                        onClick={() => {
                          if (isAvailable) {
                            handleAssignSeat(seat);
                          } else if (seat.isOccupied) {
                            handleRegisterSpecificSeatSniper(seat);
                          }
                        }}
                      >
                        <span>{seat.code}</span>
                      </SeatButton>
                    );
                  })}
                </SeatGridContainer>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ================= 모달 2: 스터디룸 타임라인 & 예약 모달 ================= */}
      {selectedStudyRoom && (
        <ModalOverlay onClick={() => setSelectedStudyRoom(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>{selectedStudyRoom.name} 예약</ModalTitle>
                <RoomInfoBadgesRow>
                  <RoomInfoBadgeItem>
                    <MapPin size={12} />
                    <span>
                      {studyRoomDetail?.building?.name || "중앙관"}{" "}
                      {studyRoomDetail?.floor?.name || selectedStudyRoom.location}
                    </span>
                  </RoomInfoBadgeItem>
                  <RoomInfoBadgeItem>
                    <Users size={12} />
                    <span>
                      수용 {studyRoomDetail?.minQuota || selectedStudyRoom.minQuota || 1} ~{" "}
                      {studyRoomDetail?.maxQuota || selectedStudyRoom.maxQuota || 10}명
                    </span>
                  </RoomInfoBadgeItem>
                  <RoomInfoBadgeItem>
                    <Clock size={12} />
                    <span>
                      {studyRoomDetail?.rule?.minTime || 30} ~{" "}
                      {studyRoomDetail?.rule?.maxTime || 240}분
                    </span>
                  </RoomInfoBadgeItem>
                </RoomInfoBadgesRow>
              </div>
              <CloseBtn onClick={() => setSelectedStudyRoom(null)}>
                <X size={20} />
              </CloseBtn>
            </ModalHeader>

            {/* 안내 및 주의사항 카드 */}
            {(studyRoomDetail?.description || studyRoomDetail?.attention) && (
              <NoticeCard>
                <NoticeHeader onClick={() => setShowAttention((prev) => !prev)}>
                  <NoticeTitle>
                    <Info size={15} color="#2563eb" />
                    <span>공간 설명 및 이용 주의사항</span>
                  </NoticeTitle>
                  <NoticeToggleBtn type="button">
                    {showAttention ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </NoticeToggleBtn>
                </NoticeHeader>
                {showAttention && (
                  <NoticeBody>
                    {studyRoomDetail.description && (
                      <NoticeSection>
                        <NoticeSubTitle>📌 공간 설명</NoticeSubTitle>
                        <NoticeText>{studyRoomDetail.description}</NoticeText>
                      </NoticeSection>
                    )}
                    {studyRoomDetail.attention && (
                      <NoticeSection>
                        <NoticeSubTitle>⚠️ 이용 주의사항 (필독)</NoticeSubTitle>
                        <NoticeText>{studyRoomDetail.attention}</NoticeText>
                      </NoticeSection>
                    )}
                  </NoticeBody>
                )}
              </NoticeCard>
            )}

            {/* 날짜 선택 */}
            <DateSelectorRow>
              {dateOptions.map((opt) => (
                <DateBtn
                  key={opt.value}
                  $active={selectedDate === opt.value}
                  onClick={() => handleDateChange(opt.value)}
                >
                  {opt.label}
                </DateBtn>
              ))}
            </DateSelectorRow>

            {/* 10분 단위 타임라인 시각화 */}
            <TimelineSection>
              <TimelineHeader>
                <span>시간대별 점유 현황 (10분 단위)</span>
                <LegendRow>
                  <LegendItem>
                    <LegendDot $type="avail" /> 가능
                  </LegendItem>
                  <LegendItem>
                    <LegendDot $type="occ" /> 점유됨
                  </LegendItem>
                  <LegendItem>
                    <LegendDot $type="past" /> 만료
                  </LegendItem>
                </LegendRow>
              </TimelineHeader>

              {isLoadingTimeline ? (
                <ModalLoading>
                  <RefreshCw size={20} className="spin" />
                  <span>타임라인 로딩 중...</span>
                </ModalLoading>
              ) : studyRoomDetail?.timeLine ? (
                <TimelineGrid>
                  {studyRoomDetail.timeLine.map((slot) => (
                    <HourSlot key={slot.hour}>
                      <HourLabel>{slot.hour}시</HourLabel>
                      <MinuteBars>
                        {slot.minutes.map((m, mIdx) => {
                          const isPast = m.class === "disabled";
                          const isOcc = m.class === "occupied";
                          const timeStr = `${slot.hour < 10 ? `0${slot.hour}` : slot.hour}:${
                            mIdx * 10 === 0 ? "00" : mIdx * 10
                          }`;
                          return (
                            <MinuteBar
                              key={mIdx}
                              $type={isPast ? "past" : isOcc ? "occ" : "avail"}
                              title={`${timeStr} ${isPast ? "(만료)" : isOcc ? "(점유됨)" : "(선택 가능)"}`}
                              style={{ cursor: !isPast && !isOcc ? "pointer" : "default" }}
                              onClick={() => {
                                if (!isPast && !isOcc) {
                                  handleBeginTimeChange(timeStr);
                                }
                              }}
                            />
                          );
                        })}
                      </MinuteBars>
                    </HourSlot>
                  ))}
                </TimelineGrid>
              ) : (
                <EmptyBox>해당 일자의 타임라인 정보를 불러올 수 없습니다.</EmptyBox>
              )}
            </TimelineSection>

            {/* 예약 입력 폼 */}
            <BookingForm>
              {/* 시작 시간 & 종료 시간 (10분 단위) */}
              <TimeRangeRow>
                <TimeSelectBox>
                  <FormLabel>시작 시간 (10분 단위)</FormLabel>
                  <FormSelect
                    value={reserveBeginTime}
                    onChange={(e) => handleBeginTimeChange(e.target.value)}
                  >
                    {timeOptions10Min.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </FormSelect>
                </TimeSelectBox>
                <TimeSelectBox>
                  <FormLabel>
                    종료 시간
                    <DurationSummaryText>
                      ({parseTimeToMinutes(reserveEndTime) - parseTimeToMinutes(reserveBeginTime)}분)
                    </DurationSummaryText>
                  </FormLabel>
                  <FormSelect
                    value={reserveEndTime}
                    onChange={(e) => {
                      setReserveEndTime(e.target.value);
                      const diff = parseTimeToMinutes(e.target.value) - parseTimeToMinutes(reserveBeginTime);
                      setReserveDurationHours(Math.max(1, Math.round(diff / 60)));
                    }}
                  >
                    {timeOptions10Min
                      .filter((t) => parseTimeToMinutes(t) > parseTimeToMinutes(reserveBeginTime))
                      .map((t) => {
                        const diffMin = parseTimeToMinutes(t) - parseTimeToMinutes(reserveBeginTime);
                        return (
                          <option key={t} value={t}>
                            {t} ({diffMin}분)
                          </option>
                        );
                      })}
                  </FormSelect>
                </TimeSelectBox>
              </TimeRangeRow>

              {/* 빠른 이용 시간 선택 */}
              <FormGroup>
                <FormLabel>이용 시간 빠른 선택</FormLabel>
                <DurationBtnGroup>
                  {[30, 60, 120, 180, 240].map((mins) => {
                    const minAllowed = studyRoomDetail?.rule?.minTime || 30;
                    const maxAllowed = studyRoomDetail?.rule?.maxTime || 240;
                    if (mins < minAllowed || mins > maxAllowed) return null;
                    const currentDuration =
                      parseTimeToMinutes(reserveEndTime) - parseTimeToMinutes(reserveBeginTime);
                    return (
                      <DurationBtn
                        key={mins}
                        $active={currentDuration === mins}
                        onClick={() => handleSelectDuration(mins)}
                      >
                        {mins < 60 ? `${mins}분` : `${mins / 60}시간`}
                      </DurationBtn>
                    );
                  })}
                </DurationBtnGroup>
              </FormGroup>

              {/* 사용 목적 (용도 - 필수) */}
              <FormGroup>
                <FormLabel>
                  사용 용도 <span style={{ color: "#ef4444" }}>*필수</span>
                </FormLabel>
                <FormInput
                  type="text"
                  value={reservePurpose}
                  onChange={(e) => setReservePurpose(e.target.value)}
                  placeholder="예: 조별 과제 및 토의"
                />
              </FormGroup>

              {/* 동반 이용자 등록 섹션 (필수) */}
              {(() => {
                const minQuota = studyRoomDetail?.minQuota || selectedStudyRoom.minQuota || 1;
                const maxQuota = studyRoomDetail?.maxQuota || selectedStudyRoom.maxQuota || 10;
                const minCompanions = Math.max(0, minQuota - 1);
                const maxCompanions = Math.max(0, maxQuota - 1);
                const isSatisfied = companions.length >= minCompanions;

                return (
                  <CompanionSection>
                    <CompanionHeader>
                      <div>
                        <CompanionTitle>동반 이용자 등록</CompanionTitle>
                        {minCompanions > 0 && (
                          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>
                            (본인 포함 {minQuota}~{maxQuota}인실)
                          </span>
                        )}
                      </div>
                      <CompanionQuotaBadge $isSatisfied={isSatisfied}>
                        {minCompanions > 0
                          ? `동반자 ${companions.length}/${minCompanions}명 (최대 ${maxCompanions}명) ${
                              isSatisfied ? "충족" : "필요"
                            }`
                          : `동반자 ${companions.length}/${maxCompanions}명`}
                      </CompanionQuotaBadge>
                    </CompanionHeader>

                    {minCompanions > 0 && !isSatisfied && (
                      <span style={{ fontSize: "11.5px", color: "#ef4444" }}>
                        ※ 본인을 제외하고 동반 이용자를 최소 {minCompanions}명 이상 등록해야 예약이 가능합니다.
                      </span>
                    )}

                    <CompanionInputRow>
                      <CompanionInput
                        type="text"
                        placeholder="이름 (예: 홍길동)"
                        value={companionName}
                        onChange={(e) => setCompanionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCompanion();
                          }
                        }}
                      />
                      <CompanionInput
                        type="text"
                        placeholder="학번 (예: 202301234)"
                        value={companionMemberNo}
                        onChange={(e) => setCompanionMemberNo(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCompanion();
                          }
                        }}
                      />
                      <CompanionAddBtn
                        type="button"
                        disabled={isSearchingCompanion || !companionName.trim() || !companionMemberNo.trim()}
                        onClick={handleAddCompanion}
                      >
                        {isSearchingCompanion ? (
                          <RefreshCw size={14} className="spin" />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        <span>추가</span>
                      </CompanionAddBtn>
                    </CompanionInputRow>

                    {companions.length > 0 && (
                      <CompanionChipList>
                        {companions.map((c) => (
                          <CompanionChip key={c.id}>
                            <span>
                              {c.name} ({c.memberNo})
                            </span>
                            <CompanionChipDeleteBtn
                              type="button"
                              onClick={() => handleRemoveCompanion(c.id)}
                              title="삭제"
                            >
                              <X size={14} />
                            </CompanionChipDeleteBtn>
                          </CompanionChip>
                        ))}
                      </CompanionChipList>
                    )}
                  </CompanionSection>
                );
              })()}

              {/* 동반이용자 개인정보 수집 및 이용 동의 (필수) */}
              <PrivacyAgreeContainer>
                <PrivacyAgreeLabel>
                  <PrivacyCheckbox
                    type="checkbox"
                    checked={isPrivacyAgreed}
                    onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                  />
                  <span>
                    동반이용자 개인정보 수집 및 이용 동의 <span style={{ color: "#ef4444" }}>*필수</span>
                  </span>
                </PrivacyAgreeLabel>
                <PrivacyNoticeText>
                  스터디룸 이용 및 입실 확인, 이용 내역 관리를 위해 동반이용자의 이름 및 학번 정보를 수집·이용하는 것에 동의합니다.
                </PrivacyNoticeText>
              </PrivacyAgreeContainer>

              {/* 요청사항 (선택) */}
              <FormGroup>
                <FormLabel>기타 요청사항 (선택)</FormLabel>
                <FormInput
                  type="text"
                  value={reserveNotes}
                  onChange={(e) => setReserveNotes(e.target.value)}
                  placeholder="예: 마이크 사용 희망 등"
                />
              </FormGroup>

              <ModalActionBtnGroup>
                <SubmitBtn disabled={isSubmittingBooking} onClick={handleSubmitStudyBooking}>
                  {isSubmittingBooking ? "예약 처리 중..." : "위 조건으로 즉시 예약"}
                </SubmitBtn>
                <StudySniperSlotBtn type="button" onClick={handleRegisterStudySlotSniper}>
                  <Crosshair size={14} />
                  <span>이 시간대 취소표 알림받기</span>
                </StudySniperSlotBtn>
              </ModalActionBtnGroup>
            </BookingForm>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 도서관 계정 연동 모달 */}
      <LibraryAccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          showToast("🎉 학산도서관 계정이 성공적으로 연동되었습니다!");
          loadData();
        }}
      />
    </Container>
  );
}

// ================= STYLES =================
const Container = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER}px 80px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8fafc;
`;

const TabBar = styled.div`
  display: flex;
  background: #ffffff;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
`;

const TabItem = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? "#2563eb" : "#64748b")};
  background: ${({ $active }) => ($active ? "#eff6ff" : "transparent")};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  position: relative;
`;

const BadgeDot = styled.span`
  position: absolute;
  top: 6px;
  right: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
`;

const AuthBannerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  cursor: pointer;
`;

const BannerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  cursor: pointer;
`;

const BannerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  strong {
    font-size: 14px;
    color: #1e40af;
  }
  span {
    font-size: 12px;
    color: #3b82f6;
  }
`;

const ToastMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #166534;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 14px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const SubTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin: 0 0 8px 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
`;

const NoticeBanner = styled.div`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
`;

const RoomGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RoomCard = styled.div<{ $isFull: boolean }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${({ $isFull }) => ($isFull ? "#fecaca" : "#e2e8f0")};
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const RoomName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

const SeatBadge = styled.span<{ $isFull: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: ${({ $isFull }) => ($isFull ? "#fee2e2" : "#dbeafe")};
  color: ${({ $isFull }) => ($isFull ? "#b91c1c" : "#1d4ed8")};
`;

const ProgressBarContainer = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressBarFill = styled.div<{ $rate: number; $isFull: boolean }>`
  height: 100%;
  width: ${({ $rate }) => `${Math.min(100, $rate)}%`};
  background: ${({ $isFull }) => ($isFull ? "#ef4444" : "#3b82f6")};
  transition: width 0.3s ease;
`;

const SeatStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const PrimaryActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #2563eb;
  color: #ffffff;
  border: none;
  cursor: pointer;
`;

const SniperActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #f8fafc;
  color: #dc2626;
  border: 1px solid #fca5a5;
  cursor: pointer;
`;

const StudyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StudyCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const StudyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const StudyName = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const StudyLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
`;

const QuotaBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #334155;
  padding: 3px 8px;
  border-radius: 6px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const TagChip = styled.span`
  font-size: 11px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ActiveSeatCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1.5px solid #3b82f6;
`;

const ActiveSeatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const ActiveBadge = styled.span<{ $isTemp?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  background: ${({ $isTemp }) => ($isTemp ? "#fef3c7" : "#2563eb")};
  color: ${({ $isTemp }) => ($isTemp ? "#b45309" : "#ffffff")};
  border: 1px solid ${({ $isTemp }) => ($isTemp ? "#fde68a" : "#2563eb")};
  padding: 2px 6px;
  border-radius: 4px;
`;

const TempNoticeBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  line-height: 1.45;
  margin-bottom: 14px;
`;

const ExpiryBadge = styled.span<{ $urgent?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  background: ${({ $urgent }) => ($urgent ? "#fee2e2" : "#fef3c7")};
  color: ${({ $urgent }) => ($urgent ? "#dc2626" : "#b45309")};
  border: 1px solid ${({ $urgent }) => ($urgent ? "#fca5a5" : "#fde68a")};
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
`;

const NoticeBulletList = styled.ul`
  margin: 4px 0 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #a16207;
`;

const SeatRoomTitle = styled.span`
  font-size: 15px;
  color: #0f172a;
`;

const SeatTimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #334155;
  margin-bottom: 14px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ $danger }) => ($danger ? "#fee2e2" : "#f1f5f9")};
  color: ${({ $danger }) => ($danger ? "#b91c1c" : "#334155")};
  border: 1px solid ${({ $danger }) => ($danger ? "#fca5a5" : "#cbd5e1")};
  cursor: pointer;
`;

const ReminderRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  padding: 8px 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReservationCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
`;

const ReservationTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  strong {
    font-size: 14px;
    color: #0f172a;
  }
`;

const ReservationStatus = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ReservationTime = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
`;

const ReservationNote = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-bottom: 8px;
`;

const ReservationActionRow = styled.div`
  display: flex;
  gap: 6px;
`;

const SmallActionBtn = styled.button<{ $danger?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $danger }) => ($danger ? "#fee2e2" : "#f1f5f9")};
  color: ${({ $danger }) => ($danger ? "#b91c1c" : "#334155")};
  border: 1px solid ${({ $danger }) => ($danger ? "#fca5a5" : "#e2e8f0")};
  cursor: pointer;
`;

const EmptyBox = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  border: 1px dashed #cbd5e1;
`;

const SkeletonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// ================= MODAL STYLES =================
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px 16px 36px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
`;

const ModalLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #64748b;
  font-size: 13px;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const SeatLegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 8px;
`;

const SeatLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #475569;
`;

const SeatLegendBox = styled.span<{ $color: string; $border: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
`;

const SeatGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 6px 0 16px;
  max-height: 50vh;
  overflow-y: auto;
`;

const SeatButton = styled.button<{
  $isOccupied: boolean;
  $isReservable: boolean;
  $isDisabled?: boolean;
}>`
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid
    ${({ $isOccupied, $isReservable }) =>
      $isOccupied ? "#fca5a5" : $isReservable ? "#93c5fd" : "#e2e8f0"};
  background: ${({ $isOccupied, $isReservable }) =>
    $isOccupied ? "#fef2f2" : $isReservable ? "#eff6ff" : "#f8fafc"};
  color: ${({ $isOccupied, $isReservable }) =>
    $isOccupied ? "#dc2626" : $isReservable ? "#1d4ed8" : "#94a3b8"};
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  transition: all 0.15s ease;

  &:hover {
    ${({ $isReservable, $isOccupied }) =>
      $isReservable
        ? "background: #dbeafe; border-color: #60a5fa;"
        : $isOccupied
        ? "background: #fee2e2; border-color: #f87171;"
        : ""}
  }

  &:active {
    ${({ $isDisabled }) => (!$isDisabled ? "transform: scale(0.93);" : "")}
  }
`;

const DateSelectorRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;

const DateBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $active }) => ($active ? "#2563eb" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  border: 1px solid ${({ $active }) => ($active ? "#2563eb" : "#e2e8f0")};
  cursor: pointer;
`;

const TimelineSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
`;

const LegendRow = styled.div`
  display: flex;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #64748b;
`;

const LegendDot = styled.span<{ $type: "avail" | "occ" | "past" }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $type }) =>
    $type === "avail" ? "#60a5fa" : $type === "occ" ? "#475569" : "#cbd5e1"};
`;

const TimelineGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
`;

const HourSlot = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HourLabel = styled.span`
  width: 34px;
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
`;

const MinuteBars = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
  height: 16px;
`;

const MinuteBar = styled.div<{ $type: "avail" | "occ" | "past" }>`
  border-radius: 3px;
  background: ${({ $type }) =>
    $type === "avail" ? "#93c5fd" : $type === "occ" ? "#475569" : "#e2e8f0"};
`;

const BookingForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #334155;
`;

const FormSelect = styled.select`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  background: #ffffff;
`;

const DurationBtnGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const DurationBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $active }) => ($active ? "#2563eb" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  border: 1px solid ${({ $active }) => ($active ? "#2563eb" : "#e2e8f0")};
  cursor: pointer;
`;

const FormInput = styled.input`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
`;

const ModalActionBtnGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px 0;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const StudySniperSlotBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 0;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #dbeafe;
  }
  &:active {
    transform: scale(0.98);
  }
`;

const FavSection = styled.div`
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FavTitle = styled.h3`
  font-size: 13.5px;
  font-weight: 700;
  color: #854d0e;
  margin: 0;
`;

const FavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
`;

const FavCard = styled.div`
  background: #ffffff;
  border: 1px solid #fde047;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const FavCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FavName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
`;

const FavBadge = styled.span<{ $isAvail: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ $isAvail }) => ($isAvail ? "#dcfce7" : "#f1f5f9")};
  color: ${({ $isAvail }) => ($isAvail ? "#16a34a" : "#64748b")};
`;

const FavBtnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FavActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1d4ed8;
  }
`;

const FavDeleteBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #94a3b8;
  border: none;
  cursor: pointer;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
`;

const RoomInfoBadgesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`;

const RoomInfoBadgeItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
`;

const NoticeCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f1f5f9;
  cursor: pointer;
  user-select: none;
`;

const NoticeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
`;

const NoticeToggleBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const NoticeBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
  max-height: 200px;
  overflow-y: auto;
`;

const NoticeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeSubTitle = styled.div`
  font-weight: 700;
  color: #1e293b;
  font-size: 12px;
`;

const NoticeText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 11.5px;
  color: #334155;
`;

const TimeRangeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const TimeSelectBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DurationSummaryText = styled.span`
  font-size: 11.5px;
  color: #2563eb;
  font-weight: 600;
  margin-left: 6px;
`;

const CompanionSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CompanionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CompanionTitle = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
`;

const CompanionQuotaBadge = styled.span<{ $isSatisfied: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${({ $isSatisfied }) => ($isSatisfied ? "#dcfce7" : "#fee2e2")};
  color: ${({ $isSatisfied }) => ($isSatisfied ? "#16a34a" : "#dc2626")};
`;

const CompanionInputRow = styled.div`
  display: flex;
  gap: 6px;
`;

const CompanionInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 12.5px;
  background: #ffffff;

  &::placeholder {
    color: #94a3b8;
  }
`;

const CompanionAddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 12px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const CompanionChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CompanionChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 5px 8px 5px 10px;
  font-size: 12px;
  color: #1e293b;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

const CompanionChipDeleteBtn = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: #ef4444;
  }
`;

const PrivacyAgreeContainer = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PrivacyAgreeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #1e3a8a;
  cursor: pointer;
`;

const PrivacyCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
`;

const PrivacyNoticeText = styled.span`
  font-size: 11px;
  color: #3b82f6;
  line-height: 1.4;
  padding-left: 24px;
`;


