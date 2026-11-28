import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Icon from "@/components/common/Icon";
import Switch from "@/components/common/Switch";
import { typography } from "@/styles/typography";
import { getSubjectCategoryLabel, type EditableSubject } from "./subject";

interface SubjectEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: EditableSubject | null;
  /** "26년 1학기" 같은 학기 라벨 */
  semesterLabel: string;
  onChange: (patch: Partial<EditableSubject>) => void;
  onDelete: () => void;
}

const MIN_CREDITS = 1;
const MAX_CREDITS = 6;

/**
 * Figma "리디자인 / 대안 · 과목 편집 시트"(7935:32880, C-2).
 * 과목명을 누르면 열린다. 성적은 행의 네이티브 피커(C-3)에서 고르므로 여기엔 없다.
 */
export default function SubjectEditSheet({
  open,
  onOpenChange,
  subject,
  semesterLabel,
  onChange,
  onDelete,
}: SubjectEditSheetProps) {
  const category = subject ? getSubjectCategoryLabel(subject) : null;
  const meta = subject
    ? [semesterLabel, category, subject.grade || "성적 미입력"]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} handle="compact">
      {subject && (
        <Container>
          <TitleBlock>
            <NameInput
              value={subject.name}
              placeholder="과목명 입력"
              aria-label="과목명"
              onChange={(e) => onChange({ name: e.target.value })}
            />
            <Meta>{meta}</Meta>
          </TitleBlock>

          <Options>
            <OptionRow>
              <OptionLabel>학점</OptionLabel>
              <Stepper>
                <StepButton
                  type="button"
                  aria-label="학점 줄이기"
                  disabled={subject.credits <= MIN_CREDITS}
                  onClick={() =>
                    onChange({
                      credits: Math.max(MIN_CREDITS, subject.credits - 1),
                    })
                  }
                >
                  <Icon name="remove-minus" size={24} />
                </StepButton>
                <StepValue>{subject.credits}</StepValue>
                <StepButton
                  type="button"
                  aria-label="학점 늘리기"
                  disabled={subject.credits >= MAX_CREDITS}
                  onClick={() =>
                    onChange({
                      credits: Math.min(MAX_CREDITS, subject.credits + 1),
                    })
                  }
                >
                  <Icon name="add-plus-sm" size={24} />
                </StepButton>
              </Stepper>
            </OptionRow>

            <OptionRow>
              <OptionText>
                <OptionLabel>전공 평점에 포함</OptionLabel>
                <OptionHint>이수구분이 전공이면 자동으로 켜져요</OptionHint>
              </OptionText>
              <Switch
                checked={subject.isMajor}
                onCheckedChange={(checked) => onChange({ isMajor: checked })}
              />
            </OptionRow>

            <OptionRow>
              <OptionText>
                <OptionLabel>재수강 과목</OptionLabel>
                <OptionHint>이전 성적은 평점에서 빼요</OptionHint>
              </OptionText>
              <Switch
                checked={Boolean(subject.excluded)}
                onCheckedChange={(checked) => onChange({ excluded: checked })}
              />
            </OptionRow>
          </Options>

          <DeleteRow>
            <DeleteButton type="button" onClick={onDelete}>
              과목 삭제
            </DeleteButton>
          </DeleteRow>
        </Container>
      )}
    </BottomSheet>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0 8px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NameInput = styled.input`
  ${typography.title2}
  width: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: none;
  color: var(--text-primary);

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const Meta = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-tertiary);
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const OptionText = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const OptionLabel = styled.span`
  ${typography.label1}
  color: var(--text-primary);
`;

const OptionHint = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StepButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  cursor: pointer;

  &:disabled {
    color: var(--text-disabled);
    cursor: default;
  }
`;

const StepValue = styled.span`
  ${typography.title3}
  min-width: 12px;
  text-align: center;
  color: var(--text-primary);
`;

const DeleteRow = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4px;
`;

const DeleteButton = styled.button`
  ${typography.label2}
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--text-error);
  cursor: pointer;
`;
