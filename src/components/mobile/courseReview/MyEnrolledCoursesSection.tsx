import { useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useCourses } from "@/hooks/useCourses";
import useUserStore from "@/stores/useUserStore";

interface MyEnrolledCoursesSectionProps {
  currentYear: number;
  currentTerm: string | number;
}

interface EnrolledCourseItem {
  id: string; // 고유 키
  name: string;
  professor: string;
  credits: number;
  courseId?: number;
  courseOfferingId?: number;
}

export default function MyEnrolledCoursesSection({
  currentYear,
  currentTerm,
}: MyEnrolledCoursesSectionProps) {
  const navigate = useNavigate();
  const { timetables } = useTimetableStore();
  const { courses: allCourses } = useCourses();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 현재 학기 시간표 또는 대표 시간표 선택
  const targetTimetable = useMemo(() => {
    if (!timetables || timetables.length === 0) return null;

    const termNum =
      currentTerm === "SECOND" || currentTerm === 2 || currentTerm === "2"
        ? 2
        : 1;

    // 1) 연도와 학기가 일치하는 대표 시간표 우선
    const exactRep = timetables.find(
      (t) => t.year === currentYear && (t.term === "SECOND" ? 2 : 1) === termNum && t.isRepresentative,
    );
    if (exactRep) return exactRep;

    // 2) 연도와 학기가 일치하는 아무 시간표
    const exact = timetables.find(
      (t) => t.year === currentYear && (t.term === "SECOND" ? 2 : 1) === termNum,
    );
    if (exact) return exact;

    // 3) 전체 중 대표 시간표
    const rep = timetables.find((t) => t.isRepresentative);
    if (rep) return rep;

    // 4) 첫 번째 시간표
    return timetables[0];
  }, [timetables, currentYear, currentTerm]);

  // 시간표 이벤트로부터 중복 없는 수강 과목 목록 추출
  const enrolledCourses: EnrolledCourseItem[] = useMemo(() => {
    if (!targetTimetable || !targetTimetable.events) return [];

    const map = new Map<string, EnrolledCourseItem>();

    targetTimetable.events.forEach((e) => {
      const cleanName = e.name?.trim();
      if (!cleanName) return;

      const prof = e.professor?.trim() && e.professor !== "-" ? e.professor.trim() : "";
      const key = `${cleanName}_${prof}`;

      if (!map.has(key)) {
        // 과목 ID 매핑 (numericCourseId 우선, 없으면 allCourses 매핑)
        let resolvedCourseId = e.numericCourseId;
        if (!resolvedCourseId) {
          const matched = allCourses.find((c) => c.title?.trim() === cleanName);
          resolvedCourseId = matched?.id;
        }

        map.set(key, {
          id: key,
          name: cleanName,
          professor: prof,
          credits: e.credits ?? 0,
          courseId: resolvedCourseId,
          courseOfferingId: e.courseOfferingId,
        });
      }
    });

    return Array.from(map.values());
  }, [targetTimetable, allCourses]);

  const handleCourseClick = (item: EnrolledCourseItem) => {
    if (item.courseId) {
      navigate(ROUTES.COURSE.REVIEW(item.courseId), {
        state: {
          courseName: item.name,
          professorName: item.professor || undefined,
          year: targetTimetable?.year ?? currentYear,
          term: targetTimetable?.term === "SECOND" ? 2 : 1,
          courseOfferingId: item.courseOfferingId,
        },
      });
      return;
    }
    // courseId가 없는 경우 검색 페이지로 이동
    navigate(`${ROUTES.COURSE.HOME}?courseQuery=${encodeURIComponent(item.name)}`);
  };

  const handleWriteClick = (e: React.MouseEvent, item: EnrolledCourseItem) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (item.courseId) {
      navigate(ROUTES.COURSE.REVIEW_WRITE(item.courseId), {
        state: {
          courseTitle: item.name,
          professor: item.professor,
          year: targetTimetable?.year ?? currentYear,
          term: targetTimetable?.term === "SECOND" ? 2 : 1,
          courseOfferingId: item.courseOfferingId,
        },
      });
      return;
    }
    handleCourseClick(item);
  };

  if (!isLoggedIn) {
    return (
      <SectionWrapper>
        <SectionHeader>
          <SectionTitle>내 수강 강의</SectionTitle>
        </SectionHeader>
        <GuideCard onClick={() => navigate(ROUTES.LOGIN)}>
          <GuideTitle>로그인하고 내 수업 강의평 확인하기</GuideTitle>
          <GuideDesc>내가 듣는 수업의 후기를 한눈에 확인하고 바로 후기를 남겨보세요.</GuideDesc>
        </GuideCard>
      </SectionWrapper>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <SectionWrapper>
        <SectionHeader>
          <SectionTitle>내 수강 강의</SectionTitle>
        </SectionHeader>
        <GuideCard onClick={() => navigate(ROUTES.TIMETABLE.ROOT)}>
          <GuideTitle>시간표에 강의를 담아보세요</GuideTitle>
          <GuideDesc>시간표를 등록하면 수강 중인 수업들의 강의평을 한눈에 모아볼 수 있어요.</GuideDesc>
        </GuideCard>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionHeader>
        <TitleGroup>
          <SectionTitle>내 수강 강의</SectionTitle>
          <CountBadge>{enrolledCourses.length}</CountBadge>
        </TitleGroup>
        <HeaderActionText onClick={() => navigate(ROUTES.TIMETABLE.ROOT)}>
          시간표 편집 ›
        </HeaderActionText>
      </SectionHeader>

      <HorizontalScrollRow>
        {enrolledCourses.map((item) => (
          <CourseCard key={item.id} onClick={() => handleCourseClick(item)}>
            <CardTopRow>
              <CardCourseName title={item.name}>{item.name}</CardCourseName>
              {item.credits > 0 && <CreditBadge>{item.credits}학점</CreditBadge>}
            </CardTopRow>

            <CardMiddleRow>
              <CardProfessorText>
                {item.professor ? `${item.professor} 교수` : "교수 정보 없음"}
              </CardProfessorText>
            </CardMiddleRow>

            <CardBottomRow>
              <WriteActionButton
                type="button"
                onClick={(e) => handleWriteClick(e, item)}
              >
                후기 쓰기 ✎
              </WriteActionButton>
            </CardBottomRow>
          </CourseCard>
        ))}
      </HorizontalScrollRow>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
`;

const CountBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--interactive-primary, #3182f6);
  background: var(--bg-brand, #e8f3ff);
  padding: 2px 7px;
  border-radius: 999px;
`;

const HeaderActionText = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;

  &:active {
    color: var(--text-secondary);
  }
`;

const HorizontalScrollRow = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const CourseCard = styled.div`
  flex: 0 0 200px;
  scroll-snap-align: start;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 14px 14px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
`;

const CardCourseName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  height: 38px;
`;

const CreditBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-caption, #8b95a1);
  background: var(--bg-base, #f2f4f6);
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const CardMiddleRow = styled.div`
  display: flex;
  align-items: center;
`;

const CardProfessorText = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid var(--border-divider, #f2f4f6);
`;

const WriteActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-brand, #e8f3ff);
  color: var(--interactive-primary, #3182f6);
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #d8eaff;
  }
`;

const GuideCard = styled.div`
  background: var(--bg-surface, #ffffff);
  border: 1px dashed var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:active {
    background: var(--bg-base, #f9fafb);
  }
`;

const GuideTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

const GuideDesc = styled.span`
  font-size: 12px;
  color: var(--text-caption, #8b95a1);
  line-height: 1.4;
`;
