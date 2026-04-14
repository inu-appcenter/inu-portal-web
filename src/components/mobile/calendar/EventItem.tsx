import { useState } from "react";
import styled from "styled-components";
import { ScheduleType } from "@/types/schedules";
import useUserStore from "@/stores/useUserStore";
import { EventInput } from "@fullcalendar/core";
import { format, parseISO } from "date-fns";
import { ChevronDown, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "@/components/common/ActionButton";
import 챗불이요약이미지 from "@/resources/assets/calendar/챗불이요약.png";

interface EventItemProps extends EventInput {
  type: ScheduleType;
  description?: string;
  aiGenerated?: boolean;
  department?: string;
  sourceNoticeId?: number;
  sourceNoticeTitle?: string;
  url?: string;
}

const EventItem = (props: EventItemProps) => {
  const { userInfo } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = (start?: any, end?: any) => {
    if (!start || !end) return "";
    const s = format(parseISO(String(start)), "yyyy.MM.dd");
    const e = format(parseISO(String(end)), "yyyy.MM.dd");
    return `${s} ~ ${e}`;
  };

  const toggleOpen = () => {
    if (props.type === "dept") setIsOpen(!isOpen);
  };

  return (
    <EventItemWrapper>
      <EventHeader onClick={toggleOpen} $isClickable={props.type === "dept"}>
        <EventMainInfo>
          <EventInfo>
            <EventDot $type={props.type} />
            <EventTypeText>
              {props.type === "school"
                ? "학교"
                : props.type === "dept" &&
                  (props.department || userInfo.department)}
            </EventTypeText>
            <EventDate>{formatDateRange(props.start, props.end)}</EventDate>
          </EventInfo>
          <EventTitle>{props.title}</EventTitle>
        </EventMainInfo>

        {props.type === "dept" && (
          <ArrowIcon
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown size={20} />
          </ArrowIcon>
        )}
      </EventHeader>

      <AnimatePresence>
        {isOpen && props.type === "dept" && (
          <DetailWrapper
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <DetailContainer>
              <Description>{props.description}</Description>
              {props.aiGenerated && (
                <AiBadge>
                  <img src={챗불이요약이미지} alt="챗불이 요약 이미지" />
                  <AiText>
                    횃불이 <strong>AI</strong>로 생성된 콘텐츠입니다.
                    <br />
                    중요한 내용은 직접 확인하세요.
                  </AiText>
                </AiBadge>
              )}
              <InfoGrid>
                {props.sourceNoticeTitle && (
                  <InfoRow>
                    <InfoLabel>공지 원문</InfoLabel>
                    <InfoValue>{props.sourceNoticeTitle}</InfoValue>
                  </InfoRow>
                )}
              </InfoGrid>
              <DetailFooter>
                <Spacer /> {/* 왼쪽 균형용 빈 공간 */}
                {props.url && (
                  <ActionButton
                    href={props.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    공지사항 보기
                    <ExternalLink size={14} style={{ marginLeft: "8px" }} />
                  </ActionButton>
                )}
                <SirenWrapper
                  onClick={() => {
                    alert("오류 신고 기능 구현 예정입니다.");
                  }}
                >
                  🚨
                </SirenWrapper>
              </DetailFooter>
            </DetailContainer>
          </DetailWrapper>
        )}
      </AnimatePresence>
    </EventItemWrapper>
  );
};

export default EventItem;

const EventItemWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  //padding: 12px 0;
  &:last-child {
    border-bottom: none;
  }
`;

const EventHeader = styled.div<{ $isClickable: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const EventMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const EventInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EventDot = styled.div<{ $type: ScheduleType }>`
  width: 8px;
  height: 8px;
  background-color: ${({ $type }) =>
    $type === "dept" ? "#9AE1D9" : "#A4B6E6"};
  border-radius: 50%;
`;

const EventTypeText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #3a3a3c;
`;

const EventDate = styled.span`
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
`;

const EventTitle = styled.strong`
  font-size: 15px;
  color: #1c1c1e;
  padding-left: 16px;
`;

const ArrowIcon = styled(motion.div)`
  color: #5e92f0;
  display: flex;
  align-items: center;
  padding-top: 2px;
`;

const DetailWrapper = styled(motion.div)`
  overflow: hidden;
`;

const DetailContainer = styled.div`
  margin-top: 12px;
  margin-left: 16px;
  padding: 12px;
  background-color: #f8f8fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AiBadge = styled.div`
  display: flex;
  justify-content: end;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  font-size: 10px;
  color: gray;
  //padding: 2px 6px;
  border-radius: 4px;

  img {
    width: 18px;
  }
`;

const AiText = styled.span`
  display: block;
  line-height: 1.4;
  text-align: left;
  word-break: keep-all;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #48484a;
  margin: 0;
  white-space: pre-wrap;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid #e5e5ea;
  padding-top: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
`;

const InfoLabel = styled.span`
  color: #8e8e93;
  min-width: 50px;
`;

const InfoValue = styled.span`
  color: #3a3a3c;
`;

const DetailFooter = styled.div`
  display: flex;
  justify-content: space-between; // 양 끝과 중앙 배분
  align-items: center;
  width: 100%;
`;

const Spacer = styled.div`
  width: 30px; // 사이렌과 동일한 너비
`;

const SirenWrapper = styled.div`
  width: 30px; // 너비 고정
  font-size: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    font-size: 8px;
    line-height: 8px;
    color: darkred;
    font-weight: 600;
  }
`;
