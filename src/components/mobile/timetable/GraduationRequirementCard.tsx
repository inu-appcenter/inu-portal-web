import styled from "styled-components";
import { AlertTriangle, Megaphone, Settings2 } from "lucide-react";
import Icon from "@/components/common/Icon";
import type { GraduationEvaluation } from "@/types/graduation";
import type { ResolvedGraduationRule } from "@/utils/graduationRequirements";
import { MAX_GPA } from "@/utils/graduationRequirements";
import type { GraduationProfile } from "./GraduationSettingModal";
import findTitleOrCode from "@/utils/findTitleOrCode";

/** 졸업요건 변경 제보 구글폼 */
const REQUIREMENT_REPORT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc1DAOC2N_HVzsMa6JMoSOqckpkX39SkHbrZD_eKTtr2cfKqA/viewform";

interface GraduationRequirementCardProps {
  profile: GraduationProfile;
  resolved: ResolvedGraduationRule | null;
  evaluation: GraduationEvaluation | null;
  /** 목표 평점에 닿기 위해 남은 학점에서 받아야 하는 평균 평점 */
  requiredAverageGpa: number | null;
  onEdit: () => void;
}

const formatEnglishCertification = (
  certification: NonNullable<GraduationEvaluation["englishCertification"]>,
): string => {
  const parts: string[] = [];
  if (certification.toeic) parts.push(`TOEIC ${certification.toeic}`);
  if (certification.toeicSpeaking)
    parts.push(`TOEIC Speaking ${certification.toeicSpeaking}`);
  if (certification.opic) parts.push(`OPIc ${certification.opic}`);
  return parts.join(" · ");
};

