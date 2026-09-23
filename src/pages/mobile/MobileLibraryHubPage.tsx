import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  startLibrarySeatSessionBridge,
  cancelLibrarySeatSessionBridge,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import Skeleton from "@/components/common/Skeleton";
import Box from "@/components/common/Box";
import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/common/Modal";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Bell,
  RefreshCw,
  CheckCircle,
  RotateCw,
  LogOut,
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
  Check,
  Smartphone,
} from "lucide-react";
import PortalLinkBanner from "@/components/common/PortalLinkBanner";
import { openIntipAppOrStore } from "@/utils/appLauncher";

/**
 * 한국 표준시(KST, UTC+9) 기준 YYYY-MM-DD 문자열을 반환합니다.
 */
function getKstDateString(offsetDays: number = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split("T")[0];
  }
}

export interface Study2HourOccupancyInfo {
  isCurrentOccupied: boolean;
  currentOccupiedUntil: string | null;
  availableMinutesFromNow: number;
  summaryText: string;
  badgeLabel: string;
  badgeType: "avail" | "warning" | "occupied" | "closed";
  previewSlots: Array<{
    timeStr: string;
    type: "avail" | "occ" | "past";
    label: string;
  }>;
}

export function computeStudyRoom2HourStatus(detail: StudyRoomDetail | undefined): Study2HourOccupancyInfo {
  const now = new Date();
  const kstHours = (now.getUTCHours() + 9) % 24;
  const kstMinutes = now.getUTCMinutes();
  const currentSlotIndex = Math.floor(kstMinutes / 10);
  const currentTotalMin = kstHours * 60 + currentSlotIndex * 10;

  if (kstHours < 9 || kstHours >= 22) {
    return {
      isCurrentOccupied: false,
      currentOccupiedUntil: null,
      availableMinutesFromNow: 0,
      summaryText: "운영 시간 외 (09:00 ~ 22:00)",
      badgeLabel: "운영 종료",
      badgeType: "closed",
      previewSlots: [],
    };
  }

  if (!detail || !detail.timeLine || detail.timeLine.length === 0) {
    const defaultSlots: Array<{ timeStr: string; type: "avail" | "occ" | "past"; label: string }> = [];
    for (let i = 0; i < 12; i++) {
      const slotMin = currentTotalMin + i * 10;
      const h = Math.floor(slotMin / 60);
      const m = slotMin % 60;
      const timeStr = `${h < 10 ? `0${h}` : h}:${m === 0 ? "00" : m}`;
      if (h >= 22) {
        defaultSlots.push({ timeStr, type: "past", label: `${timeStr} (마감)` });
      } else {
        defaultSlots.push({ timeStr, type: "avail", label: `${timeStr} (이용 가능)` });
      }
    }
    return {
      isCurrentOccupied: false,
      currentOccupiedUntil: null,
      availableMinutesFromNow: 120,
      summaryText: "",
      badgeLabel: "예약 가능",
      badgeType: "avail",
      previewSlots: defaultSlots,
    };
  }

  const slotMap = new Map<number, { isOcc: boolean; isPast: boolean }>();
  detail.timeLine.forEach((slot) => {
    slot.minutes.forEach((m, mIdx) => {
      const minKey = slot.hour * 60 + mIdx * 10;
      slotMap.set(minKey, {
        isOcc: m.class === "occupied",
        isPast: m.class === "disabled",
      });
    });
  });

  const previewSlots: Array<{ timeStr: string; type: "avail" | "occ" | "past"; label: string }> = [];
  let availableConsecutiveMin = 0;
  let isCountingConsecutive = true;
  let isCurrentOccupied = false;
  let occupiedUntilMin: number | null = null;

  for (let i = 0; i < 12; i++) {
    const slotMin = currentTotalMin + i * 10;
    const h = Math.floor(slotMin / 60);
    const m = slotMin % 60;
    const timeStr = `${h < 10 ? `0${h}` : h}:${m === 0 ? "00" : m}`;

    if (h >= 22) {
      previewSlots.push({ timeStr, type: "past", label: `${timeStr} (마감)` });
      isCountingConsecutive = false;
      continue;
    }

    const slotData = slotMap.get(slotMin);
    const isOcc = slotData ? slotData.isOcc : false;
    const isPast = slotData ? slotData.isPast : false;

    if (i === 0) {
      isCurrentOccupied = isOcc;
    }

    if (isCurrentOccupied && isOcc && occupiedUntilMin === null) {
      // continues
    } else if (isCurrentOccupied && !isOcc && occupiedUntilMin === null) {
      occupiedUntilMin = slotMin;
    }

    if (!isOcc && !isPast && isCountingConsecutive) {
      availableConsecutiveMin += 10;
    } else {
      isCountingConsecutive = false;
    }

    previewSlots.push({
      timeStr,
      type: isPast ? "past" : isOcc ? "occ" : "avail",
      label: `${timeStr} ${isPast ? "(마감)" : isOcc ? "(점유됨)" : "(이용 가능)"}`,
    });
  }

  let currentOccupiedUntilStr: string | null = null;
  if (occupiedUntilMin !== null) {
    const oh = Math.floor(occupiedUntilMin / 60);
    const om = occupiedUntilMin % 60;
    currentOccupiedUntilStr = `${oh < 10 ? `0${oh}` : oh}:${om === 0 ? "00" : om}`;
  }

  let summaryText = "";
  let badgeLabel = "";
  let badgeType: "avail" | "warning" | "occupied" | "closed" = "avail";

  if (isCurrentOccupied) {
    badgeType = "occupied";
    badgeLabel = "이용 중";
    summaryText = "";
  } else if (availableConsecutiveMin > 0) {
    badgeType = "avail";
    badgeLabel = "예약 가능";
    summaryText = "";
  } else {
    badgeType = "occupied";
    badgeLabel = "점유됨";
    summaryText = "";
  }

  return {
    isCurrentOccupied,
    currentOccupiedUntil: currentOccupiedUntilStr,
    availableMinutesFromNow: availableConsecutiveMin,
    summaryText,
    badgeLabel,
    badgeType,
    previewSlots,
  };
}

