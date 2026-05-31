import { Drawer } from "vaul";
import styled from "styled-components";
import CapsuleButton from "@/components/common/CapsuleButton";
import { ClassItem } from "./TimetableGrid";

interface ClassDetailBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: ClassItem | null;
  allEvents: ClassItem[];
  colorMap: Map<string, string>;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const DAYS_KOREAN = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
];

const formatHour = (hour: number) => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function ClassDetailBottomSheet({
  open,
  onOpenChange,
  selectedClass,
  allEvents,
  colorMap,
  onEdit,
  onDelete,
}: ClassDetailBottomSheetProps) {
  if (!selectedClass) return null;

  const matchingClasses = allEvents
    .filter((e) => e.name === selectedClass.name)
    .sort((a, b) => a.day - b.day || a.startTime - b.startTime);

  const dotColor =
    colorMap.get(selectedClass.name) || "var(--text-brand, #0061FF)";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} modal={true}>
      <Drawer.Portal>
        <StyledOverlay />
        <StyledContent>
          <SheetInner>
            <DragHeader>
              <HandleBar />
            </DragHeader>

            <ContentArea>
              <ScrollableBody>
                <HeaderSection>
                  <TitleLine>
                    <ColorDot $color={dotColor} />
                    <ClassTitle>{selectedClass.name}</ClassTitle>
                  </TitleLine>

                  <ScheduleList>
                    {matchingClasses.map((item, idx) => {
                      const dayStr = DAYS_KOREAN[item.day] || "요일";
                      const timeStr = `${formatHour(item.startTime)} ~ ${formatHour(item.endTime)}`;
                      return (
                        <ScheduleItem key={`schedule-${item.id}-${idx}`}>
                          {dayStr} · {timeStr}
                        </ScheduleItem>
                      );
                    })}
                  </ScheduleList>
                </HeaderSection>

                <InfoField>
                  <FieldLabel>교수명</FieldLabel>
                  <FieldValue>{selectedClass.professor || "김인천"}</FieldValue>
                </InfoField>

                <InfoField>
                  <FieldLabel>강의실</FieldLabel>
                  <FieldValue>{selectedClass.room || "07-407"}</FieldValue>
                </InfoField>

                <InfoField>
                  <FieldLabel>메모</FieldLabel>
                  <FieldValue>
                    {selectedClass.memo || "중간고사 4/22, 기말고사 6/17"}
                  </FieldValue>
                </InfoField>
              </ScrollableBody>

              <FooterSection>
                <CapsuleButton.Group gap={12}>
                  <CapsuleButton
                    variant="brand"
                    onClick={() => {
                      if (onEdit) onEdit(selectedClass.id);
                      onOpenChange(false);
                    }}
                  >
                    수정
                  </CapsuleButton>
                  <CapsuleButton
                    variant="danger"
                    onClick={() => {
                      if (onDelete) onDelete(selectedClass.id);
                      onOpenChange(false);
                    }}
                  >
                    삭제
                  </CapsuleButton>
                </CapsuleButton.Group>
              </FooterSection>
            </ContentArea>
          </SheetInner>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const StyledOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 999;
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  outline: none;

  height: auto;
  min-height: 60dvh;
  max-height: 85dvh;
  display: flex;
  flex-direction: column;

  max-width: 768px;
  margin: 0 auto;
`;

const SheetInner = styled.div`
  background: var(--bg-base);
  width: 100%;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* flex item 높이 제한 해제 */
`;

const DragHeader = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HandleBar = styled.div`
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: var(--border-default);
`;

const ContentArea = styled.div`
  padding: 8px 20px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* flex item 높이 제한 해제 */
  overflow: hidden;
`;

const ScrollableBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0; /* flex item 높이 제한 해제 */

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;

  border-bottom: 2px solid var(--border-default);
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const ClassTitle = styled.h2`
  overflow: hidden;
  color: var(--text-primary);
  text-overflow: ellipsis;
  margin: 0;

  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 20px;
`;

const ScheduleItem = styled.div`
  color: var(--text-secondary);

  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const InfoField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid var(--border-default);
  padding: 8px 12px;
`;

const FieldLabel = styled.span`
  overflow: hidden;
  color: var(--text-tertiary);
  text-overflow: ellipsis;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const FieldValue = styled.span`
  overflow: hidden;
  color: var(--text-primary);
  text-overflow: ellipsis;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const FooterSection = styled.div`
  padding-top: 16px;
  flex-shrink: 0;
`;
