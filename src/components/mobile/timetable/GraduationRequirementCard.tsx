import { useState } from "react";
import styled from "styled-components";
import { AlertTriangle, Megaphone, Settings2 } from "lucide-react";
import Icon from "@/components/common/Icon";
import type {
  GraduationEvaluation,
  RequiredMajorCourseProgress,
} from "@/types/graduation";
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
  const [showDoneMajorCourses, setShowDoneMajorCourses] = useState(false);


  const emptyMessage = (() => {
    if (!profile.departmentCode || !profile.entryYear) {
      return "학과와 학번을 설정하면 남은 학점과 필수 과목을 알려드려요.";
    }
    return `${departmentTitle || "이 학과"} 졸업요건은 아직 준비 중이에요. 졸업 학점은 직접 설정할 수 있어요.`;
  })();


  if (!resolved || !evaluation)
    return <EmptyText>{emptyMessage}</EmptyText>

  // 면제(EXEMPT) 요건은 그 학과에 적용되지 않는 규정이라 아예 보여주지 않는다.
  const requiredCourses = evaluation.requiredCourses.filter(
    (course) => course.status !== "EXEMPT",
  );
  // 카드 상단 기준 안내는 하나만 띄운다: 다른 학번 기준으로 대체 > C(공통 기준) > B.
  const ruleNotice = (() => {
    if (!resolved.exact) {
      const { startYear, endYear } = resolved.rule;
      const range =
        endYear >= 2099 ? `${startYear}학번 이후` : `${startYear}~${endYear}학번`;
      return {
        tone: "warn" as const,
        text: `${profile.entryYear}학번 기준이 없어 가장 가까운 ${range} 기준으로 보여드려요. 다르다면 아래에서 제보해 주세요.`,
      };
    }
    if (resolved.department.confidence === "C") {
      return {
        tone: "info" as const,
        text: "학과 자료가 없어 학교 공통 기준으로 계산했어요. 정확한 기준은 학과 사무실에 확인해 주세요.",
      };
    }
    if (resolved.department.confidence === "B") {
      return {
        tone: "info" as const,
        text: "학과 홈페이지와 학교 공지를 바탕으로 정리한 기준이에요. 실제 졸업사정과 다를 수 있어요.",
      };
    }
    return null;
  })();
  // 전공필수는 학과마다 10~30과목이라 남은 과목만 펼쳐 두고 이수한 과목은 접는다.
  const { requiredMajorCourses } = evaluation;
  const missingMajorCourses =
    requiredMajorCourses?.filter((course) => !course.done) ?? [];
  const doneMajorCourses =
    requiredMajorCourses?.filter((course) => course.done) ?? [];

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

          {ruleNotice && (
            <NoticeBox $tone={ruleNotice.tone}>
              <AlertTriangle size={14} />
              <span>{ruleNotice.text}</span>
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

          {requiredMajorCourses && requiredMajorCourses.length > 0 && (
            <Section>
              <SectionTitle>
                전공필수 {doneMajorCourses.length} / {requiredMajorCourses.length}
                과목
              </SectionTitle>
              {missingMajorCourses.length === 0 ? (
                <SectionText>교육과정표의 전공필수 과목을 모두 들었어요.</SectionText>
              ) : (
                <CourseList>
                  {missingMajorCourses.map((course) => (
                    <MajorCourseRow key={course.courseName} course={course} />
                  ))}
                </CourseList>
              )}
              {doneMajorCourses.length > 0 && (
                <ToggleButton
                  type="button"
                  onClick={() => setShowDoneMajorCourses((open) => !open)}
                >
                  {showDoneMajorCourses
                    ? "이수한 과목 접기"
                    : `이수한 ${doneMajorCourses.length}과목 보기`}
                </ToggleButton>
              )}
              {showDoneMajorCourses && (
                <CourseList>
                  {doneMajorCourses.map((course) => (
                    <MajorCourseRow key={course.courseName} course={course} />
                  ))}
                </CourseList>
              )}
            </Section>
          )}

          {evaluation.coreGeneral && !evaluation.coreGeneral.unverifiable && (
            <Section>
              <SectionTitle>
                핵심교양 {evaluation.coreGeneral.courses.length} /{" "}
                {evaluation.coreGeneral.required}과목
              </SectionTitle>
              <AreaList>
                {evaluation.coreGeneral.courses.map((course, index) => (
                  <AreaTag key={`${course}-${index}`}>{course}</AreaTag>
                ))}
              </AreaList>
              {!evaluation.coreGeneral.satisfied && (
                <SectionText>
                  {evaluation.coreGeneral.required -
                    evaluation.coreGeneral.courses.length}
                  과목을 더 들어야 해요.
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
              <span>졸업요건 출처 보기</span>
              <Icon name="link-external" size={12} />
            </SourceLink>
          )}

          <ReportSection>
            <ReportText>
              졸업요건은 학사 개편이나 학과 공지에 따라 바뀔 수 있어요. 실제와
              다르면 알려주세요.
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

/** 전공기초·전공핵심 태그는 "기초"·"핵심"으로 줄인다. */
const MAJOR_DIVISION_LABELS: Record<RequiredMajorCourseProgress["division"], string> = {
  전공기초: "기초",
  전공핵심: "핵심",
  전공필수: "필수",
  전공심화: "심화",
};

function MajorCourseRow({ course }: { course: RequiredMajorCourseProgress }) {
  return (
    <CourseRow>
      <CourseName>
        <CategoryTag>{MAJOR_DIVISION_LABELS[course.division]}</CategoryTag>
        <span>{course.courseName}</span>
      </CourseName>
      <CourseStatus $status={course.done ? "DONE" : "MISSING"}>
        {course.done && <Icon name="check" size={14} />}
        <span>
          {course.done ? "이수" : `미이수 · ${course.credits}학점`}
        </span>
      </CourseStatus>
    </CourseRow>
  );
}

const Card = styled.div`
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
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
  color: var(--text-secondary);
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
  color: var(--text-brand);

  span {
    font-size: 13px;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-tertiary);
`;

const RuleSummary = styled.div`
  font-size: 13px;
  color: var(--text-tertiary);
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
      ? "var(--bg-warn)"
      : "var(--bg-subtle)"};
  color: ${({ $tone }) =>
    $tone === "warn"
      ? "var(--yellow-600)"
      : "var(--text-tertiary)"};

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
  color: var(--text-secondary);
`;

const Muted = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const ProgressValue = styled.span`
  font-size: 13px;
  color: var(--text-tertiary);

  strong {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-secondary);
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background-color: var(--bg-muted);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $ratio: number; $satisfied: boolean }>`
  width: ${({ $ratio }) => `${Math.round($ratio * 100)}%`};
  height: 100%;
  border-radius: 999px;
  background-color: ${({ $satisfied }) =>
    $satisfied
      ? "var(--border-success)"
      : "var(--interactive-primary)"};
  transition: width 0.3s ease;
`;

const ProgressCaption = styled.span<{ $satisfied: boolean }>`
  font-size: 12px;
  color: ${({ $satisfied }) =>
    $satisfied
      ? "#15803d"
      : "var(--text-tertiary)"};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
`;

const SectionText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-tertiary);

  strong {
    color: var(--text-brand);
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
  background-color: var(--bg-brand);
  font-size: 12px;
  color: var(--text-brand);
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
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CategoryTag = styled.span`
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 6px;
  background-color: var(--bg-subtle);
  font-size: 11px !important;
  color: var(--text-tertiary) !important;
`;

const CourseStatus = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  font-size: 12px;
  color: ${({ $status }) => {
    if ($status === "DONE") return "#15803d";
    if ($status === "MISSING") return "var(--text-error)";
    return "var(--text-tertiary)";
  }};
`;

const ToggleButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-brand);
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
    color: var(--text-tertiary);
  }
`;

const ReportSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
`;

const ReportText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--text-warn);
`;

const ReportButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: var(--bg-subtle);
  font-size: 13px;
  color: var(--text-brand);
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
  color: var(--text-brand);
  text-decoration: none;
`;