export default function GraduationRequirementCard({
  profile,
  resolved,
  evaluation,
  requiredAverageGpa,
  onEdit,
}: GraduationRequirementCardProps) {
  const departmentTitle = findTitleOrCode(profile.departmentCode);


  const emptyMessage = (() => {
    if (!profile.departmentCode || !profile.entryYear) {
      return "학과와 학번을 설정하면 이수해야 할 학점과 남은 필수 과목을 알려드려요.";
    }
    return `아직 ${departmentTitle || "이 학과"}의 졸업요건 데이터가 없어요. 취득 학점은 직접 설정해 주세요.`;
  })();


  if (!resolved || !evaluation)
    return <EmptyText>{emptyMessage}</EmptyText>

  // 면제(EXEMPT) 요건은 그 학과에 적용되지 않는 규정이라 아예 보여주지 않는다.
  const requiredCourses = evaluation.requiredCourses.filter(
    (course) => course.status !== "EXEMPT",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>졸업요건</CardTitle>
        <EditButton onClick={onEdit}>
          <Settings2 size={14} />
          <span>설정</span>
        </EditButton>
      </CardHeader>

      {!resolved || !evaluation ? (
        <EmptyText>{emptyMessage}</EmptyText>
      ) : (
        <>
          <RuleSummary>
            {departmentTitle || resolved.department.departmentName} ·{" "}
            {profile.entryYear}학번 · {resolved.rule.track}
          </RuleSummary>

          {!resolved.exact && (
            <NoticeBox $tone="warn">
              <AlertTriangle size={14} />
              <span>
                유니님의 정보로 올바른 졸업요건 정보를 찾지 못했어요. 아래 "졸업요건 변경 제보하기" 버튼을 눌러 제보해주세요!
              </span>
            </NoticeBox>
          )}

          {resolved.department.confidence !== "A" && (
            <NoticeBox $tone="info">
              <AlertTriangle size={14} />
              <span>
                {resolved.department.confidence === "C"
                  ? "학과 자료를 확보하지 못해 대학 공통기준으로 추정한 값이에요. 학과 사무실에 꼭 확인해 주세요."
                  : "학과 최신 공지 기준으로 수집한 값이라 실제 적용 규정과 다를 수 있어요."}
              </span>
            </NoticeBox>
          )}

          <ProgressList>
            {evaluation.credits.map((progress) => {
              const ratio =
                progress.required > 0
                  ? Math.min(1, progress.earned / progress.required)
                  : 0;
              return (
                <ProgressItem key={progress.key}>
                  <ProgressTop>
                    <ProgressLabel>
                      {progress.label}
                      {progress.unverifiable && <Muted> (참고)</Muted>}
                    </ProgressLabel>
                    <ProgressValue>
                      <strong>{progress.earned}</strong>
                      <span> / {progress.required}</span>
                    </ProgressValue>
                  </ProgressTop>
                  <ProgressTrack>
                    <ProgressFill
                      $ratio={ratio}
                      $satisfied={progress.satisfied}
                    />
                  </ProgressTrack>
                  <ProgressCaption $satisfied={progress.satisfied}>
                    {progress.satisfied
                      ? "충족"
                      : `${progress.remaining}학점 남음`}
                  </ProgressCaption>
                </ProgressItem>
              );
            })}
          </ProgressList>

          {requiredCourses.length > 0 && (
            <Section>
              <SectionTitle>필수 교양</SectionTitle>
              <CourseList>

                {requiredCourses.map((course) => (
                  <CourseRow key={`${course.category}-${course.courseName}`}>
                    <CourseName>
                      <CategoryTag>{course.category}</CategoryTag>
                      <span>{course.courseName}</span>
                    </CourseName>
                    <CourseStatus $status={course.status}>
                      {course.status === "DONE" && <Icon name="check" size={14} />}
                      <span>
                        {course.status === "DONE" && "이수"}
                        {course.status === "PARTIAL" &&
                          `${course.earnedCredits}/${course.requiredCredits}학점`}
                        {course.status === "MISSING" &&
                          `미이수 · ${course.requiredCredits}학점`}
                        {course.status === "UNKNOWN" && "확인 필요"}
                      </span>
                    </CourseStatus>
                  </CourseRow>
                ))}
              </CourseList>
            </Section>
          )}

          {evaluation.coreGeneral && !evaluation.coreGeneral.unverifiable && (
            <Section>
              <SectionTitle>
                핵심교양 {evaluation.coreGeneral.areas.length} /{" "}
                {evaluation.coreGeneral.required}개 영역
              </SectionTitle>
              <AreaList>
                {evaluation.coreGeneral.areas.map((area) => (
                  <AreaTag key={area}>{area}</AreaTag>
                ))}
              </AreaList>
              {!evaluation.coreGeneral.satisfied && (
                <SectionText>
                  {evaluation.coreGeneral.required -
                    evaluation.coreGeneral.areas.length}
                  개 영역을 더 들어야 해요.
                </SectionText>
              )}
            </Section>
          )}

          {profile.targetGpa !== null && (
            <Section>
              <SectionTitle>목표 평점 {profile.targetGpa.toFixed(2)}</SectionTitle>
              {requiredAverageGpa === null ? (
                <SectionText>
                  남은 학점이 없어 목표 평점을 계산할 수 없어요.
                </SectionText>
              ) : requiredAverageGpa > MAX_GPA ? (
                <NoticeBox $tone="warn">
                  <AlertTriangle size={14} />
                  <span>
                    남은 {evaluation.remainingTotalCredits}학점을 모두 4.5로
                    받아도 목표 평점에 닿지 않아요.
                  </span>
                </NoticeBox>
              ) : (
                <SectionText>
                  남은 {evaluation.remainingTotalCredits}학점에서 평균{" "}
                  <strong>{requiredAverageGpa.toFixed(2)}</strong> 이상 받으면
                  목표에 닿아요.
                </SectionText>
              )}
            </Section>
          )}

          {evaluation.englishCertification && (
            <Section>
              <SectionTitle>영어졸업인증</SectionTitle>
              <SectionText>
                {formatEnglishCertification(evaluation.englishCertification)}{" "}
                이상 (학과 인정 시험 기준)
              </SectionText>
            </Section>
          )}

          {evaluation.notices.length > 0 && (
            <NoticeList>
              {evaluation.notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </NoticeList>
          )}

          {resolved.department.sourceUrl && (
            <SourceLink
              href={resolved.department.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>학과 졸업요건 안내 보기</span>
              <Icon name="link-external" size={12} />
            </SourceLink>
          )}

          <ReportSection>
            <ReportText>
              졸업요건은 학사 개편이나 학과 공지에 따라 바뀔 수 있어요. 실제
              규정과 다른 부분을 발견하면 알려주시면 반영할게요.
            </ReportText>
            <ReportButton
              href={REQUIREMENT_REPORT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Megaphone size={14} />
              <span>졸업요건 변경 제보하기</span>
            </ReportButton>
          </ReportSection>
        </>
      )}
    </Card>
  );
}

const Card = styled.div`
  background-color: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
  margin: 0;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  cursor: pointer;
  outline: none;
  color: var(--text-brand, #0061ff);

  span {
    font-size: 13px;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);
`;

const RuleSummary = styled.div`
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
`;

const NoticeBox = styled.div<{ $tone: "warn" | "info" }>`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 18px;
  background-color: ${({ $tone }) =>
    $tone === "warn"
      ? "var(--bg-warn-subtle, #fffaeb)"
      : "var(--bg-subtle, #f8f9fb)"};
  color: ${({ $tone }) =>
    $tone === "warn"
      ? "var(--yellow-600, #b58000)"
      : "var(--text-tertiary, #8b95a1)"};

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const ProgressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProgressTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

const ProgressLabel = styled.span`
  font-size: 13px;
  color: var(--text-secondary, #333d4b);
`;

const Muted = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
`;

const ProgressValue = styled.span`
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);

  strong {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-secondary, #333d4b);
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background-color: var(--bg-muted, #f1f3f5);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $ratio: number; $satisfied: boolean }>`
  width: ${({ $ratio }) => `${Math.round($ratio * 100)}%`};
  height: 100%;
  border-radius: 999px;
  background-color: ${({ $satisfied }) =>
    $satisfied
      ? "var(--border-success, #22c55e)"
      : "var(--interactive-primary, #3b82f6)"};
  transition: width 0.3s ease;
`;

const ProgressCaption = styled.span<{ $satisfied: boolean }>`
  font-size: 12px;
  color: ${({ $satisfied }) =>
    $satisfied
      ? "var(--text-success, #15803d)"
      : "var(--text-tertiary, #8b95a1)"};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
`;

const SectionText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);

  strong {
    color: var(--text-brand, #0061ff);
  }
`;

const AreaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const AreaTag = styled.span`
  padding: 4px 8px;
  border-radius: 8px;
  background-color: var(--bg-brand-subtle, #eff6ff);
  font-size: 12px;
  color: var(--text-brand, #0061ff);
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CourseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CourseName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  span {
    font-size: 13px;
    color: var(--text-secondary, #333d4b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CategoryTag = styled.span`
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 6px;
  background-color: var(--bg-subtle, #f8f9fb);
  font-size: 11px !important;
  color: var(--text-tertiary, #8b95a1) !important;
`;

const CourseStatus = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  font-size: 12px;
  color: ${({ $status }) => {
    if ($status === "DONE") return "var(--text-success, #15803d)";
    if ($status === "MISSING") return "var(--text-error, #ef4444)";
    return "var(--text-tertiary, #8b95a1)";
  }};
`;

const NoticeList = styled.ul`
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    font-size: 12px;
    line-height: 18px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const ReportSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const ReportText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--text-warning, #ff4d00);
`;

const ReportButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: var(--bg-subtle, #f8f9fb);
  font-size: 13px;
  color: var(--text-brand, #0061ff);
  text-decoration: none;

  svg {
    flex-shrink: 0;
  }
`;

const SourceLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-brand, #0061ff);
  text-decoration: none;
`;
