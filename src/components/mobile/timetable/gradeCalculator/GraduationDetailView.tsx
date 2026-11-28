import { useState } from "react";
import styled from "styled-components";
import { Siren } from "lucide-react";
import Icon from "@/components/common/Icon";
import { typography } from "@/styles/typography";
import type {
  GraduationEvaluation,
  RequiredCourseProgress,
  RequiredMajorCourseProgress,
} from "@/types/graduation";
import type { ResolvedGraduationRule } from "@/utils/graduationRequirements";
import findTitleOrCode from "@/utils/findTitleOrCode";
import type { GraduationProfile } from "../GraduationSettingModal";
import CreditProgressRow from "./CreditProgressRow";
import {
  REQUIREMENT_REPORT_FORM_URL,
  formatEnglishCertification,
  getRuleNotice,
} from "./graduationText";
import { ActionButton, Badge, CardTitle, SectionCard } from "./ui";

interface GraduationDetailViewProps {
  profile: GraduationProfile;
  resolved: ResolvedGraduationRule;
  evaluation: GraduationEvaluation;
  onEdit: () => void;
}

/**
 * Figma "시간표 / 학점계산기 / 리디자인 / 졸업요건 상세".
 * 학점계산기 화면 안에서 전체 화면으로 연다(작성 중인 성적을 그대로 쓰기 위해
 * 라우트를 나누지 않는다). 헤더·뒤로가기는 학점계산기 페이지가 맡는다.
 */
