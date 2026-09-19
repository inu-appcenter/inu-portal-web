import { useState, useEffect } from "react";
import styled from "styled-components";
import { getUpcomingLmsAssignments, LmsAssignmentEvent } from "@/apis/lms";
import Icon from "@/components/common/Icon";

const INU_LMS_URL = "https://lms.inu.ac.kr";

export default function DailyBriefLmsCard() {
  const [assignments, setAssignments] = useState<LmsAssignmentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void getUpcomingLmsAssignments(7)
      .then((data) => {
        if (isMounted) {
          setAssignments(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("LMS 과제 조회 실패:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenLms = (url?: string) => {
    window.open(url || INU_LMS_URL, "_blank", "noopener,noreferrer");
  };

  const urgentList = assignments.slice(0, 3);

  const getDDayText = (daysRemaining?: number) => {
    if (daysRemaining === undefined) return "마감 임박";
    if (daysRemaining <= 0) return "D-Day";
    return `D-${daysRemaining}`;
  };

  return (
    <SectionWrapper>
      <ContextIntro>
        {urgentList.length > 0
          ? `마감 임박한 이러닝 과제가 ${urgentList.length}개 있어요.`
          : "이러닝 과제 및 동영상 출석을 확인해 보세요."}
      </ContextIntro>
      <CardContainer onClick={() => handleOpenLms()}>
        <CardHeader>
          <HeaderLeft>
            <LmsIconCircle>📝</LmsIconCircle>
            <CardTitle>이러닝 과제 알림</CardTitle>
          </HeaderLeft>
          <HeaderRightBadge>
            <span>이러닝 열기</span>
            <Icon name="link-external" size={13} color="#2563EB" />
          </HeaderRightBadge>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <LoadingContainer>
              <LoadingPulse />
              <LoadingText>이러닝 과제 확인 중...</LoadingText>
            </LoadingContainer>
          ) : urgentList.length === 0 ? (
            <EmptyBox>
              <EmptyEmoji>🎉</EmptyEmoji>
              <EmptyTitle>마감 임박한 과제가 없어요!</EmptyTitle>
              <EmptySubtitle>
                모든 과제를 제출했거나 예정된 과제가 없습니다.
              </EmptySubtitle>
            </EmptyBox>
          ) : (
            <AssignmentList>
              {urgentList.map((item) => (
                <AssignmentItem
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLms(item.url);
                  }}
                >
                  <ItemLeft>
                    <CourseName>
                      {item.course?.fullname || item.course?.shortname || "강좌"}
                    </CourseName>
                    <AssignmentTitle>{item.name}</AssignmentTitle>
                  </ItemLeft>
                  <DDayBadge $urgent={Boolean(item.isUrgent)}>
                    {getDDayText(item.daysRemaining)}
                  </DDayBadge>
                </AssignmentItem>
              ))}
            </AssignmentList>
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
  background: rgba(255, 255, 255, 0.65);
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const LmsIconCircle = styled.div`
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
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const HeaderRightBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssignmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AssignmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: #f8fafc;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f1f5f9;
  }
`;

const ItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
  padding-right: 10px;
`;

const CourseName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AssignmentTitle = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DDayBadge = styled.span<{ $urgent?: boolean }>`
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ $urgent }) => ($urgent ? "#fee2e2" : "#e0f2fe")};
  color: ${({ $urgent }) => ($urgent ? "#dc2626" : "#0284c7")};
  white-space: nowrap;
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

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  text-align: center;
`;

const EmptyEmoji = styled.span`
  font-size: 28px;
  margin-bottom: 6px;
`;

const EmptyTitle = styled.h4`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const EmptySubtitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
`;
