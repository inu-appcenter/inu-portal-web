import { useEffect, useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import {
  WizardBottomCTA,
  WizardCard,
  WizardCheckRow,
} from "@/components/mobile/timetable/wizard/ui";

import {
  useCreateTimeTable,
  useCreateTimeTableCourseItem,
  useSemesterTimeTables,
} from "@/hooks/useTimeTables";
import { showToast } from "@/utils/toast";
import { mixpanelTrack } from "@/utils/mixpanel";
import { pickUniqueTimetableName } from "@/utils/timetableWizardFormat";
import type { WizardCandidate } from "@/types/timetableWizard";
import { typography } from "@/styles/typography";

interface WizardSaveCandidatesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: WizardCandidate[];
  semesterId: number | null;
  /**
   * 열릴 때 미리 체크해 둘 후보 id. 상세 화면에서 열면 보던 시간표 하나를 넘긴다.
   * 생략하면 추천 후보만 체크한 상태로 연다.
   */
  initialSelectedIds?: string[];
  /** 저장이 끝난 뒤 저장된 시간표 id들(선택 순서대로)을 넘긴다 */
  onSaved: (timeTableIds: number[]) => void;
}

// Figma: 시간표 / 과목속성 (일정추가) 3901:12300 — "어떤 시간표를 저장할까요?"
const WizardSaveCandidatesSheet = ({
  open,
  onOpenChange,
  candidates,
  semesterId,
  initialSelectedIds,
  onSaved,
}: WizardSaveCandidatesSheetProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setSaving] = useState(false);

  const { timeTables: semesterTimetables } = useSemesterTimeTables(
    semesterId ?? undefined,
  );
  const createTimeTableMutation = useCreateTimeTable();
  const createCourseItemMutation = useCreateTimeTableCourseItem();

  // 열 때마다 초기 선택에서 시작한다. 배열 참조가 렌더마다 바뀌어도 다시 덮지 않도록
  // 열리는 순간에만 반영한다.
  const initialKey = initialSelectedIds?.join(",");
  useEffect(() => {
    if (!open) return;
    setSelectedIds(
      initialKey !== undefined
        ? initialKey.split(",").filter(Boolean)
        : candidates.filter((c) => c.recommended).map((c) => c.id),
    );
  }, [open, candidates, initialKey]);

  const allSelected =
    candidates.length > 0 && selectedIds.length === candidates.length;

  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((selected) => selected !== id),
    );

  const handleSave = async () => {
    if (!semesterId || isSaving || selectedIds.length === 0) return;
    setSaving(true);

    const taken = new Set(semesterTimetables.map((t) => t.timeTableName));
    const savedIds: number[] = [];
    // 후보 순서(A → B → C)대로 저장해 목록에서도 같은 순서로 보이게 한다
    const targets = candidates.filter((c) => selectedIds.includes(c.id));

    try {
      for (const candidate of targets) {
        const timeTableName = pickUniqueTimetableName(candidate.label, taken);
        const created = await createTimeTableMutation.mutateAsync({
          semesterId,
          timeTableName,
        });
        taken.add(timeTableName);
        for (const course of candidate.courses) {
          await createCourseItemMutation.mutateAsync({
            timeTableId: created.id,
            body: { courseOfferingId: course.courseOfferingId },
          });
        }
        savedIds.push(created.id);
      }

      mixpanelTrack.timetableWizardAction("저장", {
        save_mode: "새 시간표",
        timetable_count: savedIds.length,
      });
      onOpenChange(false);
      onSaved(savedIds);
    } catch (error: unknown) {
      const serverMessage = (error as { response?: { data?: { msg?: string } } })
        ?.response?.data?.msg;
      // 앞의 시간표는 이미 저장됐을 수 있다 - 몇 개까지 됐는지 알려야 다시 시도할 때 중복이 안 생긴다
      showToast(
        savedIds.length > 0
          ? `${savedIds.length}개는 저장했지만 나머지는 실패했어요. ${serverMessage ?? ""}`.trim()
          : (serverMessage ?? "시간표 저장에 실패했어요. 잠시 후 다시 시도해 주세요."),
      );
      // 이미 저장된 후보는 선택에서 빼 둔다(그대로 다시 누르면 같은 시간표가 또 생긴다)
      const savedCandidateIds = targets.slice(0, savedIds.length).map((t) => t.id);
      setSelectedIds((prev) => prev.filter((id) => !savedCandidateIds.includes(id)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} zIndex={9000} handle="compact">
      <Content>
        <Header>
          <Title>어떤 시간표를 저장할까요?</Title>
          <Description>저장한 시간표는 시간표 목록에서 볼 수 있어요.</Description>
        </Header>
        <WizardCheckRow
          variant="compact"
          label="모두 저장"
          checked={allSelected}
          onCheckedChange={(checked) =>
            setSelectedIds(checked ? candidates.map((c) => c.id) : [])
          }
        />
        <WizardCard $radius={16} $subtle>
          {candidates.map((candidate) => (
            <WizardCheckRow
              key={candidate.id}
              label={candidate.label}
              checked={selectedIds.includes(candidate.id)}
              onCheckedChange={(checked) => toggle(candidate.id, checked)}
            />
          ))}
        </WizardCard>
      </Content>
      <WizardBottomCTA
        placement="sheet"
        loading={isSaving}
        disabled={selectedIds.length === 0 || !semesterId}
        onClick={handleSave}
      >
        {selectedIds.length > 1 ? `시간표 ${selectedIds.length}개 저장` : "시간표 저장"}
      </WizardBottomCTA>
    </BottomSheet>
  );
};

export default WizardSaveCandidatesSheet;

// 공용 BottomSheet의 좌우 20px에 4px을 더해 시안의 24px에 맞춘다
const Content = styled.div`
  padding: 0 4px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--text-primary, #191f28);
  ${typography.heading1}
`;

const Description = styled.p`
  margin: 0;
  color: var(--text-tertiary, #8b95a1);
  ${typography.body2}
`;
