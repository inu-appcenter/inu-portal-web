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
  getRoomSeats,
  reserveSeat,
  checkinSeat,
  getStudyRoomDetail,
  reserveStudyRoom,
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
} from "lucide-react";

export default function MobileLibraryHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"seats" | "study" | "my">("seats");
  const [rooms, setRooms] = useState<LibrarySeatRoom[]>([]);
  const [studyRooms, setStudyRooms] = useState<LibraryStudyRoom[]>([]);
  const [mySeat, setMySeat] = useState<CurrentSeatInfo | null>(null);
  const [myStudyReservations, setMyStudyReservations] = useState<StudyRoomReservation[]>([]);
  const [, setIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 1. 열람실 좌석 선택 모달 상태
  const [selectedSeatRoom, setSelectedSeatRoom] = useState<LibrarySeatRoom | null>(null);
  const [roomSeats, setRoomSeats] = useState<LibrarySeat[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(false);

  // 2. 스터디룸 타임라인 & 예약 모달 상태
  const [selectedStudyRoom, setSelectedStudyRoom] = useState<LibraryStudyRoom | null>(null);
  const [studyRoomDetail, setStudyRoomDetail] = useState<StudyRoomDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reserveBeginTime, setReserveBeginTime] = useState<string>("14:00");
  const [reserveDurationHours, setReserveDurationHours] = useState<number>(2);
  const [reserveCompanionCnt, setReserveCompanionCnt] = useState<number>(4);
  const [reservePurpose, setReservePurpose] = useState<string>("학습 및 스터디");
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  useHeader({
    title: "학산도서관 스마트 허브",
    subHeader: null,
    hasback: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, studyData] = await Promise.all([
        getReadingRooms().catch(() => []),
        getStudyRooms().catch(() => []),
      ]);
      setRooms(roomsData);
      setStudyRooms(studyData);

      if (isMobileAppEnvironment()) {
        const linkRes = await checkLibraryAccountLinked().catch(() => ({ linked: false }));
        setIsLinked(linkRes.linked);
        if (linkRes.linked) {
          const [seat, studyRes] = await Promise.all([
            getMyCurrentSeat().catch(() => null),
            getMyStudyRoomReservations().catch(() => []),
          ]);
          setMySeat(seat);
          setMyStudyReservations(studyRes);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      const seats = await getRoomSeats(room.id);
      setRoomSeats(seats);
    } catch (e) {
      console.error(e);
      alert("좌석 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // 좌석 배정 신청
  const handleAssignSeat = async (seat: LibrarySeat) => {
    if (!seat.isReservable || seat.isOccupied) {
      alert("현재 배정할 수 없는 좌석입니다.");
      return;
    }
    if (!window.confirm(`'${seat.code}'번 좌석을 지금 배정하시겠습니까?`)) return;

    try {
      const res = await reserveSeat(seat.id);
      if (res.success) {
        showToast(`🎉 ${seat.code}번 좌석이 성공적으로 배정되었습니다!`);
        setSelectedSeatRoom(null);
        setActiveTab("my");
        loadData();
      } else {
        alert(res.message || "좌석 배정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("좌석 배정 중 오류가 발생했습니다.");
    }
  };

  // --- 스터디룸 타임라인 & 예약 모달 열기 ---
  const handleOpenStudyBooking = async (sRoom: LibraryStudyRoom) => {
    if (!isMobileAppEnvironment()) {
      alert("스터디룸 타임라인 조회 및 예약은 INTIP 모바일 앱 환경에서 지원됩니다.");
      return;
    }
    setSelectedStudyRoom(sRoom);
    setReserveCompanionCnt(sRoom.minQuota || 4);
    await loadStudyTimeline(sRoom.id, selectedDate);
  };

  const loadStudyTimeline = async (roomId: number, dateStr: string) => {
    setIsLoadingTimeline(true);
    try {
      const detail = await getStudyRoomDetail(roomId, dateStr);
      setStudyRoomDetail(detail);
    } catch (e) {
      console.error(e);
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

  // 스터디룸 예약 제출
  const handleSubmitStudyBooking = async () => {
    if (!selectedStudyRoom) return;
    const startHour = parseInt(reserveBeginTime.split(":")[0], 10);
    const startMin = reserveBeginTime.split(":")[1];
    const endHour = startHour + reserveDurationHours;
    const endHourStr = endHour < 10 ? `0${endHour}` : `${endHour}`;
    const endTime = `${endHourStr}:${startMin}`;

    const beginFull = `${selectedDate} ${reserveBeginTime}`;
    const endFull = `${selectedDate} ${endTime}`;

    if (
      !window.confirm(
        `[${selectedStudyRoom.name}]\n일시: ${beginFull} ~ ${endTime}\n인원: ${reserveCompanionCnt}명\n예약하시겠습니까?`
      )
    ) {
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const res = await reserveStudyRoom({
        roomId: selectedStudyRoom.id,
        beginTime: beginFull,
        endTime: endFull,
        companionCnt: reserveCompanionCnt,
        patronMessage: reservePurpose,
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
      const ok = await checkinSeat(mySeat.chargeId);
      if (ok) {
        showToast("✅ 좌석 입실 확인이 완료되었습니다.");
        loadData();
      } else {
        alert("입실 체크인 가능 시간이 아니거나 처리되지 않았습니다.");
      }
    } catch (e) {
      console.error(e);
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
    if (!mySeat || !window.confirm("정말 퇴실 반납하시겠습니까?")) return;
    try {
      const ok = await returnCurrentSeat(mySeat.chargeId);
      if (ok) {
        showToast("🚪 좌석이 정상 반납되었습니다.");
        setMySeat(null);
        loadData();
      } else {
        alert("좌석 반납에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 감시 알림 등록 ---
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

  const handleRegisterStudySniper = async (sRoom: LibraryStudyRoom) => {
    if (!isMobileAppEnvironment()) {
      alert("취소표 백그라운드 감시는 INTIP 모바일 앱에서 이용할 수 있습니다.");
      return;
    }
    try {
      await registerLocalWatchJobInApp({
        watchType: "STUDY_ROOM_SNIPER",
        roomId: sRoom.id,
        roomName: sRoom.name,
        targetHour: 15,
        durationMinutes: 60,
      });
      showToast(`🎯 '${sRoom.name}' 취소표 감시가 기기에서 시작되었습니다! (60분)`);
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
                <ActiveBadge>이용 중</ActiveBadge>
                <SeatRoomTitle>
                  {mySeat.roomName} <strong>{mySeat.seatName}</strong>
                </SeatRoomTitle>
              </ActiveSeatHeader>

              <SeatTimeInfo>
                <Clock size={16} color="#2563eb" />
                <span>
                  이용 시간: {mySeat.beginTime.slice(11, 16)} ~ {mySeat.endTime.slice(11, 16)}
                </span>
              </SeatTimeInfo>

              <ActionRow>
                <ActionButton
                  onClick={handleCheckinSeat}
                  style={{ background: "#2563eb", color: "#fff", border: "none" }}
                >
                  <CheckCircle size={14} />
                  <span>입실 확인</span>
                </ActionButton>
                <ActionButton onClick={handleRenewSeat}>
                  <RotateCw size={14} />
                  <span>1시간 연장</span>
                </ActionButton>
                <ActionButton onClick={handleReturnSeat} $danger>
                  <LogOut size={14} />
                  <span>퇴실 반납</span>
                </ActionButton>
              </ActionRow>

              <ReminderRow onClick={handleRegisterSeatReminder}>
                <Bell size={14} color="#d97706" />
                <span>종료 20분 전 정각 알람 신청하기</span>
              </ReminderRow>
            </ActiveSeatCard>
          ) : (
            <EmptyBox>현재 배정된 열람실 좌석이 없습니다.</EmptyBox>
          )}

          {/* 3-2. 스터디룸 예약 섹션 */}
          <SubTitle style={{ marginTop: "24px" }}>내 스터디룸 예약 내역</SubTitle>
          {myStudyReservations.length > 0 ? (
            <ReservationList>
              {myStudyReservations.map((res) => (
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
                    <SmallActionBtn onClick={() => handleCheckinStudyReservation(res.id)}>
                      <CheckCircle size={13} />
                      <span>입실 체크인</span>
                    </SmallActionBtn>
                    <SmallActionBtn
                      $danger
                      onClick={() => handleCancelStudyReservation(res.id, res.roomName)}
                    >
                      <X size={13} />
                      <span>예약 취소</span>
                    </SmallActionBtn>
                  </ReservationActionRow>
                </ReservationCard>
              ))}
            </ReservationList>
          ) : (
            <EmptyBox>진행 중인 스터디룸 예약이 없습니다.</EmptyBox>
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
              <SeatGridContainer>
                {roomSeats.map((seat) => (
                  <SeatButton
                    key={seat.id}
                    $isOccupied={seat.isOccupied}
                    $isReservable={seat.isReservable}
                    disabled={!seat.isReservable || seat.isOccupied}
                    onClick={() => handleAssignSeat(seat)}
                  >
                    <span>{seat.code}</span>
                  </SeatButton>
                ))}
              </SeatGridContainer>
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
                <ModalSubtitle>
                  {selectedStudyRoom.location} ({selectedStudyRoom.quota})
                </ModalSubtitle>
              </div>
              <CloseBtn onClick={() => setSelectedStudyRoom(null)}>
                <X size={20} />
              </CloseBtn>
            </ModalHeader>

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
                          return (
                            <MinuteBar
                              key={mIdx}
                              $type={isPast ? "past" : isOcc ? "occ" : "avail"}
                              title={`${slot.hour}:${mIdx * 10}분`}
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
              <FormGroup>
                <FormLabel>시작 시간</FormLabel>
                <FormSelect
                  value={reserveBeginTime}
                  onChange={(e) => setReserveBeginTime(e.target.value)}
                >
                  {[
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>이용 시간</FormLabel>
                <DurationBtnGroup>
                  {[1, 2, 3].map((hr) => (
                    <DurationBtn
                      key={hr}
                      $active={reserveDurationHours === hr}
                      onClick={() => setReserveDurationHours(hr)}
                    >
                      {hr}시간
                    </DurationBtn>
                  ))}
                </DurationBtnGroup>
              </FormGroup>

              <FormGroup>
                <FormLabel>이용 인원</FormLabel>
                <FormInput
                  type="number"
                  min={selectedStudyRoom.minQuota || 1}
                  max={selectedStudyRoom.maxQuota || 10}
                  value={reserveCompanionCnt}
                  onChange={(e) => setReserveCompanionCnt(parseInt(e.target.value, 10) || 1)}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>사용 목적</FormLabel>
                <FormInput
                  type="text"
                  value={reservePurpose}
                  onChange={(e) => setReservePurpose(e.target.value)}
                  placeholder="예: 조별 과제 및 토의"
                />
              </FormGroup>

              <SubmitBtn disabled={isSubmittingBooking} onClick={handleSubmitStudyBooking}>
                {isSubmittingBooking ? "예약 처리 중..." : "위 조건으로 예약 신청하기"}
              </SubmitBtn>
            </BookingForm>
          </ModalContent>
        </ModalOverlay>
      )}
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

const ActiveBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  background: #2563eb;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
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

const SeatGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 10px 0;
  max-height: 55vh;
  overflow-y: auto;
`;

const SeatButton = styled.button<{ $isOccupied: boolean; $isReservable: boolean }>`
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid
    ${({ $isOccupied, $isReservable }) =>
      $isOccupied ? "#e2e8f0" : $isReservable ? "#93c5fd" : "#f1f5f9"};
  background: ${({ $isOccupied, $isReservable }) =>
    $isOccupied ? "#f1f5f9" : $isReservable ? "#eff6ff" : "#f8fafc"};
  color: ${({ $isOccupied, $isReservable }) =>
    $isOccupied ? "#94a3b8" : $isReservable ? "#1d4ed8" : "#cbd5e1"};
  cursor: ${({ $isOccupied, $isReservable }) =>
    !$isOccupied && $isReservable ? "pointer" : "not-allowed"};

  &:active {
    ${({ $isOccupied, $isReservable }) =>
      !$isOccupied && $isReservable && "transform: scale(0.95);"}
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

const SubmitBtn = styled.button`
  padding: 12px 0;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  margin-top: 8px;

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;
