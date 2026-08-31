import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { TimetableShareExtraData } from "@/types/chat";
import { ROUTES } from "@/constants/routes";

interface TimetableShareCardProps {
  extraData?: string | null;
  content?: string;
  isMe?: boolean;
}

const DAYS_KOREAN = ["월요일", "화요일", "수요일", "목요일", "금요일"];

const formatTime = (time: number) => {
  const h = Math.floor(time);
  const m = Math.round((time - h) * 60);
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
};

export default function TimetableShareCard({
  extraData,
  isMe,
}: TimetableShareCardProps) {
  const navigate = useNavigate();

  let parsedData: TimetableShareExtraData | null = null;
  if (extraData) {
    try {
      parsedData = JSON.parse(extraData);
    } catch (e) {
      console.error("Failed to parse TimetableShareExtraData", e);
    }
  }

  const friendIds = parsedData?.friendIds || [];
  const memberIds = parsedData?.memberIds || [];
  const topTimes = parsedData?.topFreeTimes || [];

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const queryParams = new URLSearchParams();
    if (memberIds.length > 0) {
      queryParams.set("memberIds", memberIds.join(","));
    } else if (friendIds.length > 0) {
      queryParams.set("ids", friendIds.join(","));
    }
    queryParams.set("tab", "free");
    navigate(`${ROUTES.TIMETABLE.COMPARE}?${queryParams.toString()}`);
  };

  return (
    <CardContainer $isMe={isMe} onClick={handleNavigate}>
      <CardBody>
        <SectionHeader>
          <Sparkles size={14} color="#D97706" />
          <span>만나기 좋은 시간 추천</span>
        </SectionHeader>

        {topTimes.length > 0 ? (
          <TimeList>
            {topTimes.slice(0, 3).map((slot, index) => (
              <TimeItem key={index}>
                <TimeLeft>
                  <DayBadge>{DAYS_KOREAN[slot.day] || "요일"}</DayBadge>
                  <TimeText>{`${formatTime(slot.startTime)} ~ ${formatTime(slot.endTime)}`}</TimeText>
                </TimeLeft>
                <DurationBadge>{formatDuration(slot.duration)}</DurationBadge>
              </TimeItem>
            ))}
          </TimeList>
        ) : (
          <EmptyText>겹치는 공강 시간을 확인해보세요!</EmptyText>
        )}
      </CardBody>

      <CardFooter>
        <span>공강 시간 확인하러 가기</span>
        <ChevronRight size={16} color="#3B82F6" strokeWidth={2.5} />
      </CardFooter>
    </CardContainer>
  );
}

const CardContainer = styled.div<{ $isMe?: boolean }>`
  /* 말풍선의 시간 영역까지 고려해 좁은 화면에서는 카드 폭을 함께 줄인다. */
  width: min(250px, calc(100vw - 128px));
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e8eb;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  margin-top: 4px;

  &:active {
    transform: scale(0.98);
  }
`;

const CardBody = styled.div`
  padding: 14px 16px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
`;

const TimeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TimeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
`;

const TimeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 120px;
  flex-wrap: wrap;
  min-width: 0;
`;

const DayBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #334155;
`;

const TimeText = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  overflow-wrap: anywhere;
`;

const DurationBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-left: auto;
`;

const EmptyText = styled.div`
  font-size: 12px;
  color: #8b95a1;
  text-align: center;
  padding: 8px 0;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;

  span {
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
    line-height: 18px;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  svg {
    flex-shrink: 0;
  }
`;
