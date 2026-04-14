import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Fragment, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { getScheduleById } from "@/apis/schedules";
import Divider from "@/components/common/Divider";
import EventItem from "@/components/mobile/calendar/EventItem";
import AI_LOGO from "@/resources/assets/calendar/챗불이요약.png";
import { ScheduleEvent, toScheduleEvent } from "@/types/schedules";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const contentHide = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

interface ScheduleModalProps {
  scheduleId?: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
  events?: ScheduleEvent[];
  isLoading?: boolean;
}

export default function ScheduleModal({
  scheduleId,
  isOpen,
  onOpenChange,
  selectedDate,
  events,
  isLoading: externalLoading = false,
}: ScheduleModalProps) {
  const [schedule, setSchedule] = useState<ScheduleEvent | null>(null);
  const [isSingleScheduleLoading, setIsSingleScheduleLoading] = useState(false);

  const isListMode = events !== undefined;

  useEffect(() => {
    if (scheduleId == null) {
      setSchedule(null);
      return;
    }

    let isIgnored = false;

    const fetchSchedule = async () => {
      setIsSingleScheduleLoading(true);

      try {
        const response = await getScheduleById(scheduleId);

        if (!isIgnored) {
          setSchedule(toScheduleEvent(response.data));
        }
      } catch (error) {
        console.error("일정 정보를 불러오지 못했습니다.", error);

        if (!isIgnored) {
          setSchedule(null);
        }
      } finally {
        if (!isIgnored) {
          setIsSingleScheduleLoading(false);
        }
      }
    };

    fetchSchedule();

    return () => {
      isIgnored = true;
    };
  }, [scheduleId]);

  const renderTitle = () => {
    if (isListMode && selectedDate) {
      return (
        <StyledTitle>
          {format(selectedDate, "M월 d일")}
          <span className="day">
            {format(selectedDate, "EEEE", { locale: ko })}
          </span>
        </StyledTitle>
      );
    }

    return (
      <Title>
        <img src={AI_LOGO} alt="횃불이AI" />
        <span>
          <strong>횃불이 AI</strong> 캘린더
        </span>
      </Title>
    );
  };

  const renderSingleSchedule = () => {
    if (scheduleId == null) {
      return null;
    }

    if (isSingleScheduleLoading) {
      return <EmptyMessage>로딩 중...</EmptyMessage>;
    }

    if (!schedule) {
      return <EmptyMessage>일정 정보를 불러오지 못했습니다.</EmptyMessage>;
    }

    return <EventItem {...schedule} isOpenMode={true} />;
  };

  const renderScheduleList = () => {
    if (!isListMode) {
      return null;
    }

    if (externalLoading) {
      return <EmptyMessage>로딩 중...</EmptyMessage>;
    }

    if (!events || events.length === 0) {
      return <EmptyMessage>연결된 일정이 없습니다.</EmptyMessage>;
    }

    return (
      <EventListContainer>
        {events.map((event, idx) => (
          <Fragment key={event.id}>
            <EventItem {...event} isOpenMode={events.length <= 1} />
            {idx < events.length - 1 && <Divider />}
          </Fragment>
        ))}
      </EventListContainer>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <HeaderContainer>{renderTitle()}</HeaderContainer>
          {renderSingleSchedule()}
          {renderScheduleList()}
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);

  &[data-state="open"] {
    animation: ${fadeIn} 200ms ease-out;
  }

  &[data-state="closed"] {
    animation: ${fadeOut} 200ms ease-in;
  }
`;

const StyledContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 20px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15),
    0 4px 6px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 450px;
  min-height: 200px;
  max-height: 70vh;
  padding: 24px;
  z-index: 1001;
  display: flex;
  flex-direction: column;

  &[data-state="open"] {
    animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state="closed"] {
    animation: ${contentHide} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:focus {
    outline: none;
  }
`;

const HeaderContainer = styled.div`
  flex-shrink: 0;
`;

const StyledTitle = styled(Dialog.Title)`
  margin: 0;
  font-weight: 600;
  color: #1c1c1e;
  font-size: 24px;

  .day {
    font-size: 16px;
    margin-left: 8px;
    color: #8e8e93;
  }
`;

const Title = styled(Dialog.Title)`
  margin: 0;

  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 500;
  color: #1c1c1e;

  img {
    width: 28px;
    margin-right: 4px;
    vertical-align: middle;
  }
`;

const EventListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
  margin-top: 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e5e5ea;
    border-radius: 2px;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #8e8e93;
  font-size: 14px;
  margin: auto 0;
`;
