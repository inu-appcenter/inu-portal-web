import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useNavigate } from "react-router-dom";
import { useTimetableStore, Timetable } from "@/stores/useTimetableStore";
import { ROUTES } from "@/constants/routes";
import { useMemo, useCallback } from "react";

// Icons
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#FFD60A" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={filled ? "#FFD60A" : "#B0B8C1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MobileTimeTableListPage() {
  const navigate = useNavigate();
  const { timetables, setSemester, setActiveTimetable, setRepresentative, addTimetable } = useTimetableStore();
  

  const handleAddClick = useCallback(() => {
    const semester = prompt("학기를 입력해주세요. (예: 2026년 2학기)", "2026년 2학기");
    if (!semester) return;
    const name = prompt("시간표 이름을 입력해주세요. (예: 시간표 1)", "시간표 1");
    if (!name) return;
    addTimetable(semester, name);
  }, [addTimetable]);

  const headerRight = useMemo(() => (
    <IconButton onClick={handleAddClick}>
      <PlusIcon />
    </IconButton>
  ), [handleAddClick]);

  useHeader({
    title: "시간표 목록",
    hasback: true,
    immersive: true,
    pageBgColor: "#f8f9fb",
    rightArea: headerRight
  });

  // Group timetables by semester
  // Semesters list in chronological order
  const semesters = ["2026년 2학기", "2026년 1학기", "2025년 2학기", "2025년 1학기", "2024년 2학기"];

  const handleSelectTimetable = (t: Timetable) => {
    setSemester(t.semester);
    setActiveTimetable(t.id);
    navigate(ROUTES.TIMETABLE.ROOT);
  };

  return (
    <PageWrapper>
      <ListContainer>
        {semesters.map((sem) => {
          const list = timetables.filter((t) => t.semester === sem);
          return (
            <TimeTableListCard key={sem}>
              <SemesterHeader>{sem}</SemesterHeader>
              {list.length > 0 ? (
                <ScheduleListWrapper>
                  {list.map((t) => (
                    <ScheduleRow key={t.id} onClick={() => handleSelectTimetable(t)}>
                      <ScheduleName>{t.name}</ScheduleName>
                      <StarButton onClick={(e) => {
                        e.stopPropagation();
                        setRepresentative(t.id);
                      }}>
                        <StarIcon filled={t.isRepresentative} />
                      </StarButton>
                    </ScheduleRow>
                  ))}
                </ScheduleListWrapper>
              ) : (
                <EmptySemesterWrapper>
                  등록된 시간표가 없습니다.
                </EmptySemesterWrapper>
              )}
            </TimeTableListCard>
          );
        })}
      </ListContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: calc(var(--header-height, 56px) + 20px) ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 0px) + 40px);
  box-sizing: border-box;
  background-color: var(--bg-subtle, #f8f9fb);
  min-height: 100vh;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const TimeTableListCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const SemesterHeader = styled.div`
  padding: 16px 16px 8px 16px;
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const ScheduleListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 8px 16px;
`;

const ScheduleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScheduleName = styled.span`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const StarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
`;

const EmptySemesterWrapper = styled.div`
  padding: 16px 16px 20px 16px;
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  color: var(--text-secondary, #8b95a1);
  text-align: center;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  
  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }
`;
