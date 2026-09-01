import styled from "styled-components";
import { ClipboardPaste, GraduationCap, Target } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";

interface GradeCalculatorIntroSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "졸업요건 설정하기"를 누르면 시트를 닫고 졸업요건 설정을 바로 연다. */
  onSetupGraduation: () => void;
}

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: "졸업요건 진단",
    desc: "학과와 학번만 고르면 남은 학점과 아직 안 들은 필수 교양을 한눈에 알려드려요.",
  },
  {
    icon: ClipboardPaste,
    title: "성적 붙여넣기",
    desc: "스마트캠퍼스 성적표를 복사해 붙여넣으면 과목이 한 번에 채워져요.",
  },
  {
    icon: Target,
    title: "목표 평점 계산",
    desc: "목표 평점을 정해두면 남은 학점에서 평균 몇 점을 받아야 하는지 계산해드려요.",
  },
] as const;

/**
 * 학점계산기에 처음 들어왔을 때 한 번만 뜨는 기능 소개 시트.
 * 다시 보여줄지 여부는 `@/utils/gradeCalculatorIntro`의 플래그가 관리한다.
 */
export default function GradeCalculatorIntroSheet({
  open,
  onOpenChange,
  onSetupGraduation,
}: GradeCalculatorIntroSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <SheetContainer>
        <NewBadge>NEW</NewBadge>
        <Title>
          학점계산기를 이용해보세요!
        </Title>

        <Highlights>
          {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <HighlightItem key={title}>
              <HighlightIcon>
                <Icon size={18} />
              </HighlightIcon>
              <HighlightBody>
                <HighlightTitle>{title}</HighlightTitle>
                <HighlightText>{desc}</HighlightText>
              </HighlightBody>
            </HighlightItem>
          ))}
        </Highlights>

        <Notice>
          졸업요건은 각 학과 홈페이지에서 수집한 정보이고, 최종 확인은 학과
          사무실에서 꼭 해주세요.
        </Notice>

        <ButtonGroup>
          <CapsuleButton variant="primary" fullWidth onClick={onSetupGraduation}>
            졸업요건 설정하기
          </CapsuleButton>
          <TextButton type="button" onClick={() => onOpenChange(false)}>
            나중에 볼게요
          </TextButton>
        </ButtonGroup>
      </SheetContainer>
    </BottomSheet>
  );
}

const SheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 8px;
`;

const NewBadge = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--text-primary, #191f28);
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: -0.02em;
  word-break: keep-all;
`;

const Highlights = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`;

const HighlightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: var(--bg-subtle, #f2f4f6);
`;

const HighlightIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-brand, #0061ff);
  background: var(--bg-base, #ffffff);
`;

const HighlightBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HighlightTitle = styled.strong`
  color: var(--text-primary, #191f28);
  font-size: 14px;
  font-weight: 600;
`;

const HighlightText = styled.p`
  margin: 0;
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  line-height: 1.5;
  word-break: keep-all;
`;

const Notice = styled.p`
  margin: 0;
  color: var(--text-disabled, #b0b8c1);
  font-size: 12px;
  line-height: 1.5;
  word-break: keep-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 4px;

  /* 시트 안에서는 CapsuleButton 기본 20px가 커서 본문 톤에 맞춰 줄인다. */
  button {
    font-size: 16px;
    line-height: 24px;
  }
`;

const TextButton = styled.button`
  padding: 10px 12px;
  border: none;
  background: none;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
`;
