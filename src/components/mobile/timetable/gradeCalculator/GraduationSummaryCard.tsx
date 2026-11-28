import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { typography } from "@/styles/typography";
import type { GraduationEvaluation } from "@/types/graduation";
import type { ResolvedGraduationRule } from "@/utils/graduationRequirements";
import GraduationRequirementCard from "../GraduationRequirementCard";
import type { GraduationProfile } from "../GraduationSettingModal";
import {
  ActionButton,
  Badge,
  CardTitle,
  FoldTrigger,
  ProgressFill,
  ProgressTrack,
  SectionCard,
} from "./ui";

interface GraduationSummaryCardProps {
  profile: GraduationProfile;
  resolved: ResolvedGraduationRule | null;
  evaluation: GraduationEvaluation | null;
  requiredAverageGpa: number | null;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

/** 졸업까지 아직 못 채운 요건 수. 참고용(판정 불가) 항목은 세지 않는다. */
const countUnmetRequirements = (evaluation: GraduationEvaluation): number => {
  const credits = evaluation.credits.filter(
    (progress) => !progress.satisfied && !progress.unverifiable,
  ).length;
  const generalCourses = evaluation.requiredCourses.filter(
    (course) => course.status === "MISSING" || course.status === "PARTIAL",
  ).length;
  const majorCourses = evaluation.requiredMajorCourses?.some((c) => !c.done)
    ? 1
    : 0;
  const coreGeneral =
    evaluation.coreGeneral &&
    !evaluation.coreGeneral.unverifiable &&
    !evaluation.coreGeneral.satisfied
      ? 1
      : 0;
  return credits + generalCourses + majorCourses + coreGeneral;
};

/**
 * Figma "리디자인 / 메인"의 졸업요건 카드.
 * 접힘: 남은 요건 수 + 총 취득학점 진행도 + 전공필수 이수 수.
 * 펼침: 기존 졸업요건 상세(설정·출처·제보 포함)를 그대로 보여준다.
 *   (Figma "졸업요건 상세" 화면은 별도 페이지라 다음 작업에서 옮긴다.)
 */
export default function GraduationSummaryCard({
  profile,
  resolved,
  evaluation,
  requiredAverageGpa,
  expanded,
  onToggle,
  onEdit,
}: GraduationSummaryCardProps) {
  // Figma "빈 상태": 학과·학번이 없으면 설정 버튼만 보여준다.
  if (!profile.departmentCode || profile.entryYear === null) {
    return (
      <SectionCard $gap={14}>
        <CardTitle>졸업요건</CardTitle>
        <SetupText>
          학과·학번을 설정하면 남은 학점과 필수 과목을 알려드려요.
        </SetupText>
        <ActionButton type="button" $tone="outline" onClick={onEdit}>
          학과·학번 설정하기
        </ActionButton>
      </SectionCard>
    );
  }

  const total = evaluation?.credits.find(
    (progress) => progress.key === "total",
  );
  const unmet = evaluation ? countUnmetRequirements(evaluation) : null;
  const majorCourses = evaluation?.requiredMajorCourses;
  const majorDone = majorCourses?.filter((course) => course.done).length ?? 0;

  return (
    <SectionCard $gap={14}>
      <FoldTrigger type="button" onClick={onToggle} aria-expanded={expanded}>
        <TitleRow>
          <CardTitle as="span">졸업요건</CardTitle>
          {unmet !== null &&
            (unmet > 0 ? (
              <Badge $tone="warn">{unmet}개 남음</Badge>
            ) : (
              <Badge $tone="success">모두 충족</Badge>
            ))}
        </TitleRow>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} />
      </FoldTrigger>

      {expanded ? (
        <GraduationRequirementCard
          embedded
          profile={profile}
          resolved={resolved}
          evaluation={evaluation}
          requiredAverageGpa={requiredAverageGpa}
          onEdit={onEdit}
        />
      ) : total ? (
        <Summary>
          <ProgressTrack>
            <ProgressFill
              $ratio={total.required > 0 ? total.earned / total.required : 0}
              $done={total.satisfied}
            />
          </ProgressTrack>
          <CaptionRow>
            <span>
              {total.earned} / {total.required}학점
              {total.satisfied ? " · 충족" : ` · ${total.remaining}학점 남음`}
            </span>
            {majorCourses && majorCourses.length > 0 && (
              <MajorCount $done={majorDone === majorCourses.length}>
                전공필수 {majorDone}/{majorCourses.length}
              </MajorCount>
            )}
          </CaptionRow>
        </Summary>
      ) : (
        <SetupText>
          이 학과 졸업요건은 아직 준비 중이에요. 졸업 학점은 직접 설정할 수
          있어요.
        </SetupText>
      )}
    </SectionCard>
  );
}

const TitleRow = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SetupText = styled.p`
  ${typography.body2}
  margin: 0;
  color: var(--text-secondary);
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CaptionRow = styled.div`
  ${typography.caption1}
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-secondary);
  white-space: nowrap;
`;

const MajorCount = styled.span<{ $done: boolean }>`
  color: ${({ $done }) =>
    $done ? "var(--text-success)" : "var(--text-error)"};
`;
