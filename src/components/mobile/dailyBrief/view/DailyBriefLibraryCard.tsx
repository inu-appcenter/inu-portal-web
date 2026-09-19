import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getReadingRooms, LibrarySeatRoom } from "@/apis/library";
import { ROUTES } from "@/constants/routes";
import Icon from "@/components/common/Icon";

export default function DailyBriefLibraryCard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<LibrarySeatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void getReadingRooms()
      .then((data) => {
        if (isMounted) {
          // 열람실 관련 룸만 정제 (또는 상위 3~4개)
          const filtered = (data || []).filter((r) => {
            const name = r.name || "";
            return (
              name.includes("열람실") ||
              name.includes("자료실") ||
              name.includes("이룸관") ||
              name.includes("노트북")
            );
          });
          setRooms(filtered.length > 0 ? filtered : data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("도서관 열람실 조회 실패:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getSeatMetrics = (room: LibrarySeatRoom) => {
    const total = room.seats?.total ?? room.totalSeats ?? 0;
    const occupied = room.seats?.occupied ?? room.occupiedSeats ?? 0;
    const available =
      room.seats?.available ??
      room.availableSeats ??
      Math.max(total - occupied, 0);

    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
    let status = "여유";
    let statusColor = "#16A34A"; // green
    let statusBg = "#DCFCE7";

    if (percent >= 85) {
      status = "혼잡";
      statusColor = "#DC2626"; // red
      statusBg = "#FEE2E2";
    } else if (percent >= 60) {
      status = "보통";
      statusColor = "#2563EB"; // blue
      statusBg = "#DBEAFE";
    }

    return { total, occupied, available, percent, status, statusColor, statusBg };
  };

  const displayRooms = rooms.slice(0, 3);

  // 전체 잔여 좌석 합산
  const totalAvailable = rooms.reduce((acc, r) => {
    const m = getSeatMetrics(r);
    return acc + m.available;
  }, 0);

  return (
    <SectionWrapper>
      <ContextIntro>
        {isLoading
          ? "학산도서관 좌석 현황을 불러오고 있어요."
          : totalAvailable > 0
            ? `학산도서관에 지금 ${totalAvailable}석의 여유 좌석이 있어요.`
            : "학산도서관 열람실 실시간 좌석을 확인해 보세요."}
      </ContextIntro>
      <CardContainer onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
        <CardHeader>
          <HeaderLeft>
            <BookIconCircle>📖</BookIconCircle>
            <CardTitle>학산도서관 열람실</CardTitle>
          </HeaderLeft>
          <HeaderRightBadge>
            <span>좌석 예약</span>
            <Icon name="chevron-right" size={13} color="#2563EB" />
          </HeaderRightBadge>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <LoadingContainer>
              <LoadingPulse />
              <LoadingText>실시간 좌석 정보 동기화 중...</LoadingText>
            </LoadingContainer>
          ) : displayRooms.length === 0 ? (
            <EmptyWrapper>
              <EmptyText>현재 운영 중인 열람실 정보가 없어요</EmptyText>
            </EmptyWrapper>
          ) : (
            <RoomList>
              {displayRooms.map((room) => {
                const {
                  total,
                  available,
                  percent,
                  status,
                  statusColor,
                  statusBg,
                } = getSeatMetrics(room);

                return (
                  <RoomItem key={room.id}>
                    <RoomHeaderRow>
                      <RoomName>{room.name}</RoomName>
                      <RoomSeatCount>
                        <AvailableHighlight>{available}</AvailableHighlight>
                        <TotalText> / {total}석 잔여</TotalText>
                        <StatusBadge
                          $color={statusColor}
                          $bg={statusBg}
                        >
                          {status}
                        </StatusBadge>
                      </RoomSeatCount>
                    </RoomHeaderRow>

                    <ProgressBarTrack>
                      <ProgressBarFill
                        $percent={percent}
                        $color={statusColor}
                      />
                    </ProgressBarTrack>
                  </RoomItem>
                );
              })}
            </RoomList>
          )}
        </CardContent>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BookIconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const HeaderRightBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const RoomItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
`;

const RoomHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RoomName = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
`;

const RoomSeatCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AvailableHighlight = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
`;

const TotalText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
`;

const StatusBadge = styled.span<{ $color: string; $bg: string }>`
  font-size: 11px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  background-color: ${({ $bg }) => $bg};
  padding: 2px 6px;
  border-radius: 6px;
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background-color: #e2e8f0;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number; $color: string }>`
  width: ${({ $percent }) => Math.min(Math.max($percent, 0), 100)}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const LoadingContainer = styled.div`
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LoadingPulse = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: #3b82f6;
  animation: pulse 1.2s infinite ease-in-out;

  @keyframes pulse {
    0%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`;

const LoadingText = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  color: #64748b;
`;

const EmptyWrapper = styled.div`
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;
