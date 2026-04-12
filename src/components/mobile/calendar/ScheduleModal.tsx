import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import styled, { keyframes } from "styled-components";
import { EventInput } from "@fullcalendar/core";
import { ScheduleType } from "@/types/schedules";
import EventItem from "@/components/mobile/calendar/EventItem";
import { ko } from "date-fns/locale";
import { Fragment } from "react";
// Divider import (경로는 프로젝트 구조에 맞게 확인 필요)
import Divider from "@/components/common/Divider";

// 나타나는 애니메이션
const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

// 사라지는 애니메이션
const contentHide = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
`;

// 배경 흐림 애니메이션
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

interface ScheduleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  events: (EventInput & { type: ScheduleType })[];
}

export default function ScheduleModal({
  isOpen,
  onOpenChange,
  selectedDate,
  events,
}: ScheduleModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <HeaderContainer>
            <StyledTitle>
              {selectedDate && format(selectedDate, "M월 d일")}
              <span className="day">
                {selectedDate && format(selectedDate, "EEEE", { locale: ko })}
              </span>
            </StyledTitle>
          </HeaderContainer>

          <EventListContainer>
            {events.length > 0 ? (
              events.map((event, idx) => (
                <Fragment key={idx}>
                  <EventItem {...event} />
                  {idx < events.length - 1 && <Divider />}
                </Fragment>
              ))
            ) : (
              <EmptyMessage>일정이 없습니다.</EmptyMessage>
            )}
          </EventListContainer>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;

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
  min-height: 30vh;
  max-height: 65vh;
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
  font-weight: 700;
  color: #1c1c1e;
  font-size: 24px;
  .day {
    font-size: 16px;
    margin-left: 8px;
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
