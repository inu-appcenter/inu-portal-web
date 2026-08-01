import { useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Modal from "@/components/common/Modal";
import CapsuleButton from "@/components/common/CapsuleButton";
import {
  useCreateTimeTable,
  useCreateTimeTableCourseItem,
  useDeleteTimeTableItem,
  useSemesterTimeTables,
  useTimeTableDetail,
} from "@/hooks/useTimeTables";
import { formatSemester } from "@/utils/semester";
import type { WizardCandidate } from "@/types/timetableWizard";

interface WizardSaveFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: WizardCandidate;
  semesterId: number | null;
  onSaved: () => void;
}

type SaveMode = "new" | "overwrite";

const WizardSaveFlow = ({
  open,
  onOpenChange,
  candidate,
  semesterId,
  onSaved,
}: WizardSaveFlowProps) => {
  const [mode, setMode] = useState<SaveMode>("new");
  const [targetTimetableId, setTargetTimetableId] = useState<number | null>(null);
  const [isOverwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const { timeTables: semesterTimetables } = useSemesterTimeTables(
    semesterId ?? undefined,
  );
  const { detail: targetDetail } = useTimeTableDetail(
    mode === "overwrite" ? targetTimetableId : null,
  );

  const createTimeTableMutation = useCreateTimeTable();
  const createCourseItemMutation = useCreateTimeTableCourseItem();
  const deleteItemMutation = useDeleteTimeTableItem();

  const targetTimetable = semesterTimetables.find((t) => t.id === targetTimetableId);

  const addCandidateCourses = async (timeTableId: number) => {
    for (const course of candidate.courses) {
      // 서버에 courseOfferingId 조회 API가 없어(inu-portal-server#279) 임시로 courseId를
      // courseOfferingId 자리에 전달한다. 기존 강의 추가 플로우(MobileTimeTableEditPage)와 동일한 우회.
      await createCourseItemMutation.mutateAsync({
        timeTableId,
        body: { courseOfferingId: course.courseId },
      });
    }
  };

  const handleSaveAsNew = async () => {
    if (!semesterId || isSaving) return;
    setSaving(true);
    try {
      const created = await createTimeTableMutation.mutateAsync({
        semesterId,
        timeTableName: `${candidate.label} (마법사 추천)`,
      });
      await addCandidateCourses(created.id);
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      alert(error.response?.data?.msg || "시간표 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmOverwrite = async () => {
    if (!targetTimetableId || isSaving) return;
    setSaving(true);
    try {
      const existingItems = targetDetail?.items ?? [];
      for (const item of existingItems) {
        await deleteItemMutation.mutateAsync({
          timeTableId: targetTimetableId,
          timeTableItemId: item.id,
        });
      }
      await addCandidateCourses(targetTimetableId);
      setOverwriteConfirmOpen(false);
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      alert(error.response?.data?.msg || "시간표 덮어쓰기에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (mode === "new") {
      handleSaveAsNew();
    } else if (!targetTimetableId) {
      alert("덮어쓸 시간표를 선택해주세요.");
    } else {
      setOverwriteConfirmOpen(true);
    }
  };

  return (
    <>
      <BottomSheet open={open} onOpenChange={onOpenChange} showCloseButton>
        <SheetTitle>어떻게 저장할까요?</SheetTitle>

        <OptionRow onClick={() => setMode("new")}>
          <RadioCircle $active={mode === "new"} />
          <OptionText>
            <OptionTitle>새 시간표로 저장</OptionTitle>
            <OptionSubtitle>{candidate.label}가 새 시간표로 추가돼요</OptionSubtitle>
          </OptionText>
        </OptionRow>

        <OptionRow onClick={() => setMode("overwrite")}>
          <RadioCircle $active={mode === "overwrite"} />
          <OptionText>
            <OptionTitle>기존 시간표 덮어쓰기</OptionTitle>
            <OptionSubtitle>선택한 시간표의 강의가 전부 바뀌어요</OptionSubtitle>
          </OptionText>
        </OptionRow>

        {mode === "overwrite" && (
          <TargetDropdownWrap>
            <TargetLabel>덮어쓸 시간표</TargetLabel>
            <SelectBox
              value={targetTimetableId ?? ""}
              onChange={(e) => setTargetTimetableId(Number(e.target.value) || null)}
            >
              <option value="">선택하세요</option>
              {semesterTimetables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.timeTableName} ({formatSemester(t.year, t.term)})
                </option>
              ))}
            </SelectBox>
          </TargetDropdownWrap>
        )}

        <SaveButtonWrap>
          <CapsuleButton
            variant="primary"
            fullWidth
            loading={isSaving}
            disabled={mode === "overwrite" && !targetTimetableId}
            onClick={handleSaveClick}
          >
            저장
          </CapsuleButton>
        </SaveButtonWrap>
      </BottomSheet>

      <Modal
        isOpen={isOverwriteConfirmOpen}
        onClose={() => setOverwriteConfirmOpen(false)}
        title="기존 강의가 모두 사라져요"
        description={
          targetTimetable
            ? `'${targetTimetable.timeTableName}'에 등록된 강의 ${targetDetail?.items.length ?? 0}개가 삭제되고 ${candidate.label}로 교체돼요. 되돌릴 수 없어요.`
            : ""
        }
        secondaryButton={{ text: "취소", onClick: () => setOverwriteConfirmOpen(false) }}
        primaryButton={{
          text: "덮어쓰기",
          variant: "danger",
          loading: isSaving,
          onClick: handleConfirmOverwrite,
        }}
      />
    </>
  );
};

export default WizardSaveFlow;

const SheetTitle = styled.h2`
  margin: 4px 0 16px;
  color: var(--gray-900, #191f28);
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  cursor: pointer;
`;

const RadioCircle = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid
    ${({ $active }) => ($active ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)")};

  &::after {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--border-brand, #0061ff);
    transform: scale(${({ $active }) => ($active ? 1 : 0)});
    transition: transform 0.15s ease;
  }
`;

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
`;

const OptionSubtitle = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  line-height: 18px;
`;

const TargetDropdownWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 4px 4px;
`;

const TargetLabel = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 500;
`;

const SelectBox = styled.select`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-primary, #333d4b);
  font-size: 15px;
  font-weight: 500;
  box-sizing: border-box;
`;

const SaveButtonWrap = styled.div`
  padding: 16px 4px calc(8px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
`;