export default function MobileLibraryHubPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"seats" | "study" | "my">(() => {
    if (urlTab === "study") return "study";
    if (urlTab === "my") return "my";
    return "seats";
  });
  const [rooms, setRooms] = useState<LibrarySeatRoom[]>([]);
  const [studyRooms, setStudyRooms] = useState<LibraryStudyRoom[]>([]);
  const [studyDetailsMap, setStudyDetailsMap] = useState<Record<number, StudyRoomDetail>>({});
  const [mySeat, setMySeat] = useState<CurrentSeatInfo | null>(null);
  const [myStudyReservations, setMyStudyReservations] = useState<StudyRoomReservation[]>([]);
  const [favoriteSeats, setFavoriteSeats] = useState<LibrarySeat[]>([]);

  // 검색 및 필터 상태
  const [seatSearchQuery, setSeatSearchQuery] = useState<string>("");
  const [seatFilter, setSeatFilter] = useState<"all" | "available" | "laptop">("all");
  const [studySearchQuery, setStudySearchQuery] = useState<string>("");
  const [studyFilter, setStudyFilter] = useState<"all" | "available" | "small" | "large">("all");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMy, setIsLoadingMy] = useState<boolean>(false);
  const [isLinked, setIsLinked] = useState<boolean | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 안내/알림 공용 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  // 열람실 좌석 선택 바텀시트 상태
  const [selectedSeatRoom, setSelectedSeatRoom] = useState<LibrarySeatRoom | null>(null);
  const [roomSeats, setRoomSeats] = useState<LibrarySeat[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(false);

  // 스터디룸 예약 바텀시트 상태
  const [selectedStudyRoom, setSelectedStudyRoom] = useState<LibraryStudyRoom | null>(null);
  const [studyRoomDetail, setStudyRoomDetail] = useState<StudyRoomDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => getKstDateString(0));
  const [reserveBeginTime, setReserveBeginTime] = useState<string>("09:00");
  const [reserveEndTime, setReserveEndTime] = useState<string>("11:00");
  const [, setReserveDurationHours] = useState<number>(2);
  const [reservePurpose, setReservePurpose] = useState<string>("");
  const [reserveNotes, setReserveNotes] = useState<string>("");
  const [companionName, setCompanionName] = useState<string>("");
  const [companionMemberNo, setCompanionMemberNo] = useState<string>("");
  const [companions, setCompanions] = useState<CompanionPatron[]>([]);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState<boolean>(false);
  const [isSearchingCompanion, setIsSearchingCompanion] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(false);
  const [showAttention, setShowAttention] = useState<boolean>(false);

  // 임시 배정 타이머
  const [remainingCheckinSec, setRemainingCheckinSec] = useState<number | null>(null);

  // 확인 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useHeader({
    title: "학산도서관",
    subHeader: null,
    hasback: true,
  });

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const showAlert = (title: string, description: string) => {
    setAlertModal({ isOpen: true, title, description });
  };

  // 10분 단위 시간 생성 헬퍼
  const timeOptions10Min = Array.from({ length: 14 * 6 + 1 }, (_, i) => {
    const totalMinutes = 9 * 60 + i * 10;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 22 || (h === 22 && m > 0)) return null;
    return `${h < 10 ? `0${h}` : h}:${m === 0 ? "00" : m}`;
  }).filter(Boolean) as string[];

  const parseTimeToMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rRooms, sRooms] = await Promise.all([
        getReadingRooms().catch(() => []),
        getStudyRooms().catch(() => []),
      ]);
      setRooms(rRooms);
      setStudyRooms(sRooms);

      if (sRooms.length > 0) {
        const today = getKstDateString(0);
        void Promise.all(
          sRooms.map(async (sr) => {
            const res = await getStudyRoomDetail(sr.id, today).catch(() => null);
            if (res && res.success && res.detail) {
              setStudyDetailsMap((prev) => ({ ...prev, [sr.id]: res.detail! }));
            }
          })
        );
      }

      await loadMyData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyData = async () => {
    setIsLoadingMy(true);
    try {
      const linkRes = await checkLibraryAccountLinked().catch(() => ({ linked: false }));
      setIsLinked(linkRes.linked);

      if (linkRes.linked) {
        const [curSeat, curStudy, favSeats] = await Promise.all([
          getMyCurrentSeat().catch(() => null),
          getMyStudyRoomReservations().catch(() => []),
          getFavoriteSeats().catch(() => []),
        ]);
        setMySeat(curSeat);
        setMyStudyReservations(curStudy);
        setFavoriteSeats(favSeats);

        if (curSeat) {
          startLibrarySeatSessionBridge({
            seatNo: curSeat.seatName,
            roomName: curSeat.roomName,
            endTime: curSeat.endTime,
            seatId: curSeat.seatId,
            roomId: curSeat.roomId,
          }).catch(() => {});
        } else {
          cancelLibrarySeatSessionBridge().catch(() => {});
        }
      }
    } finally {
      setIsLoadingMy(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleOpenModal = () => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
    window.addEventListener("openLibraryAccountModal", handleOpenModal);
    return () => {
      window.removeEventListener("openLibraryAccountModal", handleOpenModal);
    };
  }, [navigate]);

  // 임시 배정 남은 시간 카운트다운
  useEffect(() => {
    if (!mySeat?.isTempCharge || !mySeat.beginTime) {
      setRemainingCheckinSec(null);
      return;
    }

    const calcRemaining = () => {
      try {
        const beginDate = new Date(mySeat.beginTime.replace(" ", "T"));
        const deadlineDate = new Date(beginDate.getTime() + 20 * 60 * 1000);
        const now = new Date();
        const diffSec = Math.max(0, Math.floor((deadlineDate.getTime() - now.getTime()) / 1000));
        setRemainingCheckinSec(diffSec);
      } catch {
        setRemainingCheckinSec(null);
      }
    };

    calcRemaining();
    const interval = setInterval(calcRemaining, 1000);
    return () => clearInterval(interval);
  }, [mySeat]);

  // 좌석 배치도 열기
  const handleOpenSeatPicker = async (room: LibrarySeatRoom) => {
    setIsLoadingSeats(true);
    try {
      const res = await getRoomSeats(room.id);
      if (res.success && res.seats.length > 0) {
        setRoomSeats(res.seats);
        setSelectedSeatRoom(room);
      } else if (res.errorCode === "NOT_IN_APP") {
        showAlert(
          "모바일 앱 전용 기능",
          "좌석 배정 및 배치도 확인은 INTIP 모바일 앱 환경에서 이용하실 수 있습니다."
        );
      } else {
        showAlert(
          "좌석 조회 안내",
          res.errorMessage || "좌석 목록을 불러오지 못했습니다. 계정 연동 상태를 확인해 주세요."
        );
      }
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("연동") || e?.message?.includes("401") || e?.message?.includes("인증")) {
        window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
      } else {
        showAlert("좌석 조회 오류", "좌석 목록을 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // 좌석 즉시 배정
  const handleAssignSeat = async (seat: LibrarySeat) => {
    setConfirmModal({
      isOpen: true,
      title: "좌석 배정",
      description: `'${seat.name || seat.code}' 좌석을 배정하시겠습니까?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await reserveSeat(seat.id);
          if (res.success) {
            showToast(`'${seat.name || seat.code}' 좌석이 배정되었습니다.`);
            setSelectedSeatRoom(null);
            await loadMyData();
            setActiveTab("my");
          } else {
            showAlert("좌석 배정 실패", res.message || "좌석 배정에 실패했습니다.");
          }
        } catch (e: any) {
          console.error(e);
          if (e?.message?.includes("연동") || e?.message?.includes("401") || e?.message?.includes("인증")) {
            window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
          } else {
            showAlert("좌석 배정 오류", e?.message || "좌석 배정 중 오류가 발생했습니다.");
          }
        }
      },
    });
  };

  // 특정 좌석 빈자리 알림 등록
  const handleRegisterSpecificSeatSniper = async (seat: LibrarySeat) => {
    try {
      await registerLocalWatchJobInApp({
        watchType: "SPECIFIC_SEAT_SNIPER",
        seatId: seat.id,
        seatName: seat.name || `${seat.code}번 좌석`,
        durationMinutes: 120,
      });
      showToast(`'${seat.name || seat.code}' 빈자리 알림이 등록되었습니다.`);
    } catch (e) {
      console.error(e);
      showAlert("알림 등록 실패", "빈자리 알림 등록에 실패했습니다.");
    }
  };

  // 열람실 전체 빈자리 알림 등록
  const handleRegisterSeatSniper = async (room: LibrarySeatRoom) => {
    try {
      await postRegisterCampusWatch({
        domain: "LIBRARY_SEAT",
        targetId: String(room.id),
        targetName: room.name,
      });
      showToast(`'${room.name}' 빈자리 알림이 등록되었습니다.`);
    } catch (e) {
      console.error(e);
      showAlert("알림 등록 실패", "알림 등록에 실패했습니다.");
    }
  };

  // 선호좌석 등록 / 해제
  const handleToggleFavoriteSeat = async () => {
    if (!mySeat) return;
    try {
      if (mySeat.isFavoriteSeat) {
        await unsetFavoriteSeat(mySeat.seatId);
        showToast("선호좌석이 해제되었습니다.");
      } else {
        await setFavoriteSeat(mySeat.seatId);
        showToast("선호좌석으로 등록되었습니다.");
      }
      await loadMyData();
    } catch (e) {
      console.error(e);
      showAlert("선호좌석 오류", "선호좌석 설정 처리에 실패했습니다.");
    }
  };

  const handleRemoveFavoriteSeat = async (seatId: number) => {
    try {
      await unsetFavoriteSeat(seatId);
      showToast("선호좌석이 해제되었습니다.");
      await loadMyData();
    } catch (e) {
      console.error(e);
      showAlert("선호좌석 오류", "선호좌석 해제에 실패했습니다.");
    }
  };

  // 스터디룸 예약 바텀시트 열기
  const handleOpenStudyBooking = async (sRoom: LibraryStudyRoom) => {
    setCompanions([]);
    setCompanionName("");
    setCompanionMemberNo("");
    setIsPrivacyAgreed(false);
    setShowAttention(false);
    const today = getKstDateString(0);
    setSelectedDate(today);

    const now = new Date();
    const curHour = now.getHours();
    const curMin = now.getMinutes();
    const nextSlotMin = Math.ceil(curMin / 10) * 10;
    let startH = curHour;
    let startM = nextSlotMin;
    if (startM >= 60) {
      startH += 1;
      startM = 0;
    }
    if (startH < 9) {
      startH = 9;
      startM = 0;
    } else if (startH >= 20) {
      startH = 20;
      startM = 0;
    }
    const beginStr = `${startH < 10 ? `0${startH}` : startH}:${startM === 0 ? "00" : startM}`;
    const endH = Math.min(22, startH + 2);
    const endStr = `${endH < 10 ? `0${endH}` : endH}:${startM === 0 ? "00" : startM}`;

    setReserveBeginTime(beginStr);
    setReserveEndTime(endStr);
    setReserveDurationHours(2);
    setReservePurpose("");
    setReserveNotes("");

    setIsLoadingTimeline(true);
    try {
      const res = await getStudyRoomDetail(sRoom.id, today);
      if (res.success && res.detail) {
        setStudyRoomDetail(res.detail);
        setStudyDetailsMap((prev) => ({ ...prev, [sRoom.id]: res.detail! }));
        setSelectedStudyRoom(sRoom);
      } else if (res.errorCode === "NOT_IN_APP") {
        showAlert(
          "모바일 앱 전용 기능",
          "스터디룸 상세 시간표 확인 및 예약은 INTIP 모바일 앱 환경에서 이용하실 수 있습니다."
        );
      } else {
        showAlert("스터디룸 조회 안내", res.errorMessage || "스터디룸 정보를 불러오지 못했습니다.");
      }
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("연동") || e?.message?.includes("401") || e?.message?.includes("인증")) {
        window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
      } else {
        showAlert("스터디룸 조회 오류", "스터디룸 상세 정보를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  // 날짜 변경 시 타임라인 갱신
  const handleDateChange = async (dateStr: string) => {
    setSelectedDate(dateStr);
    if (!selectedStudyRoom) return;
    setIsLoadingTimeline(true);
    try {
      const res = await getStudyRoomDetail(selectedStudyRoom.id, dateStr);
      if (res.success && res.detail) {
        setStudyRoomDetail(res.detail);
        setStudyDetailsMap((prev) => ({ ...prev, [selectedStudyRoom.id]: res.detail! }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleBeginTimeChange = (newBegin: string) => {
    setReserveBeginTime(newBegin);
    const beginMin = parseTimeToMinutes(newBegin);
    const minTime = studyRoomDetail?.rule?.minTime || 60;
    const maxTime = studyRoomDetail?.rule?.maxTime || 240;
    const targetEndMin = Math.min(22 * 60, beginMin + Math.min(120, maxTime));

    if (targetEndMin > beginMin && targetEndMin - beginMin >= minTime) {
      const endH = Math.floor(targetEndMin / 60);
      const endM = targetEndMin % 60;
      setReserveEndTime(`${endH < 10 ? `0${endH}` : endH}:${endM === 0 ? "00" : endM}`);
    } else {
      const fallbackEndMin = Math.min(22 * 60, beginMin + minTime);
      const endH = Math.floor(fallbackEndMin / 60);
      const endM = fallbackEndMin % 60;
      setReserveEndTime(`${endH < 10 ? `0${endH}` : endH}:${endM === 0 ? "00" : endM}`);
    }
  };

  const handleSelectDuration = (durationMinutes: number) => {
    const beginMin = parseTimeToMinutes(reserveBeginTime);
    const targetEndMin = Math.min(22 * 60, beginMin + durationMinutes);
    const endH = Math.floor(targetEndMin / 60);
    const endM = targetEndMin % 60;
    setReserveEndTime(`${endH < 10 ? `0${endH}` : endH}:${endM === 0 ? "00" : endM}`);
    setReserveDurationHours(Math.max(1, Math.round(durationMinutes / 60)));
  };

  // 동반이용자 추가
  const handleAddCompanion = async () => {
    if (!selectedStudyRoom) return;
    if (!companionName.trim() || !companionMemberNo.trim()) {
      showAlert("입력 안내", "동반이용자의 이름과 학번을 모두 입력해주세요.");
      return;
    }
    if (companions.some((c) => c.memberNo === companionMemberNo.trim())) {
      showAlert("중복 안내", "이미 등록된 동반이용자입니다.");
      return;
    }

    setIsSearchingCompanion(true);
    try {
      const res = await checkCompanionPatron(
        selectedStudyRoom.id,
        companionName.trim(),
        companionMemberNo.trim(),
        selectedDate
      );
      if (res.success && res.patron) {
        setCompanions((prev) => [...prev, res.patron!]);
        setCompanionName("");
        setCompanionMemberNo("");
      } else {
        showAlert("동반이용자 확인", res.message || "학산도서관 등록 이용자 정보와 일치하지 않습니다. 이름과 학번을 다시 확인해주세요.");
      }
    } catch (e: any) {
      showAlert("동반이용자 조회 오류", e?.message || "동반이용자 조회에 실패했습니다.");
    } finally {
      setIsSearchingCompanion(false);
    }
  };

  const handleRemoveCompanion = (patronId: number) => {
    setCompanions((prev) => prev.filter((c) => c.id !== patronId));
  };

  // 스터디룸 예약 제출
  const handleSubmitStudyBooking = async () => {
    if (!selectedStudyRoom) return;

    const minQuota = studyRoomDetail?.minQuota || selectedStudyRoom.minQuota || 1;
    const maxQuota = studyRoomDetail?.maxQuota || selectedStudyRoom.maxQuota || 10;
    const minCompanions = Math.max(0, minQuota - 1);

    if (companions.length < minCompanions) {
      showAlert("인원 미달", `본인을 제외하고 동반이용자를 최소 ${minCompanions}명 이상 등록해야 합니다.`);
      return;
    }
    if (companions.length + 1 > maxQuota) {
      showAlert("인원 초과", `최대 수용 인원은 ${maxQuota}명입니다.`);
      return;
    }
    if (!isPrivacyAgreed) {
      showAlert("동의 필요", "동반이용자 개인정보 수집 및 이용 동의에 체크해주세요.");
      return;
    }
    if (!reservePurpose.trim()) {
      showAlert("목적 입력 필요", "사용 목적을 입력해주세요.");
      return;
    }

    const durationMin = parseTimeToMinutes(reserveEndTime) - parseTimeToMinutes(reserveBeginTime);
    const minTime = studyRoomDetail?.rule?.minTime || 30;
    const maxTime = studyRoomDetail?.rule?.maxTime || 240;
    if (durationMin < minTime) {
      showAlert("시간 범위 안내", `최소 이용 시간은 ${minTime}분입니다.`);
      return;
    }
    if (durationMin > maxTime) {
      showAlert("시간 범위 안내", `최대 이용 시간은 ${maxTime}분입니다.`);
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const res = await reserveStudyRoom({
        roomId: selectedStudyRoom.id,
        beginTime: `${selectedDate} ${reserveBeginTime}`,
        endTime: `${selectedDate} ${reserveEndTime}`,
        companionCnt: companions.length + 1,
        companionPatrons: companions.map((c) => c.id),
        purpose: reservePurpose.trim(),
        patronMessage: reserveNotes.trim(),
      });

      if (res.success) {
        showToast(`'${selectedStudyRoom.name}' 예약이 완료되었습니다.`);
        setSelectedStudyRoom(null);
        await loadMyData();
        setActiveTab("my");
      } else {
        showAlert("예약 실패", res.message || "스터디룸 예약에 실패했습니다.");
      }
    } catch (e: any) {
      console.error(e);
      showAlert("예약 처리 오류", e?.message || "예약 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // 스터디룸 특정 시간대 취소표 알림 등록
  const handleRegisterStudySlotSniper = async () => {
    if (!selectedStudyRoom) return;
    const targetH = parseInt(reserveBeginTime.split(":")[0], 10);
    try {
      await registerLocalWatchJobInApp({
        watchType: "STUDY_ROOM_SNIPER",
        roomId: selectedStudyRoom.id,
        roomName: selectedStudyRoom.name,
        hopeDate: selectedDate,
        targetHour: targetH,
        durationMinutes: 60,
      });
      showToast(`'${selectedStudyRoom.name}' ${selectedDate} ${reserveBeginTime} 취소표 알림이 등록되었습니다.`);
    } catch (e) {
      console.error(e);
      showAlert("알림 등록 실패", "알림 등록에 실패했습니다.");
    }
  };

  // 내 좌석 연장
  const handleRenewSeat = async () => {
    if (!mySeat) return;
    try {
      const ok = await renewCurrentSeat(mySeat.chargeId);
      if (ok) {
        showToast("좌석 이용 시간이 연장되었습니다.");
        await loadMyData();
      } else {
        showAlert("연장 실패", "좌석 연장에 실패했습니다.");
      }
    } catch (e: any) {
      showAlert("연장 오류", e?.message || "연장 처리 중 오류가 발생했습니다.");
    }
  };

  // 내 좌석 반납/취소
  const handleReturnSeat = async () => {
    if (!mySeat) return;
    const isTemp = mySeat.isTempCharge;
    setConfirmModal({
      isOpen: true,
      title: isTemp ? "예약 취소" : "퇴실 반납",
      description: isTemp ? "좌석 배정 예약을 취소하시겠습니까?" : "좌석을 반납하고 퇴실 처리하시겠습니까?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          if (isTemp) {
            const res = await cancelSeatReservation(mySeat.chargeId);
            if (res.success) {
              showToast("예약이 취소되었습니다.");
            } else {
              showAlert("취소 실패", res.message || "예약 취소에 실패했습니다.");
            }
          } else {
            const res = await returnCurrentSeat(mySeat.chargeId);
            if (res.success) {
              showToast("좌석이 반납되었습니다.");
            } else {
              showAlert("반납 실패", res.message || "좌석 반납에 실패했습니다.");
            }
          }
          await loadMyData();
        } catch (e: any) {
          showAlert("처리 오류", e?.message || "반납/취소 처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  // 임시 배정 확정
  const handleCheckinSeat = async () => {
    if (!mySeat) return;
    try {
      const res = await checkinSeat(mySeat.chargeId, mySeat.roomId);
      if (res.success) {
        showToast("좌석 배정이 확정되었습니다.");
        await loadMyData();
      } else {
        showAlert("배정 확정 실패", res.message || "배정 확정에 실패했습니다.");
      }
    } catch (e: any) {
      showAlert("배정 확정 오류", e?.message || "배정 확정 중 오류가 발생했습니다.");
    }
  };

  // 스터디룸 예약 취소
  const handleCancelStudyReservation = async (bookingId: number, roomName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "예약 취소",
      description: `'${roomName}' 스터디룸 예약을 취소하시겠습니까?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const ok = await cancelStudyRoomReservation(bookingId);
          if (ok) {
            showToast("스터디룸 예약이 취소되었습니다.");
            await loadMyData();
          } else {
            showAlert("취소 실패", "예약 취소에 실패했습니다.");
          }
        } catch (e: any) {
          showAlert("취소 오류", e?.message || "취소 중 오류가 발생했습니다.");
        }
      },
    });
  };

  // 스터디룸 입실 체크인
  const handleCheckinStudyReservation = async (bookingId: number) => {
    try {
      const ok = await checkinStudyRoom(bookingId);
      if (ok) {
        showToast("입실 체크인이 완료되었습니다.");
        await loadMyData();
      } else {
        showAlert("체크인 실패", "입실 체크인에 실패했습니다.");
      }
    } catch (e: any) {
      showAlert("체크인 오류", e?.message || "체크인 중 오류가 발생했습니다.");
    }
  };

  // 좌석 만료 알림 등록
  const handleRegisterSeatReminder = async () => {
    if (!mySeat) return;
    try {
      await registerLocalWatchJobInApp({
        watchType: "SEAT_EXPIRATION",
        seatName: `${mySeat.roomName} ${mySeat.seatName}`,
        endTime: mySeat.endTime,
      });
      showToast("좌석 만료 20분 전 알림이 등록되었습니다.");
    } catch (e) {
      console.error(e);
      showAlert("알림 등록 실패", "알림 등록에 실패했습니다.");
    }
  };

  const dateOptions = [0, 1, 2].map((offset) => {
    const str = getKstDateString(offset);
    const label = offset === 0 ? "오늘" : offset === 1 ? "내일" : "모레";
    return { value: str, label: `${label} (${str.slice(5)})` };
  });

  const filteredRooms = rooms.filter((room) => {
    if (seatSearchQuery.trim()) {
      const q = seatSearchQuery.trim().toLowerCase();
      if (!room.name.toLowerCase().includes(q)) return false;
    }
    if (seatFilter === "available") {
      const available = room.seats?.available ?? room.availableSeats ?? 0;
      if (available <= 0) return false;
    } else if (seatFilter === "laptop") {
      const isLaptop = room.name.includes("노트북");
      if (!isLaptop) return false;
    }
    return true;
  });

  const filteredStudyRooms = studyRooms.filter((s) => {
    if (studySearchQuery.trim()) {
      const q = studySearchQuery.trim().toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchLoc = s.location ? s.location.toLowerCase().includes(q) : false;
      if (!matchName && !matchLoc) return false;
    }
    if (studyFilter === "available") {
      const occInfo = computeStudyRoom2HourStatus(studyDetailsMap[s.id]);
      if (occInfo.badgeType === "occupied" || occInfo.badgeType === "closed") return false;
    } else if (studyFilter === "small") {
      const maxQ = s.maxQuota || 4;
      if (maxQ > 4) return false;
    } else if (studyFilter === "large") {
      const maxQ = s.maxQuota || 1;
      if (maxQ < 5) return false;
    }
    return true;
  });

  return (
    <Container>
      {/* 상단 탭 네비게이션 */}
      <TabBar>
        <TabItem $active={activeTab === "seats"} onClick={() => setActiveTab("seats")}>
          <BookOpen size={15} />
          <span>열람실 좌석</span>
        </TabItem>
        <TabItem $active={activeTab === "study"} onClick={() => setActiveTab("study")}>
          <Users size={15} />
          <span>스터디룸 예약</span>
        </TabItem>
        <TabItem $active={activeTab === "my"} onClick={() => setActiveTab("my")}>
          <Clock size={15} />
          <span>내 이용 현황</span>
          {(mySeat || myStudyReservations.length > 0) && <BadgeDot />}
        </TabItem>
      </TabBar>

      {/* 포털/도서관 계정 연동 유도 배너 (앱 환경에서만 노출) */}
      {isMobileAppEnvironment() && isLinked === false && (
        <PortalLinkBanner
          title="도서관 계정 연동"
          description="포털 계정을 연동하면 열람실 좌석 배정 및 스터디룸 예약이 가능해요."
          actionText="연동하기"
          onAction={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
        />
      )}

      {/* 알림 관리 바로가기 배너 */}
      <BannerCard onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}>
        <BannerLeft>
          <Bell size={18} color="#0061ff" />
          <BannerText>
            <strong>빈자리 및 마감 알림 관리</strong>
            <span>빈자리 알림 및 좌석 만료 알림 목록</span>
          </BannerText>
        </BannerLeft>
        <ChevronRight size={18} color="#94a3b8" />
      </BannerCard>

      {/* 액션 피드백 토스트 */}
      {actionMessage && (
        <ToastMessage>
          <Check size={16} />
          <span>{actionMessage}</span>
        </ToastMessage>
      )}

      {/* ================= 1. 열람실 좌석 탭 ================= */}
      {activeTab === "seats" && (
        <Section>
          {/* 선호좌석 퀵 리스트 */}
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
                        <FavActionBtn onClick={() => handleRegisterSpecificSeatSniper(fav)}>
                          <Bell size={13} />
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
            <SectionTitle>열람실 좌석 현황 ({filteredRooms.length})</SectionTitle>
            <RefreshButton onClick={loadData}>
              <RefreshCw size={13} />
              <span>새로고침</span>
            </RefreshButton>
          </SectionHeader>

          {/* 검색 및 필터 바 */}
          <FilterArea>
            <SearchBox>
              <Search size={16} color="#8b95a1" />
              <SearchInput
                type="text"
                placeholder="열람실 이름 검색"
                value={seatSearchQuery}
                onChange={(e) => setSeatSearchQuery(e.target.value)}
              />
              {seatSearchQuery && (
                <ClearBtn onClick={() => setSeatSearchQuery("")} type="button">
                  <X size={14} />
                </ClearBtn>
              )}
            </SearchBox>
            <ChipRow>
              <FilterChip $active={seatFilter === "all"} onClick={() => setSeatFilter("all")}>
                전체
              </FilterChip>
              <FilterChip $active={seatFilter === "available"} onClick={() => setSeatFilter("available")}>
                잔여석 있음
              </FilterChip>
              <FilterChip $active={seatFilter === "laptop"} onClick={() => setSeatFilter("laptop")}>
                노트북석
              </FilterChip>
            </ChipRow>
          </FilterArea>

          {isLoading ? (
            <SkeletonList>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} style={{ padding: "16px", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
                    <Skeleton width="45%" height="22px" style={{ borderRadius: "6px" }} />
                    <Skeleton width="60px" height="22px" style={{ borderRadius: "6px" }} />
                  </div>
                  <Skeleton width="100%" height="6px" style={{ borderRadius: "999px", marginBottom: "8px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Skeleton width="60px" height="14px" />
                    <Skeleton width="100px" height="14px" />
                  </div>
                </Box>
              ))}
            </SkeletonList>
          ) : rooms.length === 0 ? (
            <EmptyBox>현재 조회 가능한 열람실이 없습니다.</EmptyBox>
          ) : filteredRooms.length === 0 ? (
            <EmptyBox>
              <Search size={28} color="#94a3b8" />
              <EmptyTitle>일치하는 열람실이 없습니다</EmptyTitle>
              <EmptyDesc>검색어나 필터 조건을 변경해보세요.</EmptyDesc>
            </EmptyBox>
          ) : (
            <RoomGrid>
              {filteredRooms.map((room) => {
                const total = room.seats?.total ?? room.totalSeats ?? 0;
                const available = room.seats?.available ?? room.availableSeats ?? 0;
                const occupied = room.seats?.occupied ?? room.occupiedSeats ?? 0;
                const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
                const isFull = available === 0 && total > 0;

                return (
                  <RoomCardBox
                    key={room.id}
                    onClick={() => handleOpenSeatPicker(room)}
                    style={{ padding: "16px" }}
                  >
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

                    {isFull && (
                      <ButtonRow style={{ marginTop: "10px" }}>
                        <SecondaryActionBtn
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegisterSeatSniper(room);
                          }}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          <Bell size={14} />
                          <span>빈자리 알림 등록</span>
                        </SecondaryActionBtn>
                      </ButtonRow>
                    )}
                  </RoomCardBox>
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
            <SectionTitle>스터디룸 현황 및 예약 ({filteredStudyRooms.length})</SectionTitle>
            <RefreshButton onClick={loadData}>
              <RefreshCw size={13} />
              <span>새로고침</span>
            </RefreshButton>
          </SectionHeader>

          <NoticeBanner>
            날짜별 10분 단위 예약 현황을 확인하고 직접 예약할 수 있습니다.
          </NoticeBanner>

          {/* 검색 및 필터 바 */}
          <FilterArea>
            <SearchBox>
              <Search size={16} color="#8b95a1" />
              <SearchInput
                type="text"
                placeholder="스터디룸 이름 또는 위치 검색"
                value={studySearchQuery}
                onChange={(e) => setStudySearchQuery(e.target.value)}
              />
              {studySearchQuery && (
                <ClearBtn onClick={() => setStudySearchQuery("")} type="button">
                  <X size={14} />
                </ClearBtn>
              )}
            </SearchBox>
            <ChipRow>
              <FilterChip $active={studyFilter === "all"} onClick={() => setStudyFilter("all")}>
                전체
              </FilterChip>
              <FilterChip $active={studyFilter === "available"} onClick={() => setStudyFilter("available")}>
                예약 가능
              </FilterChip>
              <FilterChip $active={studyFilter === "small"} onClick={() => setStudyFilter("small")}>
                2~4인실
              </FilterChip>
              <FilterChip $active={studyFilter === "large"} onClick={() => setStudyFilter("large")}>
                5인 이상
              </FilterChip>
            </ChipRow>
          </FilterArea>

          {isLoading ? (
            <SkeletonList>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} style={{ padding: "16px", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "8px" }}>
                    <Skeleton width="40%" height="22px" style={{ borderRadius: "6px" }} />
                    <Skeleton width="70px" height="22px" style={{ borderRadius: "6px" }} />
                  </div>
                  <Skeleton width="50%" height="14px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="100%" height="50px" style={{ borderRadius: "8px", marginBottom: "12px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Skeleton width="100%" height="38px" style={{ borderRadius: "10px" }} />
                    <Skeleton width="100%" height="38px" style={{ borderRadius: "10px" }} />
                  </div>
                </Box>
              ))}
            </SkeletonList>
          ) : studyRooms.length === 0 ? (
            <EmptyBox>현재 조회 가능한 스터디룸이 없습니다.</EmptyBox>
          ) : filteredStudyRooms.length === 0 ? (
            <EmptyBox>
              <Search size={28} color="#94a3b8" />
              <EmptyTitle>일치하는 스터디룸이 없습니다</EmptyTitle>
              <EmptyDesc>검색어나 필터 조건을 변경해보세요.</EmptyDesc>
            </EmptyBox>
          ) : (
            <StudyGrid>
              {filteredStudyRooms.map((s) => {
                const occInfo = computeStudyRoom2HourStatus(studyDetailsMap[s.id]);
                return (
                  <StudyCardBox
                    key={s.id}
                    onClick={() => handleOpenStudyBooking(s)}
                    style={{ padding: "16px" }}
                  >
                    <StudyHeader>
                      <StudyHeaderLeft>
                        <StudyTitleRow>
                          <StudyName>{s.name}</StudyName>
                          <QuotaBadge>{s.quota}</QuotaBadge>
                        </StudyTitleRow>
                        <StudyLocation>
                          <MapPin size={12} />
                          <span>{s.location}</span>
                        </StudyLocation>
                      </StudyHeaderLeft>
                      {occInfo.badgeLabel && (
                        <StudyOccupancyBadge $type={occInfo.badgeType}>
                          {occInfo.badgeLabel}
                        </StudyOccupancyBadge>
                      )}
                    </StudyHeader>

                    {/* 시간대별 점유 현황 프리뷰 바 */}
                    {occInfo.previewSlots.length > 0 && (
                      <StudyPreviewBarBox>
                        <StudyPreviewSlotRow>
                          {occInfo.previewSlots.map((slot, sIdx) => (
                            <StudyPreviewSlot
                              key={sIdx}
                              $type={slot.type}
                              title={slot.label}
                            />
                          ))}
                        </StudyPreviewSlotRow>
                        <StudyPreviewTimeLabels>
                          <span>지금</span>
                          <span>+1시간</span>
                          <span>+2시간</span>
                        </StudyPreviewTimeLabels>
                      </StudyPreviewBarBox>
                    )}

                    {s.tags && s.tags.length > 0 && (
                      <TagRow style={{ marginBottom: 0 }}>
                        {s.tags.map((t, idx) => (
                          <TagChip key={idx}>{t}</TagChip>
                        ))}
                      </TagRow>
                    )}
                  </StudyCardBox>
                );
              })}
            </StudyGrid>
          )}
        </Section>
      )}

      {/* ================= 3. 내 이용 현황 탭 ================= */}
      {activeTab === "my" && (
        <Section>
          <SectionHeader>
            <SectionTitle>내 도서관 이용 현황</SectionTitle>
            <RefreshButton onClick={loadData}>
              <RefreshCw size={13} />
              <span>새로고침</span>
            </RefreshButton>
          </SectionHeader>

          {/* 도서관 계정 미연동 시 비활성화 안내 배너 */}
          {(!isMobileAppEnvironment() || isLinked === false) && (
            <DisabledNoticeCard>
              <DisabledNoticeLeft>
                {!isMobileAppEnvironment() ? (
                  <Smartphone size={20} color="#0061ff" />
                ) : (
                  <KeyRound size={20} color="#0061ff" />
                )}
                <DisabledNoticeText>
                  {!isMobileAppEnvironment() ? (
                    <>
                      <strong>내 이용 현황은 INTIP 모바일 앱에서 이용할 수 있어요</strong>
                      <span>모바일 앱에서 열람실 좌석 배정, 연장/반납 및 스터디룸 예약 관리가 가능해요.</span>
                    </>
                  ) : (
                    <>
                      <strong>포털 계정을 연동해 주세요</strong>
                      <span>포털 계정을 연동하면 내 열람실 좌석 및 스터디룸 예약 현황을 관리할 수 있어요.</span>
                    </>
                  )}
                </DisabledNoticeText>
              </DisabledNoticeLeft>
              {!isMobileAppEnvironment() ? (
                <CapsuleButton
                  variant="brand"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                  onClick={() => openIntipAppOrStore("library?tab=my")}
                >
                  앱에서 보기
                </CapsuleButton>
              ) : (
                <CapsuleButton
                  variant="brand"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                  onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                  leftIcon={<KeyRound size={14} />}
                >
                  포털 계정 연동하기
                </CapsuleButton>
              )}
            </DisabledNoticeCard>
          )}

          {/* 3-1. 열람실 좌석 섹션 */}
          <SubTitle>현재 이용 중인 열람실 좌석</SubTitle>
          {isLoadingMy ? (
            <Box style={{ padding: "16px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
                <Skeleton width="80px" height="24px" style={{ borderRadius: "6px" }} />
                <Skeleton width="120px" height="24px" style={{ borderRadius: "6px" }} />
              </div>
              <Skeleton width="60%" height="16px" style={{ marginBottom: "14px" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <Skeleton width="100%" height="38px" style={{ borderRadius: "10px" }} />
                <Skeleton width="100%" height="38px" style={{ borderRadius: "10px" }} />
              </div>
            </Box>
          ) : mySeat ? (
            <Box style={{ padding: "16px" }}>
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
                          남은 시간: {Math.floor(remainingCheckinSec / 60)}분{" "}
                          {(remainingCheckinSec % 60) < 10 ? `0${remainingCheckinSec % 60}` : remainingCheckinSec % 60}초
                        </ExpiryBadge>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.45 }}>
                      학산도서관 게이트 통과 후 <strong>[배정 확정]</strong>을 누르시면 정상 이용 상태로 변경됩니다.
                    </span>
                    <NoticeBulletList>
                      <li>• 20분 내 미입실 시 예약이 자동 취소되며, 3회 누적 시 7일간 이용이 제한됩니다.</li>
                      <li>• 지금 이용하기 어려우실 경우 20분 내 <strong>[예약 취소]</strong>를 누르시면 페널티 없이 취소됩니다.</li>
                    </NoticeBulletList>
                  </div>
                </TempNoticeBox>
              )}

              <SeatTimeInfo>
                <Clock size={15} color="#0061ff" />
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
                    <PrimaryActionBtn onClick={handleCheckinSeat}>
                      <CheckCircle size={14} />
                      <span>배정 확정</span>
                    </PrimaryActionBtn>
                    <SecondaryActionBtn onClick={handleToggleFavoriteSeat}>
                      <Star
                        size={14}
                        color={mySeat.isFavoriteSeat ? "#f59e0b" : "#64748b"}
                        fill={mySeat.isFavoriteSeat ? "#f59e0b" : "none"}
                      />
                      <span>{mySeat.isFavoriteSeat ? "선호좌석 해제" : "선호좌석"}</span>
                    </SecondaryActionBtn>
                    <DangerActionBtn onClick={handleReturnSeat}>
                      <LogOut size={14} />
                      <span>예약 취소</span>
                    </DangerActionBtn>
                  </>
                ) : (
                  <>
                    <PrimaryActionBtn onClick={handleRenewSeat}>
                      <RotateCw size={14} />
                      <span>1시간 연장</span>
                    </PrimaryActionBtn>
                    <SecondaryActionBtn onClick={handleToggleFavoriteSeat}>
                      <Star
                        size={14}
                        color={mySeat.isFavoriteSeat ? "#f59e0b" : "#64748b"}
                        fill={mySeat.isFavoriteSeat ? "#f59e0b" : "none"}
                      />
                      <span>{mySeat.isFavoriteSeat ? "선호좌석 해제" : "선호좌석"}</span>
                    </SecondaryActionBtn>
                    <DangerActionBtn onClick={handleReturnSeat}>
                      <LogOut size={14} />
                      <span>퇴실 반납</span>
                    </DangerActionBtn>
                  </>
                )}
              </ActionRow>

              <ReminderRow onClick={handleRegisterSeatReminder}>
                <Bell size={14} color="#d97706" />
                <span>종료 20분 전 알림 받기</span>
              </ReminderRow>
            </Box>
          ) : (
            <EmptyBox>
              {!isMobileAppEnvironment()
                ? "INTIP 모바일 앱에서 배정된 좌석을 확인할 수 있어요."
                : isLinked === false
                ? "포털 계정 연동 후 배정된 좌석을 확인할 수 있어요."
                : "현재 배정된 열람실 좌석이 없어요."}
            </EmptyBox>
          )}

          {/* 3-2. 스터디룸 예약 섹션 */}
          <SubTitle style={{ marginTop: "24px" }}>내 스터디룸 예약 내역</SubTitle>
          {isLoadingMy ? (
            <SkeletonList>
              {[1, 2].map((i) => (
                <Box key={i} style={{ padding: "16px", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "8px" }}>
                    <Skeleton width="40%" height="20px" style={{ borderRadius: "6px" }} />
                    <Skeleton width="60px" height="18px" style={{ borderRadius: "4px" }} />
                  </div>
                  <Skeleton width="60%" height="14px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="100%" height="34px" style={{ borderRadius: "8px" }} />
                </Box>
              ))}
            </SkeletonList>
          ) : myStudyReservations.length > 0 ? (
            <ReservationList>
              {myStudyReservations.map((res) => {
                const isCheckinCompleted =
                  res.status === "USE" ||
                  res.status === "이용중" ||
                  res.status === "입실" ||
                  res.status === "CHARGE";

                return (
                  <Box key={res.id} style={{ padding: "16px" }}>
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
                  </Box>
                );
              })}
            </ReservationList>
          ) : (
            <EmptyBox>
              {!isMobileAppEnvironment()
                ? "INTIP 모바일 앱에서 예약 내역을 확인할 수 있어요."
                : isLinked === false
                ? "포털 계정 연동 후 예약 내역을 확인할 수 있어요."
                : "진행 중인 스터디룸 예약이 없어요."}
            </EmptyBox>
          )}

          {/* 3-3. 내 선호좌석 목록 섹션 */}
          <SubTitle style={{ marginTop: "24px" }}>내 선호좌석 ({favoriteSeats.length})</SubTitle>
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
                      <FavActionBtn onClick={() => handleRegisterSpecificSeatSniper(fav)}>
                        <Bell size={13} />
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
            <EmptyBox>
              {!isMobileAppEnvironment()
                ? "INTIP 모바일 앱에서 선호좌석을 관리할 수 있어요."
                : isLinked === false
                ? "포털 계정 연동 후 선호좌석을 관리할 수 있어요."
                : "등록된 선호좌석이 없어요. 열람실 좌석에서 ★을 눌러 등록해보세요."}
            </EmptyBox>
          )}
        </Section>
      )}

      {/* ================= 바텀시트 1: 열람실 좌석 선택 ================= */}
      <BottomSheet
        open={Boolean(selectedSeatRoom)}
        onOpenChange={(open) => {
          if (!open) setSelectedSeatRoom(null);
        }}
        height="85%"
        maxHeight="92%"
        showCloseButton={true}
      >
        <SheetContainer>
          <SheetHeader>
            <SheetTitle>{selectedSeatRoom?.name} 좌석 선택</SheetTitle>
            <SheetSubtitle>원하시는 좌석을 터치하여 배정하세요.</SheetSubtitle>
          </SheetHeader>

          {isLoadingSeats ? (
            <SeatGridContainer style={{ minHeight: "260px" }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} height="48px" style={{ borderRadius: "8px" }} />
              ))}
            </SeatGridContainer>
          ) : roomSeats.length === 0 ? (
            <EmptyBox style={{ margin: "20px 0" }}>조회된 좌석이 없습니다.</EmptyBox>
          ) : (
            <>
              <SeatLegendRow>
                <SeatLegendItem>
                  <SeatLegendBox $color="#eff6ff" $border="#93c5fd" />
                  <span>배정 가능 (터치 시 배정)</span>
                </SeatLegendItem>
                <SeatLegendItem>
                  <SeatLegendBox $color="#fef2f2" $border="#fca5a5" />
                  <span>사용 중 (터치 시 알림)</span>
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
        </SheetContainer>
      </BottomSheet>

      {/* ================= 바텀시트 2: 스터디룸 타임라인 및 예약 ================= */}
      <BottomSheet
        open={Boolean(selectedStudyRoom)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudyRoom(null);
        }}
        height="90%"
        maxHeight="95%"
        showCloseButton={true}
      >
        <SheetContainer>
          <SheetHeader>
            <SheetTitle>{selectedStudyRoom?.name} 예약</SheetTitle>
            <RoomInfoBadgesRow>
              <RoomInfoBadgeItem>
                <MapPin size={12} />
                <span>
                  {studyRoomDetail?.building?.name || "중앙관"}{" "}
                  {studyRoomDetail?.floor?.name || selectedStudyRoom?.location}
                </span>
              </RoomInfoBadgeItem>
              <RoomInfoBadgeItem>
                <Users size={12} />
                <span>
                  수용 {studyRoomDetail?.minQuota || selectedStudyRoom?.minQuota || 1} ~{" "}
                  {studyRoomDetail?.maxQuota || selectedStudyRoom?.maxQuota || 10}명
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
          </SheetHeader>

          {/* 안내 및 주의사항 카드 */}
          {(studyRoomDetail?.description || studyRoomDetail?.attention) && (
            <NoticeCard>
              <NoticeHeader onClick={() => setShowAttention((prev) => !prev)}>
                <NoticeTitle>
                  <Info size={15} color="#0061ff" />
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
                      <NoticeSubTitle>공간 설명</NoticeSubTitle>
                      <NoticeText>{studyRoomDetail.description}</NoticeText>
                    </NoticeSection>
                  )}
                  {studyRoomDetail.attention && (
                    <NoticeSection>
                      <NoticeSubTitle>이용 주의사항</NoticeSubTitle>
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

          {/* 10분 단위 타임라인 */}
          <TimelineSection>
            <TimelineHeader>
              <span>시간대별 현황 (10분 단위)</span>
              <LegendRow>
                <LegendItem>
                  <LegendDot $type="avail" /> 가능
                </LegendItem>
                <LegendItem>
                  <LegendDot $type="occ" /> 점유됨
                </LegendItem>
                <LegendItem>
                  <LegendDot $type="past" /> 마감
                </LegendItem>
              </LegendRow>
            </TimelineHeader>

            {isLoadingTimeline ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "8px 0" }}>
                <Skeleton height="16px" width="100%" />
                <Skeleton height="16px" width="100%" />
                <Skeleton height="16px" width="100%" />
              </div>
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
                            title={`${timeStr} ${isPast ? "(마감)" : isOcc ? "(점유됨)" : "(선택 가능)"}`}
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
            {/* 시작 시간 & 종료 시간 */}
            <TimeRangeRow>
              <TimeSelectBox>
                <FormLabel>시작 시간</FormLabel>
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

            {/* 사용 목적 */}
            <FormGroup>
              <FormLabel>
                사용 목적 <span style={{ color: "#ef4444" }}>*필수</span>
              </FormLabel>
              <FormInput
                type="text"
                value={reservePurpose}
                onChange={(e) => setReservePurpose(e.target.value)}
                placeholder="예: 과제 및 스터디"
              />
            </FormGroup>

            {/* 동반 이용자 등록 */}
            {(() => {
              const minQuota = studyRoomDetail?.minQuota || selectedStudyRoom?.minQuota || 1;
              const minCompanions = Math.max(0, minQuota - 1);
              const isSatisfied = companions.length >= minCompanions;

              return (
                <CompanionSection>
                  <CompanionHeader>
                    <div>
                      <CompanionTitle>동반 이용자 등록</CompanionTitle>
                      {minCompanions > 0 && (
                        <span style={{ fontSize: "11px", color: "var(--text-secondary, #6b7684)", marginLeft: "6px" }}>
                          (본인 포함 {minQuota}~{studyRoomDetail?.maxQuota || selectedStudyRoom?.maxQuota || 10}인실)
                        </span>
                      )}
                    </div>
                    <CompanionQuotaBadge $isSatisfied={isSatisfied}>
                      {minCompanions > 0
                        ? `동반자 ${companions.length}/${minCompanions}명 ${isSatisfied ? "충족" : "필요"}`
                        : `동반자 ${companions.length}명`}
                    </CompanionQuotaBadge>
                  </CompanionHeader>

                  {minCompanions > 0 && !isSatisfied && (
                    <span style={{ fontSize: "11.5px", color: "#ef4444" }}>
                      ※ 동반 이용자를 최소 {minCompanions}명 이상 등록해야 예약이 가능합니다.
                    </span>
                  )}

                  <CompanionInputRow>
                    <CompanionInput
                      type="text"
                      placeholder="이름"
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
                      placeholder="학번"
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

            {/* 동반이용자 개인정보 동의 */}
            <PrivacyAgreeContainer onClick={() => setIsPrivacyAgreed((prev) => !prev)}>
              <PrivacyAgreeLabel>
                <CustomCheckbox $checked={isPrivacyAgreed}>
                  {isPrivacyAgreed && <Check size={11} color="#fff" strokeWidth={3} />}
                </CustomCheckbox>
                <span>
                  동반이용자 개인정보 수집 및 이용 동의 <span style={{ color: "#ef4444" }}>*필수</span>
                </span>
              </PrivacyAgreeLabel>
              <PrivacyNoticeText>
                스터디룸 이용 및 입실 확인 관리를 위해 동반이용자의 이름 및 학번 정보를 수집·이용하는 것에 동의합니다.
              </PrivacyNoticeText>
            </PrivacyAgreeContainer>

            {/* 기타 요청사항 */}
            <FormGroup>
              <FormLabel>기타 요청사항 (선택)</FormLabel>
              <FormInput
                type="text"
                value={reserveNotes}
                onChange={(e) => setReserveNotes(e.target.value)}
                placeholder="요청사항이 있을 경우 입력해주세요."
              />
            </FormGroup>

            <ModalActionBtnGroup>
              <CapsuleButton
                variant="primary"
                fullWidth
                disabled={isSubmittingBooking}
                loading={isSubmittingBooking}
                onClick={handleSubmitStudyBooking}
                style={{ fontSize: "15px", padding: "12px 20px" }}
              >
                예약 신청하기
              </CapsuleButton>
              <SecondaryActionBtn
                type="button"
                onClick={handleRegisterStudySlotSniper}
                style={{ width: "100%", padding: "12px", justifyContent: "center" }}
              >
                <Bell size={14} />
                <span>이 시간대 취소표 알림 받기</span>
              </SecondaryActionBtn>
            </ModalActionBtnGroup>
          </BookingForm>
        </SheetContainer>
      </BottomSheet>

      {/* 확인/취소 공용 모달 */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
        primaryButton={{
          text: "확인",
          variant: "brand",
          onClick: confirmModal.onConfirm,
        }}
        secondaryButton={{
          text: "취소",
          variant: "secondary",
          onClick: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        }}
      />

      {/* 안내 공용 모달 */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        description={alertModal.description}
        primaryButton={{
          text: "확인",
          variant: "brand",
          onClick: () => setAlertModal((prev) => ({ ...prev, isOpen: false })),
        }}
      />

      <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
    </Container>
  );
}

// ================= STYLES =================

const Container = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER}px 80px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 80px;
  }
`;

const FootnoteText = styled.p`
  margin: 20px 0 0;
  font-size: 12.5px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  line-height: 1.4;
`;

const TabBar = styled.div`
  display: flex;
  background: var(--bg-muted, #f2f4f6);
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 16px;
`;

const TabItem = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #6b7684)")};
  background: ${({ $active }) => ($active ? "var(--bg-base, #ffffff)" : "transparent")};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none")};
  position: relative;
  transition: all 0.15s ease;
`;

const BadgeDot = styled.div`
  position: absolute;
  top: 8px;
  right: 14px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-brand, #0061ff);
`;

const BannerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.12s ease-in-out;

  &:active {
    transform: scale(0.98);
    background: var(--bg-muted, #f8fafc);
  }
`;

const BannerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  strong {
    font-size: 14px;
    color: var(--text-primary, #191f28);
  }
  span {
    font-size: 12px;
    color: var(--text-secondary, #6b7684);
    margin-top: 2px;
  }
`;

const ToastMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  margin: 0;
`;

const SubTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
  margin: 0 0 6px 4px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  cursor: pointer;
`;

const NoticeBanner = styled.div`
  background: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid #dbeafe;
  color: #1e40af;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.4;
`;

const SkeletonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
`;

const RoomGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
`;

const RoomCardBox = styled(Box)`
  width: 100%;
  cursor: pointer;
  transition: transform 0.12s ease-in-out;

  &:active {
    transform: scale(0.99);
  }
`;

const RoomHeader = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  box-sizing: border-box;
`;

const RoomName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  flex: 1;
`;

const SeatBadge = styled.span<{ $isFull: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  background: ${({ $isFull }) => ($isFull ? "var(--bg-error, #fef2f2)" : "var(--bg-brand-subtle, #eff6ff)")};
  color: ${({ $isFull }) => ($isFull ? "var(--text-error, #ef4444)" : "var(--text-brand, #0061ff)")};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: var(--bg-muted, #f1f3f5);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressBarFill = styled.div<{ $rate: number; $isFull: boolean }>`
  width: ${({ $rate }) => Math.min(100, Math.max(0, $rate))}%;
  height: 100%;
  background: ${({ $isFull }) => ($isFull ? "var(--text-error, #ef4444)" : "var(--interactive-primary, #0061ff)")};
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const SeatStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary, #8b95a1);
  margin-bottom: 4px;
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const PrimaryActionBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: var(--interactive-primary, #0061ff);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
  background: var(--bg-muted, #f2f4f6);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const DangerActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-error, #ef4444);
  background: var(--bg-error, #fef2f2);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.12s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const FilterArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  width: 100%;
  box-sizing: border-box;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 9px 12px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--interactive-primary, #0061ff);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13.5px;
  color: var(--text-primary, #191f28);
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--text-placeholder, #8b95a1);
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled, #8b95a1);
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    color: var(--text-primary, #191f28);
  }
`;

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #4e5968)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-muted, #f2f4f6)")};
  border: 1px solid ${({ $active }) => ($active ? "var(--interactive-primary, #0061ff)" : "var(--border-default, #e5e8eb)")};
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:active {
    transform: scale(0.97);
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
  background: var(--bg-muted, #f8fafc);
  border: 1px dashed var(--border-default, #e5e8eb);
  border-radius: 14px;
  font-size: 13px;
  color: var(--text-secondary, #8b95a1);
  text-align: center;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
`;

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333d4b);
  margin-top: 4px;
`;

const EmptyDesc = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #8b95a1);
  line-height: 1.5;
`;

const FavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FavTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const FavGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
`;

const FavCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FavCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FavName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FavBadge = styled.span<{ $isAvail: boolean }>`
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 4px;
  background: ${({ $isAvail }) => ($isAvail ? "#dcfce7" : "#fee2e2")};
  color: ${({ $isAvail }) => ($isAvail ? "#15803d" : "#dc2626")};
`;

const FavBtnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FavActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
  background: var(--bg-brand-subtle, #eff6ff);
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const FavDeleteBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: var(--text-disabled, #8b95a1);
  background: var(--bg-muted, #f2f4f6);
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const StudyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
`;

const StudyCardBox = styled(Box)`
  width: 100%;
  cursor: pointer;
  transition: transform 0.12s ease-in-out;

  &:active {
    transform: scale(0.99);
  }
`;

const StudyHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StudyHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const StudyTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StudyName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const StudyLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
`;

const DisabledNoticeCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 8px;

  @media ${DESKTOP_MEDIA} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const DisabledNoticeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DisabledNoticeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  strong {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-primary, #191f28);
  }
  span {
    font-size: 12px;
    color: var(--text-secondary, #6b7684);
    line-height: 1.4;
  }
`;

const StudyOccupancyBadge = styled.span<{ $type: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 6px;
  background: ${({ $type }) =>
    $type === "avail" ? "#dcfce7" : $type === "warning" ? "#fef3c7" : "#fee2e2"};
  color: ${({ $type }) =>
    $type === "avail" ? "#15803d" : $type === "warning" ? "#b45309" : "#dc2626"};
`;

const QuotaBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-muted, #f2f4f6);
  color: var(--text-secondary, #4e5968);
  padding: 3px 7px;
  border-radius: 6px;
`;

const StudyPreviewBarBox = styled.div`
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #f1f5f9);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
`;

const StudyPreviewSlotRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  gap: 3px;
  height: 10px;
`;

const StudyPreviewSlot = styled.div<{ $type: string }>`
  flex: 1;
  border-radius: 3px;
  background: ${({ $type }) =>
    $type === "avail" ? "#86efac" : $type === "occ" ? "#fca5a5" : "#e2e8f0"};
`;

const StudyPreviewTimeLabels = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-disabled, #8b95a1);
  margin-top: 4px;
`;

const TagRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const TagChip = styled.span`
  font-size: 11px;
  color: var(--text-secondary, #6b7684);
  background: var(--bg-muted, #f2f4f6);
  padding: 2px 7px;
  border-radius: 6px;
`;

const ActiveSeatHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ActiveBadge = styled.span<{ $isTemp?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ $isTemp }) => ($isTemp ? "#fef3c7" : "#dcfce7")};
  color: ${({ $isTemp }) => ($isTemp ? "#b45309" : "#15803d")};
`;

const SeatRoomTitle = styled.div`
  font-size: 15px;
  color: var(--text-primary, #191f28);
  strong {
    font-size: 16px;
    color: var(--text-brand, #0061ff);
  }
`;

const TempNoticeBox = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
`;

const ExpiryBadge = styled.span<{ $urgent?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $urgent }) => ($urgent ? "#fee2e2" : "#fef3c7")};
  color: ${({ $urgent }) => ($urgent ? "#dc2626" : "#92400e")};
`;

const NoticeBulletList = styled.ul`
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  font-size: 11.5px;
  color: #78350f;
  line-height: 1.5;
`;

const SeatTimeInfo = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
  margin-bottom: 14px;
`;

const ActionRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
`;

const ReminderRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  background: #fffbeb;
  color: #b45309;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ReservationList = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
`;

const ReservationTop = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  strong {
    font-size: 14px;
    color: var(--text-primary, #191f28);
  }
`;

const ReservationStatus = styled.span`
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  padding: 2px 6px;
  border-radius: 4px;
`;

const ReservationTime = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  margin-bottom: 4px;
`;

const ReservationNote = styled.div`
  width: 100%;
  box-sizing: border-box;
  font-size: 11px;
  color: var(--text-disabled, #8b95a1);
  margin-bottom: 10px;
`;

const ReservationActionRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-default, #f1f5f9);
`;

const SmallActionBtn = styled.button<{ $danger?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: ${({ $danger }) => ($danger ? "var(--bg-error, #fef2f2)" : "var(--interactive-primary, #0061ff)")};
  color: ${({ $danger }) => ($danger ? "var(--text-error, #ef4444)" : "#ffffff")};
`;

// 바텀시트 공용 스타일
const SheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SheetTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const SheetSubtitle = styled.div`
  font-size: 13px;
  color: var(--text-secondary, #6b7684);
`;

const SeatLegendRow = styled.div`
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--text-secondary, #4e5968);
`;

const SeatLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SeatLegendBox = styled.div<{ $color: string; $border: string }>`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
`;

const SeatGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding: 4px;
`;

const SeatButton = styled.button<{
  $isOccupied: boolean;
  $isReservable: boolean;
  $isDisabled: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid
    ${({ $isReservable, $isOccupied }) =>
      $isReservable ? "#bfdbfe" : $isOccupied ? "#fecaca" : "#e2e8f0"};
  background: ${({ $isReservable, $isOccupied }) =>
    $isReservable ? "#eff6ff" : $isOccupied ? "#fef2f2" : "#f1f5f9"};
  color: ${({ $isReservable, $isOccupied }) =>
    $isReservable ? "#1d4ed8" : $isOccupied ? "#dc2626" : "#94a3b8"};
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  transition: transform 0.1s ease;

  &:active {
    transform: ${({ $isDisabled }) => ($isDisabled ? "none" : "scale(0.95)")};
  }
`;

const RoomInfoBadgesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
`;

const RoomInfoBadgeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  background: var(--bg-muted, #f2f4f6);
  padding: 3px 8px;
  border-radius: 6px;
`;

const NoticeCard = styled.div`
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  overflow: hidden;
`;

const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
`;

const NoticeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const NoticeToggleBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary, #6b7684);
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const NoticeBody = styled.div`
  padding: 0 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoticeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NoticeSubTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
`;

const NoticeText = styled.div`
  font-size: 11.5px;
  color: var(--text-secondary, #6b7684);
  line-height: 1.45;
  white-space: pre-wrap;
`;

const DateSelectorRow = styled.div`
  display: flex;
  gap: 8px;
`;

const DateBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--border-default, #e5e8eb)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-base, #ffffff)")};
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #4e5968)")};
  cursor: pointer;
`;

const TimelineSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #f1f5f9);
  border-radius: 12px;
  padding: 12px;
`;

const TimelineHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #333d4b);
`;

const LegendRow = styled.div`
  display: flex;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary, #6b7684);
`;

const LegendDot = styled.div<{ $type: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $type }) =>
    $type === "avail" ? "#86efac" : $type === "occ" ? "#fca5a5" : "#cbd5e1"};
`;

const TimelineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
`;

const HourSlot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const HourLabel = styled.div`
  font-size: 10px;
  color: var(--text-disabled, #8b95a1);
  text-align: center;
`;

const MinuteBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MinuteBar = styled.div<{ $type: string }>`
  height: 6px;
  border-radius: 2px;
  background: ${({ $type }) =>
    $type === "avail" ? "#86efac" : $type === "occ" ? "#fca5a5" : "#e2e8f0"};
`;

const BookingForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TimeRangeRow = styled.div`
  display: flex;
  gap: 10px;
`;

const TimeSelectBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DurationSummaryText = styled.span`
  color: var(--text-brand, #0061ff);
`;

const FormSelect = styled.select`
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  font-size: 14px;
  color: var(--text-primary, #191f28);
  outline: none;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  font-size: 13px;
  color: var(--text-primary, #191f28);
  outline: none;
`;

const DurationBtnGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const DurationBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 0;
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--border-default, #e5e8eb)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-muted, #f8fafc)")};
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #4e5968)")};
  cursor: pointer;
`;

const CompanionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #f1f5f9);
  border-radius: 12px;
  padding: 12px;
`;

const CompanionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CompanionTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const CompanionQuotaBadge = styled.span<{ $isSatisfied: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $isSatisfied }) => ($isSatisfied ? "#dcfce7" : "#fee2e2")};
  color: ${({ $isSatisfied }) => ($isSatisfied ? "#15803d" : "#dc2626")};
`;

const CompanionInputRow = styled.div`
  display: flex;
  gap: 6px;
`;

const CompanionInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  font-size: 12px;
  color: var(--text-primary, #191f28);
  outline: none;
`;

const CompanionAddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: var(--interactive-primary, #0061ff);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #b0b8c1);
    cursor: not-allowed;
  }
`;

const CompanionChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CompanionChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  font-size: 12px;
`;

const CompanionChipDeleteBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
`;

const PrivacyAgreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #f1f5f9);
  cursor: pointer;
`;

const PrivacyAgreeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const CustomCheckbox = styled.div<{ $checked: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid ${({ $checked }) => ($checked ? "var(--interactive-primary, #0061ff)" : "var(--border-default, #cbd5e1)")};
  background: ${({ $checked }) => ($checked ? "var(--interactive-primary, #0061ff)" : "var(--bg-base, #ffffff)")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
`;

const PrivacyNoticeText = styled.div`
  font-size: 11px;
  color: var(--text-secondary, #6b7684);
  line-height: 1.4;
  padding-left: 24px;
`;

const ModalActionBtnGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;
