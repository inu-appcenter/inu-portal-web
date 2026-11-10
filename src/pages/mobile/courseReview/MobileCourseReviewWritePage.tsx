import { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Badge from "@/components/common/Badge";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import { useCreateCourseReview } from "@/hooks/useCourseReviews";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import type {
  GradeSatisfaction,
  AssignmentAmount,
  TeamProject,
  ExamCount,
  AttendanceType,
} from "@/types/courseReview";

export default function MobileCourseReviewWritePage() {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const courseId = Number(courseIdParam);
  const location = useLocation();
  const navigate = useNavigate();

  const { courses } = useCourses();
  const { courseOfferings } = useCourseOfferings();
  const { timetables } = useTimetableStore();

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id === courseId);
  }, [courses, courseId]);

  const courseTitle =
    currentCourse?.title ||
    (location.state as any)?.courseTitle ||
    "강의평 작성";

  // 해당 과목의 교수 목록
  const professors = useMemo(() => {
    const set = new Set<string>();
    courseOfferings
      .filter((o): o is typeof o & { professor: string } => o.courseId === courseId && Boolean(o.professor))
      .forEach((o) => {
        const prof = o.professor.trim();
        if (prof && prof !== "-") {
          set.add(prof);
        }
      });
    return Array.from(set);
  }, [courseOfferings, courseId]);

  const defaultProfessor = (location.state as any)?.professor || professors[0] || "";

  // 폼 상태
  const [professor, setProfessor] = useState<string>(defaultProfessor);
  const [year, setYear] = useState<number>(2026);
  const [term, setTerm] = useState<number>(1);
  const [rating, setRating] = useState<number>(5);
  const [gradeSatisfaction, setGradeSatisfaction] = useState<GradeSatisfaction>("GENEROUS");
  const [assignmentAmount, setAssignmentAmount] = useState<AssignmentAmount>("NORMAL");
  const [teamProject, setTeamProject] = useState<TeamProject>("NONE");
  const [examCount, setExamCount] = useState<ExamCount>("TWICE");
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("ELECTRONIC");
  const [content, setContent] = useState<string>("");

  // 수강 인증 여부 체크 (시간표 스토어 기준)
  const isEnrolledLocally = useMemo(() => {
    return timetables.some((tt) =>
      tt.events.some(
        (e) => e.numericCourseId === courseId || e.name === courseTitle,
      ),
    );
  }, [timetables, courseId, courseTitle]);

  const createMutation = useCreateCourseReview(courseId);

  useHeader({
    title: "강의평 작성",
    showAlarm: false,
    showSearch: false,
    hasback: true,
  });

  const isContentValid = content.trim().length >= 20;
  const isFormValid = Boolean(professor && isContentValid);

  const handleSubmit = () => {
    if (!isFormValid || createMutation.isPending) return;

    createMutation.mutate(
      {
        professor,
        year,
        term,
        rating,
        gradeSatisfaction,
        assignmentAmount,
        teamProject,
        examCount,
        attendanceType,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          alert("강의평이 성공적으로 등록되었습니다!");
          navigate(ROUTES.COURSE.REVIEW(courseId), { replace: true });
        },
        onError: (err: any) => {
          alert(err.response?.data?.msg || "강의평 등록에 실패했습니다.");
        },
      },
    );
  };

  return (
    <PageWrapper>
      <CourseHeader>
        <CourseTitleText>{courseTitle}</CourseTitleText>
        {isEnrolledLocally && <Badge text="수강생 인증 완료" />}
      </CourseHeader>

      {/* 1. 수강 정보 선택 섹션 */}
      <FormSection>
        <SectionTitle>수강 정보</SectionTitle>

        <FormRow>
          <FieldLabel>수강 학기</FieldLabel>
          <SelectWrapper>
            <StyledSelect
              value={`${year}-${term}`}
              onChange={(e) => {
                const [y, t] = e.target.value.split("-").map(Number);
                setYear(y);
                setTerm(t);
              }}
            >
              <option value="2026-1">2026년 1학기</option>
              <option value="2025-2">2025년 2학기</option>
              <option value="2025-1">2025년 1학기</option>
              <option value="2024-2">2024년 2학기</option>
              <option value="2024-1">2024년 1학기</option>
            </StyledSelect>
          </SelectWrapper>
        </FormRow>

        <FormRow>
          <FieldLabel>담당 교수</FieldLabel>
          {professors.length > 0 ? (
            <ChipRadioRow>
              {professors.map((p) => (
                <ChipRadio
                  key={p}
                  type="button"
                  $selected={professor === p}
                  onClick={() => setProfessor(p)}
                >
                  {p} 교수
                </ChipRadio>
              ))}
            </ChipRadioRow>
          ) : (
            <StyledInput
              type="text"
              placeholder="교수명을 입력하세요"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
            />
          )}
        </FormRow>
      </FormSection>

      {/* 2. 총점 별점 선택 */}
      <FormSection>
        <SectionTitle>총점 평가</SectionTitle>
        <StarPickerContainer>
          <StarPickerRow>
            {[1, 2, 3, 4, 5].map((i) => (
              <StarButton
                key={i}
                type="button"
                onClick={() => setRating(i)}
                $active={i <= rating}
              >
                ★
              </StarButton>
            ))}
          </StarPickerRow>
          <RatingDescriptionText>
            {rating === 5 && "최고의 강의예요"}
            {rating === 4 && "추천하는 좋은 강의예요"}
            {rating === 3 && "보통이에요"}
            {rating === 2 && "아쉬운 점이 많아요"}
            {rating === 1 && "추천하지 않아요"}
          </RatingDescriptionText>
        </StarPickerContainer>
      </FormSection>

      {/* 3. 5대 세부 지표 선택 */}
      <FormSection>
        <SectionTitle>세부 평가 항목</SectionTitle>

        <FieldBlock>
          <FieldLabel>학점 비율</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={gradeSatisfaction === "GENEROUS"}
              onClick={() => setGradeSatisfaction("GENEROUS")}
            >
              너그러움
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={gradeSatisfaction === "NORMAL"}
              onClick={() => setGradeSatisfaction("NORMAL")}
            >
              보통
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={gradeSatisfaction === "STRICT"}
              onClick={() => setGradeSatisfaction("STRICT")}
            >
              깐깐함
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>과제량</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={assignmentAmount === "MANY"}
              onClick={() => setAssignmentAmount("MANY")}
            >
              많음
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={assignmentAmount === "NORMAL"}
              onClick={() => setAssignmentAmount("NORMAL")}
            >
              보통
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={assignmentAmount === "FEW"}
              onClick={() => setAssignmentAmount("FEW")}
            >
              적음
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>조모임 (팀플)</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={teamProject === "MANY"}
              onClick={() => setTeamProject("MANY")}
            >
              많음
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={teamProject === "NORMAL"}
              onClick={() => setTeamProject("NORMAL")}
            >
              보통
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={teamProject === "NONE"}
              onClick={() => setTeamProject("NONE")}
            >
              없음
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>시험 횟수</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={examCount === "TWICE"}
              onClick={() => setExamCount("TWICE")}
            >
              2회 (중간+기말)
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={examCount === "ONCE"}
              onClick={() => setExamCount("ONCE")}
            >
              1회
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={examCount === "REPLACEMENT"}
              onClick={() => setExamCount("REPLACEMENT")}
            >
              과제대체
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>출결 방식</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={attendanceType === "ELECTRONIC"}
              onClick={() => setAttendanceType("ELECTRONIC")}
            >
              전자출결
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={attendanceType === "CALL"}
              onClick={() => setAttendanceType("CALL")}
            >
              직접호명
            </ChipRadio>
            <ChipRadio
              type="button"
              $selected={attendanceType === "MIXED"}
              onClick={() => setAttendanceType("MIXED")}
            >
              혼합/기타
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>
      </FormSection>

      {/* 4. 총평 서술형 본문 */}
      <FormSection>
        <SectionTitle>총평 작성</SectionTitle>
        <TextArea
          placeholder="수업 진행 방식, 시험 출제 경향, 과제 팁 등 후배들에게 도움이 될 솔직한 조언을 남겨주세요. (최소 20자 이상)"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 1000))}
          rows={5}
        />
        <CountRow>
          <NoticeText>욕설, 인격 비방 등 부적절한 글은 블라인드 처리될 수 있어요.</NoticeText>
          <CharCount $valid={isContentValid}>
            {content.length} / 1000자 {content.length < 20 && `(최소 20자)`}
          </CharCount>
        </CountRow>
      </FormSection>

      {/* 5. 하단 순수 플로팅 제출 CTA */}
      <BottomActionWrapper>
        <FloatingButtonContainer>
          <CapsuleButton
            variant="primary"
            fullWidth
            disabled={!isFormValid || createMutation.isPending}
            loading={createMutation.isPending}
            onClick={handleSubmit}
            style={{
              boxShadow: "0 6px 20px rgba(49, 130, 246, 0.35)",
            }}
          >
            강의평 등록하기
          </CapsuleButton>
        </FloatingButtonContainer>
      </BottomActionWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 ${MOBILE_PAGE_GUTTER} calc(90px + env(safe-area-inset-bottom, 0px));
  gap: 16px;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 calc(90px + env(safe-area-inset-bottom, 0px));
  }
