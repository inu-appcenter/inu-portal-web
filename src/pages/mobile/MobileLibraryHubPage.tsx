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
  LibrarySeatRoom,
  LibraryStudyRoom,
  CurrentSeatInfo,
} from "@/apis/library";
import { postRegisterCampusWatch } from "@/apis/agent";
import {
  registerLocalWatchJobInApp,
  checkLibraryAccountLinked,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import {
  BookOpen,
  Users,
  Clock,
  Crosshair,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  RotateCw,
  LogOut,
  Bell,
  Sparkles,
} from "lucide-react";

export default function MobileLibraryHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"seats" | "study" | "my">("seats");
  const [rooms, setRooms] = useState<LibrarySeatRoom[]>([]);
  const [studyRooms, setStudyRooms] = useState<LibraryStudyRoom[]>([]);
  const [mySeat, setMySeat] = useState<CurrentSeatInfo | null>(null);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
          const seat = await getMyCurrentSeat().catch(() => null);
          setMySeat(seat);
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

  // 1. 열람실 빈자리 스나이퍼 등록 (서버 싱글플라이트)
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

  // 2. 스터디룸 취소표 스나이퍼 등록 (단말기 로컬 감시)
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
        targetHour: 15, // 기본 오후 3시 타임스탬프 스나이퍼
        durationMinutes: 60,
      });
      showToast(`🎯 '${sRoom.name}' 취소표 감시가 기기에서 시작되었습니다! (60분)`);
    } catch (e) {
      console.error(e);
      alert("취소표 감시 등록에 실패했습니다.");
    }
  };

  // 3. 내 좌석 만료 20분 전 알람 등록 (단말 정밀 알람)
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

  // 4. 내 좌석 연장
  const handleRenewSeat = async () => {
    if (!mySeat) return;
    try {
      const ok = await renewCurrentSeat(mySeat.chargeId);
      if (ok) {
        showToast("🔄 좌석 이용 시간이 정상 연장되었습니다.");
        loadData();
      } else {
        alert("좌석 연장 가능 시간이 아니거나 연장 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. 내 좌석 반납
  const handleReturnSeat = async () => {
    if (!mySeat || !window.confirm("정말 퇴실 반납하시겠습니까?")) return;
    try {
      const ok = await returnCurrentSeat(mySeat.chargeId);
      if (ok) {
        showToast("🚪 좌석이 정상 반납되었습니다.");
        setMySeat(null);
      } else {
        alert("좌석 반납에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      {/* 상단 탭 내비게이션 */}
      <TabBar>
        <TabButton $active={activeTab === "seats"} onClick={() => setActiveTab("seats")}>
          <BookOpen size={16} />
          <span>열람실 현황</span>
        </TabButton>
        <TabButton $active={activeTab === "study"} onClick={() => setActiveTab("study")}>
          <Users size={16} />
          <span>스터디룸</span>
        </TabButton>
        <TabButton $active={activeTab === "my"} onClick={() => setActiveTab("my")}>
          <Clock size={16} />
          <span>내 이용 현황</span>
          {mySeat && <ActiveDot />}
        </TabButton>
      </TabBar>

      {/* 액션 안내 토스트 배너 */}
      {actionMessage && (
        <ToastBanner>
          <Sparkles size={16} />
          <span>{actionMessage}</span>
          <button onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}>관리 보기</button>
        </ToastBanner>
      )}

      {/* 탭 1: 열람실 좌석 현황 */}
      {activeTab === "seats" && (
        <SectionWrapper>
          <SectionTop>
            <SectionTitle>학산도서관 열람실 실시간 현황</SectionTitle>
            <RefreshBtn onClick={loadData} disabled={isLoading}>
              <RefreshCw size={13} className={isLoading ? "spin" : ""} />
              <span>새로고침</span>
            </RefreshBtn>
          </SectionTop>

          <ListContainer>
            {rooms.map((room) => {
              const total = room.seats?.total ?? room.totalSeats ?? 0;
              const occupied = room.seats?.occupied ?? room.occupiedSeats ?? 0;
              const available = room.seats?.available ?? room.availableSeats ?? Math.max(0, total - occupied);
              const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
              const isCrowded = available <= 5;

              return (
                <CardItem key={room.id}>
                  <CardMain>
                    <RoomHeader>
                      <RoomName>{room.name}</RoomName>
                      <SeatCount>
                        <AvailCount $urgent={isCrowded}>{available}석</AvailCount> / {total}석
                      </SeatCount>
                    </RoomHeader>
                    <ProgressBarTrack>
                      <ProgressBarFill $percent={percent} $warning={isCrowded} />
                    </ProgressBarTrack>
                  </CardMain>

                  {/* 맥락형 추천 스마트 액션 바 */}
                  <SmartActionRow>
                    {isCrowded ? (
                      <ActionChip $primary onClick={() => handleRegisterSeatSniper(room)}>
                        <Crosshair size={13} />
                        <span>자리 나면 알림 받기 (스나이퍼)</span>
                      </ActionChip>
                    ) : (
                      <ActionChip onClick={() => window.open("https://lib.inu.ac.kr", "_blank")}>
                        <CheckCircle size={13} />
                        <span>도서관 앱에서 바로 배정</span>
                      </ActionChip>
                    )}
                  </SmartActionRow>
                </CardItem>
              );
            })}
          </ListContainer>
        </SectionWrapper>
      )}

      {/* 탭 2: 스터디룸 및 공간 */}
      {activeTab === "study" && (
        <SectionWrapper>
          <SectionTop>
            <SectionTitle>스터디룸 & 세미나실 공간</SectionTitle>
            <NoticeText>이용 시작 20분 내 50% 이상 입실 필수</NoticeText>
          </SectionTop>

          <ListContainer>
            {studyRooms.map((sRoom) => (
              <CardItem key={sRoom.id}>
                <CardMain>
                  <RoomHeader>
                    <div>
                      <RoomName>{sRoom.name}</RoomName>
                      <RoomSub>{sRoom.location} · 정원 {sRoom.quota}</RoomSub>
                    </div>
                  </RoomHeader>
                  {sRoom.tags && sRoom.tags.length > 0 && (
                    <TagRow>
                      {sRoom.tags.map((t, idx) => (
                        <Tag key={idx}>{t}</Tag>
                      ))}
                    </TagRow>
                  )}
                </CardMain>

                {/* 맥락형 추천 스마트 액션 바 */}
                <SmartActionRow>
                  <ActionChip $primary onClick={() => handleRegisterStudySniper(sRoom)}>
                    <Crosshair size={13} />
                    <span>취소표 생기면 알림 (스나이퍼)</span>
                  </ActionChip>
                  <ActionChip onClick={() => window.open("https://lib.inu.ac.kr/#/facility/study-room", "_blank")}>
                    <ExternalLink size={13} />
                    <span>도서관 예약</span>
                  </ActionChip>
                </SmartActionRow>
              </CardItem>
            ))}
          </ListContainer>
        </SectionWrapper>
      )}

      {/* 탭 3: 내 이용 현황 */}
      {activeTab === "my" && (
        <SectionWrapper>
          <SectionTop>
            <SectionTitle>현재 내 좌석 이용 정보</SectionTitle>
          </SectionTop>

          {!isLinked ? (
            <EmptyBox>
              <Users size={32} color="#94a3b8" />
              <EmptyTitle>도서관 계정이 연동되지 않았습니다</EmptyTitle>
              <EmptyDesc>학번/비밀번호를 기기에 1회 등록하면 좌석 현황과 스마트 연장 기능을 사용할 수 있어요.</EmptyDesc>
              <PrimaryBtn onClick={() => navigate(ROUTES.MYPAGE.ROOT)}>계정 연동하기</PrimaryBtn>
            </EmptyBox>
          ) : mySeat ? (
            <MySeatCard>
              <MySeatBadge>이용 중</MySeatBadge>
              <MySeatRoom>{mySeat.roomName} {mySeat.seatName}</MySeatRoom>
              <MySeatTimeInfo>
                <span>이용 종료 예정: <strong>{mySeat.endTime}</strong></span>
              </MySeatTimeInfo>

              {/* 맥락형 추천 스마트 액션 버튼들 */}
              <MySeatActionGroup>
                <ActionButton $highlight onClick={handleRegisterSeatReminder}>
                  <Bell size={14} />
                  <span>만료 20분 전 알림 예약</span>
                </ActionButton>
                <ActionButton onClick={handleRenewSeat}>
                  <RotateCw size={14} />
                  <span>좌석 연장하기</span>
                </ActionButton>
                <ActionButton $danger onClick={handleReturnSeat}>
                  <LogOut size={14} />
                  <span>퇴실 반납</span>
                </ActionButton>
              </MySeatActionGroup>
            </MySeatCard>
          ) : (
            <EmptyBox>
              <BookOpen size={32} color="#94a3b8" />
              <EmptyTitle>현재 이용 중인 좌석이 없습니다</EmptyTitle>
              <EmptyDesc>열람실 현황 탭에서 잔여석을 확인하고 바로 배정받아 보세요!</EmptyDesc>
              <SecondaryBtn onClick={() => setActiveTab("seats")}>열람실 좌석 보러가기</SecondaryBtn>
            </EmptyBox>
          )}
        </SectionWrapper>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 12px ${MOBILE_PAGE_GUTTER} 40px;
  display: flex;
  flex-direction: column;
`;

const TabBar = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border-radius: 9px;
  border: none;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? "#0f172a" : "#64748b")};
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  box-shadow: ${({ $active }) => ($active ? "0 2px 6px rgba(0,0,0,0.05)" : "none")};
  cursor: pointer;
  position: relative;
`;

const ActiveDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  position: absolute;
  top: 8px;
  right: 14px;
`;

const ToastBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 14px;
  animation: fadeIn 0.3s ease;
  button {
    margin-left: auto;
    background: #2563eb;
    color: #fff;
    border: none;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
  }
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  .spin {
    animation: spin 1s linear infinite;
  }
`;

const NoticeText = styled.span`
  font-size: 11.5px;
  color: #94a3b8;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardItem = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RoomName = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
`;

const RoomSub = styled.div`
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
`;

const SeatCount = styled.span`
  font-size: 12.5px;
  color: #64748b;
`;

const AvailCount = styled.strong<{ $urgent: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $urgent }) => ($urgent ? "#ef4444" : "#2563eb")};
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressBarFill = styled.div<{ $percent: number; $warning: boolean }>`
  height: 100%;
  width: ${({ $percent }) => Math.min(100, Math.max(0, $percent))}%;
  background: ${({ $warning }) => ($warning ? "#ef4444" : "#2563eb")};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const Tag = styled.span`
  font-size: 10.5px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
`;

const SmartActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f8fafc;
  overflow-x: auto;
`;

const ActionChip = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${({ $primary }) => ($primary ? "#bfdbfe" : "#e2e8f0")};
  background: ${({ $primary }) => ($primary ? "#eff6ff" : "#ffffff")};
  color: ${({ $primary }) => ($primary ? "#1d4ed8" : "#475569")};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${({ $primary }) => ($primary ? "#dbeafe" : "#f8fafc")};
  }
`;

const MySeatCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MySeatBadge = styled.span`
  align-self: flex-start;
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  padding: 3px 8px;
  border-radius: 6px;
`;

const MySeatRoom = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
`;

const MySeatTimeInfo = styled.div`
  font-size: 13px;
  color: #64748b;
  strong {
    color: #1e293b;
  }
`;

const MySeatActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ $highlight?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $highlight, $danger }) => ($danger ? "#ef4444" : $highlight ? "#ffffff" : "#334155")};
  background: ${({ $highlight, $danger }) => ($danger ? "#fef2f2" : $highlight ? "#2563eb" : "#f1f5f9")};
  &:hover {
    opacity: 0.9;
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8fafc;
  border-radius: 16px;
  text-align: center;
  gap: 8px;
`;

const EmptyTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin-top: 6px;
`;

const EmptyDesc = styled.div`
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 260px;
`;

const PrimaryBtn = styled.button`
  margin-top: 10px;
  padding: 10px 18px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const SecondaryBtn = styled.button`
  margin-top: 10px;
  padding: 10px 18px;
  background: #e2e8f0;
  color: #334155;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;
