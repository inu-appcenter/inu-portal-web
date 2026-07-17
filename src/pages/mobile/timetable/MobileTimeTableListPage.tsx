import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useNavigate } from "react-router-dom";
import { useTimetableStore, Timetable } from "@/stores/useTimetableStore";
import { ROUTES } from "@/constants/routes";
import { useMemo, useCallback, useState } from "react";
import Modal from "@/components/common/Modal";
import InputField from "@/components/common/InputField";

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

const SEMESTERS = ["2026년 2학기", "2026년 1학기", "2025년 2학기", "2025년 1학기", "2024년 2학기"];

const getDefaultTimetableName = (semester: string, timetables: Timetable[]) => {
  const existingNames = timetables
    .filter((t) => t.semester === semester)
    .map((t) => t.name);

  let index = 1;
  while (true) {
    const candidate = `시간표 ${index}`;
    if (!existingNames.includes(candidate)) {
      return candidate;
    }
    index++;
  }
};

export default function MobileTimeTableListPage() {
  const navigate = useNavigate();
  const { timetables, setSemester, setActiveTimetable, setRepresentative, addTimetable } = useTimetableStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSemester, setModalSemester] = useState("2026년 2학기");
  const [modalName, setModalName] = useState("");

  const semesters = SEMESTERS;

  const handleAddClick = useCallback(() => {
    const defaultSem = semesters[0];
    setModalSemester(defaultSem);
    setModalName(getDefaultTimetableName(defaultSem, timetables));
    setIsAddModalOpen(true);
  }, [timetables, semesters]);

  const handleSemesterChange = (newSem: string) => {
    setModalSemester(newSem);
    setModalName(getDefaultTimetableName(newSem, timetables));
  };

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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="시간표 추가"
        primaryButton={{
          text: "저장",
          variant: "brand",
          onClick: () => {
            if (modalName.trim()) {
              addTimetable(modalSemester, modalName.trim());
              setIsAddModalOpen(false);
            }
          },
          disabled: !modalName.trim(),
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsAddModalOpen(false),
        }}
      >
        <SelectContainer>
          <SelectLabel>학기</SelectLabel>
          <StyledSelect
            value={modalSemester}
            onChange={(e) => handleSemesterChange(e.target.value)}
          >
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </StyledSelect>
        </SelectContainer>

        <InputField
          label="시간표 이름"
          value={modalName}
          onChange={setModalName}
          placeholder="시간표 이름을 입력하세요"
        />
      </Modal>
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

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-base, #ffffff);
  padding: 8px 12px;
  min-height: 56px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: var(--border-brand, #0061ff);
  }
`;

const SelectLabel = styled.span`
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 4px;
  pointer-events: none;
  text-align: left;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const StyledSelect = styled.select`
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  color: var(--text-primary, #333d4b);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%238B95A1' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0px center;
`;