`;

const CourseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`;

const CourseTitleText = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 18px 16px;
  gap: 14px;
  box-sizing: border-box;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #f9fafb);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  outline: none;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #f9fafb);
  font-size: 14px;
  color: var(--text-primary);
  box-sizing: border-box;
  outline: none;
`;

const ChipRadioRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ChipRadio = styled.button<{ $selected: boolean }>`
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--interactive-primary, #3182f6)" : "var(--border-default, #e5e8eb)"};
  background: ${({ $selected }) =>
    $selected ? "var(--bg-brand, #e8f3ff)" : "var(--bg-base, #f9fafb)"};
  color: ${({ $selected }) =>
    $selected ? "var(--interactive-primary, #3182f6)" : "var(--text-secondary)"};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
`;

const StarPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
`;

const StarPickerRow = styled.div`
  display: flex;
  gap: 8px;
`;

const StarButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  font-size: 36px;
  line-height: 1;
  color: ${({ $active }) =>
    $active ? "var(--interactive-primary, #3182f6)" : "var(--border-divider, #e5e8eb)"};
  cursor: pointer;
  padding: 4px;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(1.15);
  }
`;

const RatingDescriptionText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #f9fafb);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: var(--interactive-primary, #3182f6);
  }
`;

const CountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const NoticeText = styled.span`
  font-size: 11px;
  color: var(--text-caption, #8b95a1);
`;

const CharCount = styled.span<{ $valid: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $valid }) =>
    $valid ? "var(--interactive-primary, #3182f6)" : "var(--text-error, #f04452)"};
  white-space: nowrap;
`;

const BottomActionWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 100;
`;

const FloatingButtonContainer = styled.div`
  width: 100%;
  max-width: 440px;
  padding: 0 20px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  pointer-events: auto;
  background: transparent;
`;
