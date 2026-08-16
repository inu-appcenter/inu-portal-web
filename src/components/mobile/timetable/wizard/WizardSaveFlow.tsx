import { useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Modal from "@/components/common/Modal";
import CapsuleButton from "@/components/common/CapsuleButton";
import InputField from "@/components/common/InputField";
import {
  useCreateTimeTable,
  useCreateTimeTableCourseItem,
  useDeleteTimeTableItem,
  useSemesterTimeTables,
  useTimeTableDetail,
} from "@/hooks/useTimeTables";
import { formatSemester } from "@/utils/semester";
import type { WizardCandidate } from "@/types/timetableWizard";
import { mixpanelTrack } from "@/utils/mixpanel";

interface WizardSaveFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: WizardCandidate;
  semesterId: number | null;
  /** 저장 완료 후 "더 많은 후보 생성"을 선택했을 때. 위시리스트 등 조건은 그대로 둔 채 재생성만 트리거한다. */
  onGenerateMore: () => void;
  /** 저장 완료 후 "시간표 보러 가기"를 선택했을 때. 저장된 시간표 id를 넘긴다. */
  onViewTimetable: (timeTableId: number) => void;
}

type SaveMode = "new" | "overwrite";

const WizardSaveFlow = ({
  open,
  onOpenChange,
  candidate,
  semesterId,
  onGenerateMore,
  onViewTimetable,
}: WizardSaveFlowProps) => {
  const [mode, setMode] = useState<SaveMode>("new");
  const [targetTimetableId, setTargetTimetableId] = useState<number | null>(null);
  const [isOverwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);
  // 새 시간표 이름 입력 모달. "이미 있는 이름이면 저장 실패"를 저장 시도 후에야
  // 알게 되는 게 아니라, 저장 전에 사용자가 직접 이름을 정하고 실패 시 즉시 고칠 수 있게 한다.
  const [isNameModalOpen, setNameModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  // 저장 완료 후 "더 많은 후보 생성 / 시간표 보러 가기"를 고르는 모달. 저장된 시간표 id를 들고 있는다.
  const [savedTimetableId, setSavedTimetableId] = useState<number | null>(null);

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
      await createCourseItemMutation.mutateAsync({
        timeTableId,
        body: { courseOfferingId: course.courseOfferingId },
      });
    }
  };

  const handleConfirmSaveAsNew = async () => {
    const timeTableName = nameDraft.trim();
    if (!semesterId || isSaving || !timeTableName) return;
    setSaving(true);
    try {
      const created = await createTimeTableMutation.mutateAsync({
        semesterId,
        timeTableName,
      });
      await addCandidateCourses(created.id);
      mixpanelTrack.timetableWizardAction("저장", {
        save_mode: "새 시간표",
        course_count: candidate.courses.length,
      });
      setNameModalOpen(false);
      onOpenChange(false);
      setSavedTimetableId(created.id);
    } catch (error: any) {
      // 이름 모달은 닫지 않는다 - 실패 원인이 대개 이름 중복이라, 사용자가 바로 고쳐 재시도할 수 있어야 한다.
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
        if (item.id == null) continue;
        await deleteItemMutation.mutateAsync({
          timeTableId: targetTimetableId,
          timeTableItemId: item.id,
        });
      }
      await addCandidateCourses(targetTimetableId);
      mixpanelTrack.timetableWizardAction("저장", {
        save_mode: "덮어쓰기",
        course_count: candidate.courses.length,
        replaced_item_count: existingItems.length,
      });
      setOverwriteConfirmOpen(false);
      onOpenChange(false);
      setSavedTimetableId(targetTimetableId);
    } catch (error: any) {
      alert(error.response?.data?.msg || "시간표 덮어쓰기에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (mode === "new") {
      setNameDraft(candidate.label);
      setNameModalOpen(true);
    } else if (!targetTimetableId) {
      alert("덮어쓸 시간표를 선택해주세요.");
    } else {
      setOverwriteConfirmOpen(true);
    }
  };

  return (
    <>
      {/* 덮어쓰기 확인 Modal(z-index 9999)이 항상 이 시트보다 위에 오도록 기본값(10000)보다 낮게 지정 */}
      <BottomSheet open={open} onOpenChange={onOpenChange} zIndex={9000}>
        <SheetTitle>어떻게 저장할까요?</SheetTitle>

        <OptionRow $active={mode === "new"} onClick={() => setMode("new")}>
          <RadioCircle $active={mode === "new"} />
          <OptionText>
            <OptionTitle $active={mode === "new"}>새 시간표로 저장</OptionTitle>
            <OptionSubtitle>{candidate.label}가 새 시간표로 추가돼요</OptionSubtitle>
          </OptionText>
        </OptionRow>

        <OptionRow $active={mode === "overwrite"} onClick={() => setMode("overwrite")}>
          <RadioCircle $active={mode === "overwrite"} />
          <OptionText>
            <OptionTitle $active={mode === "overwrite"}>기존 시간표 덮어쓰기</OptionTitle>
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
          // Figma는 파괴적 확정 버튼을 진한 빨강 채움으로 표현 — 공용 danger variant(파스텔)는
          // 다른 화면(필터 미저장 이탈 등)과 공유하므로 그대로 두고 이 버튼만 override
          style: { background: "#dc322f", color: "#ffffff" },
        }}
      />

      <Modal
        isOpen={isNameModalOpen}
        onClose={() => setNameModalOpen(false)}
        title="시간표 이름"
        description="새로 만들 시간표의 이름을 정해주세요."
        secondaryButton={{ text: "취소", onClick: () => setNameModalOpen(false) }}
        primaryButton={{
          text: "저장",
          variant: "brand",
          loading: isSaving,
          disabled: !nameDraft.trim() || isSaving,
          onClick: handleConfirmSaveAsNew,
        }}
      >
        <InputField
          label="시간표 이름"
          value={nameDraft}
          onChange={setNameDraft}
          placeholder="예: 시안 A"
        />
      </Modal>

      <Modal
        isOpen={savedTimetableId !== null}
        onClose={() => setSavedTimetableId(null)}
        title="시간표를 저장했어요"
        description="더 많은 후보를 만들거나, 저장한 시간표를 바로 확인할 수 있어요."
        secondaryButton={{
          text: "더 많은 후보 생성",
          onClick: () => {
            setSavedTimetableId(null);
            onGenerateMore();
          },
        }}
        primaryButton={{
          text: "시간표 보러 가기",
          variant: "brand",
          onClick: () => {
            const id = savedTimetableId;
            setSavedTimetableId(null);
            if (id !== null) onViewTimetable(id);
          },
        }}
      />
    </>
  );
};

export default WizardSaveFlow;

const SheetTitle = styled.h2`
  margin: 4px 0 16px;
  color: var(--text-primary, #191f28);
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
`;

const OptionRow = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "var(--bg-brand, #eff6ff)" : "var(--bg-subtle, #f8f9fb)")};
  border-width: ${({ $active }) => ($active ? "1.5px" : "1px")};
  border-style: solid;
  border-color: ${({ $active }) =>
    $active ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
`;

const RadioCircle = styled.span<{ $active: boolean }>`
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-base, #ffffff);
  border: ${({ $active }) =>
    $active
      ? "6px solid var(--interactive-primary, #3b82f6)"
      : "1.5px solid var(--border-default, #e5e8eb)"};
  box-sizing: border-box;
  transition: border-width 0.15s ease;
`;

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OptionTitle = styled.span<{ $active: boolean }>`
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  line-height: 23px;
`;

const OptionSubtitle = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  line-height: 18px;
`;

const TargetDropdownWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 4px 4px;
`;

const TargetLabel = styled.span`
  color: var(--text-secondary, #333d4b);
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
  line-height: 52px;
  box-sizing: border-box;
`;

const SaveButtonWrap = styled.div`
  padding: 16px 4px calc(8px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
`;
