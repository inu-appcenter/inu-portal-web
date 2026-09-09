import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { TimetableShareExtraData } from "@/types/chat";
import { ROUTES } from "@/constants/routes";

interface TimetableShareCardProps {
  extraData?: string | null;
  content?: string;
  isMe?: boolean;
}

const DAYS_SHORT_KOREAN = ["월", "화", "수", "목", "금", "토", "일"];

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

  const getSlotCountLabel = (slot: any, index: number) => {
    if (typeof slot.count === "number") {
      return `${slot.count}명`;
    }
    if (typeof slot.peopleCount === "number") {
      return `${slot.peopleCount}명`;
    }
    if (memberIds.length > 0) {
      return `${Math.max(1, memberIds.length - (index > 0 ? index : 0))}명`;
    }
    return formatDuration(slot.duration);
  };

  return (
    <CardContainer $isMe={isMe} onClick={handleNavigate}>
      <CardHeader>
        <Icon name="calendar-add" size={24} color="#0061FF" />
        <HeaderTitle>만나기 좋은 시간 추천</HeaderTitle>
      </CardHeader>

      {topTimes.length > 0 ? (
        <TimeList>
          {topTimes.slice(0, 3).map((slot, index) => (
            <TimeItem key={index}>
              <TimeInfoGroup>
                <DayText>{DAYS_SHORT_KOREAN[slot.day] || "요일"}</DayText>
                <TimeText>{`${formatTime(slot.startTime)} ~ ${formatTime(slot.endTime)}`}</TimeText>
              </TimeInfoGroup>
              <CountBadge $isTop={index === 0}>
                {getSlotCountLabel(slot, index)}
              </CountBadge>
            </TimeItem>
          ))}
        </TimeList>
      ) : (
        <EmptyText>겹치는 공강 시간을 확인해보세요!</EmptyText>
      )}

      <FooterButton>
        <span>공강 시간 확인하러 가기</span>
        <Icon name="chevron-right" size={16} color="#FFFFFF" />
      </FooterButton>
    </CardContainer>
  );
}

const CardContainer = styled.div<{ $isMe?: boolean }>`
  width: 248px;
  max-width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #d3e5ff;
  box-shadow: 0px 2px 8px 0px rgba(0, 97, 255, 0.07);
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  margin-top: 4px;

  &:active {
    transform: scale(0.98);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HeaderTitle = styled.span`
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #0061ff;
`;

const TimeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TimeItem = styled.div`
  background: #f8f9fb;
  border: 0.667px solid #e5e8eb;
  border-radius: 12px;
  padding: 4px 4px 4px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
`;

const TimeInfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
`;

const DayText = styled.span`
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #333d4b;
  flex-shrink: 0;
`;

const TimeText = styled.span`
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #333d4b;
  white-space: nowrap;
`;

const CountBadge = styled.div<{ $isTop?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ $isTop }) => ($isTop ? "#0061FF" : "#EFF6FF")};
  border: ${({ $isTop }) => ($isTop ? "none" : "1px solid #D3E5FF")};
  color: ${({ $isTop }) => ($isTop ? "#FFFFFF" : "#0061FF")};
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const EmptyText = styled.div`
  font-size: 12px;
  color: #8b95a1;
  text-align: center;
  padding: 8px 0;
`;

const FooterButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 16px;
  background: #0061ff;
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;

  span {
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: #ffffff;
    user-select: none;
  }
`;
