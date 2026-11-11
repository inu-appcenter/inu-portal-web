import { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Badge from "@/components/common/Badge";
import BottomSheet from "@/components/common/BottomSheet";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import { useSemesters } from "@/hooks/useSemesters";
import { useCreateCourseReview } from "@/hooks/useCourseReviews";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { pickCurrentSemester } from "@/utils/semester";
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
  const { semesters } = useSemesters();
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

  const initialProfessor =
    (location.state as any)?.professor ||
    (location.state as any)?.professorName ||
    professors[0] ||
    "";

  // 기본 학기 계산 (전달받은 state 우선, 없으면 현재 학기)
  const defaultSemester = useMemo(() => pickCurrentSemester(semesters), [semesters]);
  const rawYear = (location.state as any)?.year;
  const initialYear = Number(rawYear) || defaultSemester?.year || 2026;

  const rawTerm = (location.state as any)?.term;
  const initialTerm =
    typeof rawTerm === "number" && !isNaN(rawTerm)
      ? rawTerm
      : rawTerm === "SECOND" || rawTerm === "2" || rawTerm === 2
        ? 2
        : rawTerm === "FIRST" || rawTerm === "1" || rawTerm === 1
          ? 1
          : defaultSemester?.term === "SECOND"
            ? 2
            : 1;

  const courseOfferingId = (location.state as any)?.courseOfferingId;

  // 강의평 작성 가능한 학기 목록: 계절학기 포함 모든 정규/계절 학기를 올바른 라벨로 정렬하고 중복 방지
  const availableSemesters = useMemo(() => {
    const getTermNumber = (t: any): number => {
      if (t === "FIRST" || t === "1" || t === 1) return 1;
      if (t === "SECOND" || t === "2" || t === 2) return 2;
      if (t === "SUMMER" || t === "3" || t === 3) return 3;
      if (t === "WINTER" || t === "4" || t === 4) return 4;
      return 1;
    };

    const getTermLabel = (termNum: number): string => {
      if (termNum === 1) return "1학기";
      if (termNum === 2) return "2학기";
      if (termNum === 3) return "여름학기";
      if (termNum === 4) return "겨울학기";
      return `${termNum}학기`;
    };

    const termWeight: Record<number, number> = { 4: 4, 2: 3, 3: 2, 1: 1 };

    const seen = new Set<string>();
    const list: { key: string; year: number; term: number; label: string }[] = [];

    semesters.forEach((s) => {
      const termNum = getTermNumber(s.term);
      const key = `${s.year}-${termNum}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          key,
          year: s.year,
          term: termNum,
          label: `${s.year}년 ${getTermLabel(termNum)}`,
        });
      }
    });

    return list.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return (termWeight[b.term] || 0) - (termWeight[a.term] || 0);
    });
  }, [semesters]);

  // 폼 상태
  const [professor, setProfessor] = useState<string>(initialProfessor);
  const [year, setYear] = useState<number>(initialYear);
  const [term, setTerm] = useState<number>(initialTerm);

  const currentTermLabel = useMemo(() => {
    if (term === 1) return "1학기";
    if (term === 2) return "2학기";
    if (term === 3) return "여름학기";
    if (term === 4) return "겨울학기";
    return `${term}학기`;
  }, [term]);
  const [isSemesterSheetOpen, setIsSemesterSheetOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);

  // 5대 세부 지표 초기값 해제 (null 시작)
  const [gradeSatisfaction, setGradeSatisfaction] = useState<GradeSatisfaction | null>(null);
  const [assignmentAmount, setAssignmentAmount] = useState<AssignmentAmount | null>(null);
  const [teamProject, setTeamProject] = useState<TeamProject | null>(null);
  const [examCount, setExamCount] = useState<ExamCount | null>(null);
  const [attendanceType, setAttendanceType] = useState<AttendanceType | null>(null);
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

  // 5대 세부 지표 선택 완료 여부
  const isEvaluationComplete = Boolean(
    gradeSatisfaction &&
      assignmentAmount &&
      teamProject &&
      examCount &&
      attendanceType,
  );

  // 총평은 자율 입력(0자도 허용, 1000자 이내)
  const isContentValid = content.length <= 1000;
  const isFormValid = Boolean(
    rating > 0 &&
      professor &&
      year &&
      term &&
      isEvaluationComplete &&
      isContentValid,
  );

  const handleSubmit = () => {
    if (!isFormValid || createMutation.isPending) return;

    if (!gradeSatisfaction || !assignmentAmount || !teamProject || !examCount || !attendanceType) {
      alert("세부 평가 항목을 모두 선택해주세요.");
      return;
    }

    const isConfirmed = window.confirm(
      "강의평은 등록 후 수정이나 삭제를 할 수 없어요.\n이대로 등록할까요?"
    );
    if (!isConfirmed) return;

    createMutation.mutate(
      {
        courseOfferingId,
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
          alert("강의평이 등록되었습니다.");
          navigate(ROUTES.COURSE.REVIEW(courseId), { replace: true });
        },
        onError: (err: any) => {
          console.error("강의평 등록 실패:", err.response?.data || err);
          const serverMsg =
            err.response?.data?.msg ||
            err.response?.data?.message ||
            (err.response?.status === 400 ? "입력값을 다시 확인해주세요." : "강의평 등록에 실패했습니다.");
          alert(serverMsg);
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

      {/* 1. 수강 정보 섹션 (읽기 전용) */}
      <FormSection>
        <SectionTitle>수강 정보</SectionTitle>
        <ReadOnlyInfoGrid>
          <SelectableInfoItem
            type="button"
            onClick={() => setIsSemesterSheetOpen(true)}
          >
            <ReadOnlyLabel>수강 학기 (변경 가능)</ReadOnlyLabel>
            <SelectableValueRow>
              <ReadOnlyValue>
                {year}년 {currentTermLabel}
              </ReadOnlyValue>
              <ChangeBadge>변경</ChangeBadge>
            </SelectableValueRow>
          </SelectableInfoItem>
          <ReadOnlyInfoItem>
            <ReadOnlyLabel>담당 교수</ReadOnlyLabel>
            {professor ? (
              <ReadOnlyValue>{professor} 교수</ReadOnlyValue>
            ) : professors.length > 0 ? (
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
          </ReadOnlyInfoItem>
        </ReadOnlyInfoGrid>
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
        <SectionHeaderRow>
          <SectionTitle>세부 평가 항목</SectionTitle>
          <RequiredTag>필수</RequiredTag>
        </SectionHeaderRow>

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
              $selected={assignmentAmount === "FEW"}
              onClick={() => setAssignmentAmount("FEW")}
            >
              적음
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
              $selected={assignmentAmount === "MANY"}
              onClick={() => setAssignmentAmount("MANY")}
            >
              많음
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>조모임 (팀플)</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={teamProject === "NONE"}
              onClick={() => setTeamProject("NONE")}
            >
              없음
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
              $selected={teamProject === "MANY"}
              onClick={() => setTeamProject("MANY")}
            >
              많음
            </ChipRadio>
          </ChipRadioRow>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>시험 횟수</FieldLabel>
          <ChipRadioRow>
            <ChipRadio
              type="button"
              $selected={examCount === "REPLACEMENT"}
              onClick={() => setExamCount("REPLACEMENT")}
            >
              과제대체
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
              $selected={examCount === "TWICE"}
              onClick={() => setExamCount("TWICE")}
            >
              2회 (중간+기말)
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

      {/* 4. 총평 서술형 본문 (자율 선택) */}
      <FormSection>
        <SectionHeaderRow>
          <SectionTitle>총평 작성</SectionTitle>
          <OptionalTag>자율 선택</OptionalTag>
        </SectionHeaderRow>
        <TextArea
          placeholder="수업 진행 방식, 시험 출제 경향, 과제 팁 등 후배들에게 전하고 싶은 점을 편하게 남겨주세요."
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 1000))}
          rows={5}
        />
        <CountRow>
          <NoticeText>욕설, 인격 비방 등 부적절한 글은 블라인드 처리될 수 있어요.</NoticeText>
          <CharCount $valid={isContentValid}>
            {content.length} / 1000자
          </CharCount>
        </CountRow>
      </FormSection>

      {/* 5. 하단 순수 플로팅 제출 CTA */}
      <BottomActionWrapper>
        <FloatingButtonContainer>
          <NoticeBanner>
            강의평은 등록 후 수정이나 삭제를 할 수 없어요.
          </NoticeBanner>
          {!isEvaluationComplete && (
            <FloatingTipMessage>
              세부 평가 5개 항목을 모두 선택해주세요
            </FloatingTipMessage>
          )}
          <CapsuleButton
            variant="primary"
            fullWidth
            disabled={!isFormValid || createMutation.isPending}
            loading={createMutation.isPending}
            onClick={handleSubmit}
          >
            강의평 등록하기
          </CapsuleButton>
        </FloatingButtonContainer>
      </BottomActionWrapper>

      <BottomSheet
        open={isSemesterSheetOpen}
        onOpenChange={setIsSemesterSheetOpen}
        handle="compact"
      >
        <SemesterSheetContent>
          <SheetHeaderTitle>수강 학기 선택</SheetHeaderTitle>
          <SemesterList>
            {availableSemesters.map((item) => {
              const isSelected = year === item.year && term === item.term;
              return (
                <SemesterOption
                  key={item.key}
                  type="button"
                  $selected={isSelected}
                  onClick={() => {
                    setYear(item.year);
                    setTerm(item.term);
                    setIsSemesterSheetOpen(false);
                  }}
                >
                  <SemesterOptionText>{item.label}</SemesterOptionText>
                  {isSelected && <SelectedCheck>선택됨</SelectedCheck>}
                </SemesterOption>
              );
            })}
          </SemesterList>
        </SemesterSheetContent>
      </BottomSheet>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 ${MOBILE_PAGE_GUTTER} calc(140px + env(safe-area-inset-bottom, 0px));
  gap: 16px;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 calc(140px + env(safe-area-inset-bottom, 0px));
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

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
`;

const RequiredTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--interactive-primary, #3182f6);
  background: var(--bg-brand, #e8f3ff);
  padding: 3px 8px;
  border-radius: 6px;
`;

const OptionalTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-caption, #8b95a1);
  background: var(--bg-base, #f2f4f6);
  padding: 3px 8px;
  border-radius: 6px;
`;

const ReadOnlyInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const ReadOnlyInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: var(--bg-base, #f9fafb);
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
`;

const ReadOnlyLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-caption, #8b95a1);
`;

const ReadOnlyValue = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const FloatingTipMessage = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
`;

const FloatingButtonContainer = styled.div`
  width: 100%;
  max-width: 440px;
  padding: 0 20px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  pointer-events: auto;
  background: transparent;

  button {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;


const SelectableInfoItem = styled.button`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: var(--bg-base, #f9fafb);
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: var(--bg-subtle, #f2f4f6);
  }
`;

const SelectableValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ChangeBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--interactive-primary, #3182f6);
  background: var(--bg-brand, #e8f3ff);
  padding: 2px 6px;
  border-radius: 4px;
`;

const NoticeBanner = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-caption, #8b95a1);
  margin-bottom: 6px;
`;

const SemesterSheetContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
`;

const SheetHeaderTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
`;

const SemesterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--interactive-primary, #3182f6)" : "var(--border-default, #e5e8eb)"};
  background: ${({ $selected }) =>
    $selected ? "var(--bg-brand, #e8f3ff)" : "var(--bg-surface, #ffffff)"};
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.99);
  }
`;

const SemesterOptionText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
`;

const SelectedCheck = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--interactive-primary, #3182f6);
`;