export default function GraduationDetailView({
  profile,
  resolved,
  evaluation,
  onEdit,
}: GraduationDetailViewProps) {
  const [showDoneMajorCourses, setShowDoneMajorCourses] = useState(false);

  const departmentTitle =
    findTitleOrCode(profile.departmentCode) ||
    resolved.department.departmentName;
  const notice = getRuleNotice(resolved, profile.entryYear);

  const total = evaluation.credits.find((progress) => progress.key === "total");

  // 면제(EXEMPT) 요건은 그 학과에 적용되지 않는 규정이라 보여주지 않는다.
  const requiredCourses = evaluation.requiredCourses.filter(
    (course) => course.status !== "EXEMPT",
  );
  const requiredDone = requiredCourses.filter(
    (course) => course.status === "DONE",
  ).length;

  // 전공필수는 학과마다 10~30과목이라 남은 과목만 펼쳐 두고 이수한 과목은 접는다.
  const majorCourses = evaluation.requiredMajorCourses ?? [];
  const missingMajor = majorCourses.filter((course) => !course.done);
  const doneMajor = majorCourses.filter((course) => course.done);

  const { coreGeneral, englishCertification } = evaluation;

  return (
    <Body>
      {/* 학과·학번 */}
      <SectionCard $gap={14}>
        <ProfileRow>
          <ProfileText>
            <strong>
              {departmentTitle} · {profile.entryYear}학번
            </strong>
            <span>
              {resolved.rule.track} · 졸업{" "}
              {resolved.rule.generalRequirements.minTotalCredits}학점
            </span>
          </ProfileText>
          <TextButton type="button" onClick={onEdit}>
            변경
          </TextButton>
        </ProfileRow>
        {notice && (
          <NoticeBox $tone={notice.tone}>
            <Icon
              name={notice.tone === "warn" ? "triangle-warning" : "info"}
              size={16}
            />
            <span>{notice.text}</span>
          </NoticeBox>
        )}
      </SectionCard>

      {/* 학점 */}
      <SectionCard $gap={14}>
        <TitleRow>
          <CardTitle>학점</CardTitle>
          {total &&
            (total.satisfied ? (
              <Badge $tone="success">충족</Badge>
            ) : (
              <Badge $tone="warn">{total.remaining}학점 남음</Badge>
            ))}
        </TitleRow>
        {evaluation.credits.map((progress) => (
          <CreditProgressRow key={progress.key} progress={progress} />
        ))}
      </SectionCard>

      {/* 전공필수 */}
      {majorCourses.length > 0 && (
        <SectionCard $gap={14}>
          <TitleRow>
            <CardTitle>전공필수</CardTitle>
            <Badge $tone={missingMajor.length === 0 ? "success" : "danger"}>
              {doneMajor.length} / {majorCourses.length}과목
            </Badge>
          </TitleRow>
          {missingMajor.length === 0 ? (
            <BodyText>교육과정표의 전공필수 과목을 모두 들었어요.</BodyText>
          ) : (
            <CourseList>
              {missingMajor.map((course) => (
                <MajorCourseRow key={course.courseName} course={course} />
              ))}
            </CourseList>
          )}
          {doneMajor.length > 0 && (
            <>
              <ToggleButton
                type="button"
                aria-expanded={showDoneMajorCourses}
                onClick={() => setShowDoneMajorCourses((open) => !open)}
              >
                {showDoneMajorCourses
                  ? "이수한 과목 접기"
                  : `이수한 ${doneMajor.length}과목 보기`}
                <Icon
                  name={showDoneMajorCourses ? "chevron-up" : "chevron-down"}
                  size={16}
                />
              </ToggleButton>
              {showDoneMajorCourses && (
                <CourseList>
                  {doneMajor.map((course) => (
                    <MajorCourseRow key={course.courseName} course={course} />
                  ))}
                </CourseList>
              )}
            </>
          )}
          {missingMajor.length > 0 && (
            <Caption>
              개설 학기를 확인해 시간표에 넣어 두세요. 택1 과목이나 이름이 바뀐
              과목은 직접 확인해 주세요.
            </Caption>
          )}
        </SectionCard>
      )}

      {/* 필수 교양 (시안에는 없지만 기존에 보여 주던 판정이라 같은 모양으로 둔다) */}
      {requiredCourses.length > 0 && (
        <SectionCard $gap={14}>
          <TitleRow>
            <CardTitle>필수 교양</CardTitle>
            <Badge
              $tone={
                requiredDone === requiredCourses.length ? "success" : "danger"
              }
            >
              {requiredDone} / {requiredCourses.length}과목
            </Badge>
          </TitleRow>
          <CourseList>
            {requiredCourses.map((course) => (
              <RequiredCourseRow
                key={`${course.category}-${course.courseName}`}
                course={course}
              />
            ))}
          </CourseList>
        </SectionCard>
      )}

      {/* 핵심교양 */}
      {coreGeneral && !coreGeneral.unverifiable && (
        <SectionCard $gap={14}>
          <TitleRow>
            <CardTitle>핵심교양</CardTitle>
            {coreGeneral.satisfied ? (
              <Badge $tone="success">충족</Badge>
            ) : (
              <Badge $tone="danger">
                {coreGeneral.courses.length} / {coreGeneral.required}과목
              </Badge>
            )}
          </TitleRow>
          {coreGeneral.courses.length > 0 && (
            <TagList>
              {coreGeneral.courses.map((course, index) => (
                <Badge key={`${course}-${index}`}>{course}</Badge>
              ))}
            </TagList>
          )}
          {!coreGeneral.satisfied && (
            <BodyText>
              {coreGeneral.required - coreGeneral.courses.length}과목을 더
              들어야 해요.
            </BodyText>
          )}
        </SectionCard>
      )}

      {/* 영어졸업인증: 성적으로는 판정할 수 없어 기준만 안내한다. */}
      {englishCertification && (
        <SectionCard $gap={14}>
          <TitleRow>
            <CardTitle>영어졸업인증</CardTitle>
            <Badge>확인 필요</Badge>
          </TitleRow>
          <BodyText>
            {formatEnglishCertification(englishCertification)} 이상 (학과 인정
            시험 기준)
          </BodyText>
        </SectionCard>
      )}

      {evaluation.notices.length > 0 && (
        <NoticeList>
          {evaluation.notices.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </NoticeList>
      )}

      {/* 출처·제보 */}
      <Footer>
        {resolved.department.sourceUrl && (
          <SourceLink
            href={resolved.department.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            출처: {departmentTitle} 졸업요건 안내
            <Icon name="link-external" size={14} />
          </SourceLink>
        )}
        <ActionButton
          as="a"
          href={REQUIREMENT_REPORT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: "100%", flex: "none", textDecoration: "none" }}
        >
          <Siren size={20} strokeWidth={1.75} />
          잘못된 정보 제보하기
        </ActionButton>
      </Footer>
    </Body>
  );
}

function MajorCourseRow({ course }: { course: RequiredMajorCourseProgress }) {
  return (
    <CourseRow>
      <CourseName>
        <Badge>{course.division}</Badge>
        <span>{course.courseName}</span>
      </CourseName>
      <CourseMeta $done={course.done}>
        {course.done ? "이수" : `${course.credits}학점`}
      </CourseMeta>
    </CourseRow>
  );
}

function RequiredCourseRow({ course }: { course: RequiredCourseProgress }) {
  const meta = (() => {
    switch (course.status) {
      case "DONE":
        return "이수";
      case "PARTIAL":
        return `${course.earnedCredits}/${course.requiredCredits}학점`;
      case "UNKNOWN":
        return "확인 필요";
      default:
        return `${course.requiredCredits}학점`;
    }
  })();
  return (
    <CourseRow>
      <CourseName>
        <Badge>{course.category}</Badge>
        <span>{course.courseName}</span>
      </CourseName>
      <CourseMeta $done={course.status === "DONE"}>{meta}</CourseMeta>
    </CourseRow>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding-bottom: 48px;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ProfileText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  strong {
    ${typography.title3}
    color: var(--text-primary);
  }

  span {
    ${typography.caption1}
    color: var(--text-tertiary);
  }
`;

const TextButton = styled.button`
  ${typography.label2}
  flex-shrink: 0;
  padding: 4px 0;
  border: none;
  background: none;
  color: var(--text-brand);
  cursor: pointer;
`;

const NoticeBox = styled.div<{ $tone: "warn" | "info" }>`
  ${typography.caption1}
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ $tone }) =>
    $tone === "warn" ? "var(--bg-warn)" : "var(--bg-muted)"};
  color: ${({ $tone }) =>
    $tone === "warn" ? "var(--text-warn)" : "var(--text-secondary)"};

  > i,
  > svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CourseList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const CourseRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-default);
`;

const CourseName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  > span:last-child {
    ${typography.label1}
    overflow: hidden;
    color: var(--text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CourseMeta = styled.span<{ $done: boolean }>`
  ${typography.caption1}
  flex-shrink: 0;
  color: ${({ $done }) =>
    $done ? "var(--text-success)" : "var(--text-tertiary)"};
`;

const ToggleButton = styled.button`
  ${typography.caption1}
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 2px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const BodyText = styled.p`
  ${typography.body2}
  margin: 0;
  color: var(--text-secondary);
`;

const Caption = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-tertiary);
`;

const NoticeList = styled.ul`
  ${typography.caption1}
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0 4px 0 20px;
  color: var(--text-tertiary);
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
`;

const SourceLink = styled.a`
  ${typography.label2}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
`;
