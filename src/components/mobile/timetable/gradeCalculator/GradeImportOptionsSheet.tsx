import type { ReactNode } from "react";
import styled from "styled-components";
import { Calendar } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import Icon from "@/components/common/Icon";
import { typography } from "@/styles/typography";
import { Badge } from "./ui";

export type GradeImportMethod = "portal" | "paste" | "timetable";

interface GradeImportOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: GradeImportMethod) => void;
  /** 포털 가져오기가 진행 중이면 그 항목을 잠근다. */
  isFetchingPortal: boolean;
}

interface ImportOption {
  method: GradeImportMethod;
  icon: ReactNode;
  title: string;
  desc: string;
  recommended?: boolean;
}

const OPTIONS: ImportOption[] = [
  {
    method: "portal",
    icon: <Icon name="scholarship" size={20} />,
    title: "포털에서 가져오기",
    desc: "전 학기 성적을 한 번에 가져와요",
    recommended: true,
  },
  {
    method: "paste",
    icon: <Icon name="file-document" size={20} />,
    title: "성적표 붙여넣기",
    desc: "스마트캠퍼스 성적표를 복사해서 붙여넣어요",
  },
  {
    // Figma Icons/calendar는 Fontello 글리프가 없어 lucide를 쓴다.
    method: "timetable",
    icon: <Calendar size={20} />,
    title: "시간표에서 불러오기",
    desc: "시간표의 과목을 추가해요 (성적 미입력)",
  },
];

/** Figma "리디자인 / 성적 불러오기 시트"(7886:32675). 세 가지 불러오기 방법을 고른다. */
export default function GradeImportOptionsSheet({
  open,
  onOpenChange,
  onSelect,
  isFetchingPortal,
}: GradeImportOptionsSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} handle="compact">
      <Container>
        <TitleBlock>
          <Title>성적 불러오기</Title>
          {/* 시안 문구("이미 있는 과목은 건너뛰어요")는 현재 동작(학기 단위 덮어쓰기)과
              달라 실제 동작대로 적었다. */}
          <Desc>
            불러온 과목은 들은 학기에 들어가요. 이미 입력한 학기는 새 과목으로
            바뀌어요.
          </Desc>
        </TitleBlock>
        <OptionList>
          {OPTIONS.map((option) => {
            const disabled = option.method === "portal" && isFetchingPortal;
            return (
              <OptionButton
                key={option.method}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(option.method)}
              >
                <IconBox>{option.icon}</IconBox>
                <OptionText>
                  <OptionTitleRow>
                    <OptionTitle>{option.title}</OptionTitle>
                    {option.recommended && <Badge $tone="brand">추천</Badge>}
                  </OptionTitleRow>
                  <OptionDesc>
                    {disabled ? "가져오는 중..." : option.desc}
                  </OptionDesc>
                </OptionText>
                <Icon name="chevron-right" size={20} className="chevron" />
              </OptionButton>
            );
          })}
        </OptionList>
      </Container>
    </BottomSheet>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0 8px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h2`
  ${typography.title2}
  margin: 0;
  color: var(--text-primary);
`;

const Desc = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-tertiary);
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 12px 14px 14px;
  border: none;
  border-radius: 16px;
  background: var(--bg-subtle);
  text-align: left;
  cursor: pointer;

  .chevron {
    flex-shrink: 0;
    color: var(--text-tertiary);
  }

  &:active:not(:disabled) {
    box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.04);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const IconBox = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-base);
  color: var(--interactive-primary);
`;

const OptionText = styled.span`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const OptionTitleRow = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OptionTitle = styled.span`
  ${typography.label1}
  color: var(--text-primary);
`;

const OptionDesc = styled.span`
  ${typography.caption1}
  color: var(--text-secondary);
`;
