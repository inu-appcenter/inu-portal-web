import styled from "styled-components";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import Badge from "@/components/common/Badge";
import { MdKeyboardArrowDown } from "react-icons/md";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useState } from "react";
import Chip from "@/components/common/Chip";

// 데이터 타입 정의 (외부에서 사용 시 export)
export interface CourseResult {
  id: number;
  name: string;
  professor: string;
  timeStr: string;
  room: string;
  grade: number;
  isMajor: boolean;
  credits: number;
  courseId: string;
  remarks?: string;
  enrolledCount: number;
  schedules: ClassItem[];
}

interface MobileCourseSearchSheetProps {
  courses: CourseResult[];
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
}

const MobileCourseSearchSheet = ({
  courses,
  expandedId,
  onToggleExpand,
}: MobileCourseSearchSheetProps) => {
  const [categoryList] = useState<string[]>([
    "#컴퓨터공학부",
    "#2학점",
    "#3학년",
  ]);

  return (
    <StyledBottomSheet
      open
      blocking={false}
      snapPoints={({ maxHeight }) => [maxHeight * 0.5, maxHeight * 0.85]}
      header={
        <FilterContainer>
          <CategorySelectorNew categories={categoryList} />
          <Chip title={"필터"} />
        </FilterContainer>
      }
    >
      <CourseList>
        {courses.map((course) => {
          const isExpanded = expandedId === course.id;

          return (
            <CourseItem
              key={course.id}
              onClick={() => onToggleExpand(course.id)}
              $isExpanded={isExpanded}
            >
              {/* 기본 정보 */}
              <InfoRow>
                <MainInfo>
                  <CourseName>{course.name}</CourseName>
                  <ProfName>{course.professor}</ProfName>
                </MainInfo>
                <RightInfo>
                  <Badge text={`${course.enrolledCount}명 담음`}></Badge>
                  <StyledArrowIcon $isExpanded={isExpanded} />
                </RightInfo>
              </InfoRow>

              {/* 상세 스펙 */}
              <DetailString>
                {`${course.timeStr} ${course.room}`} <br />
                {`${course.grade}학년 ${course.isMajor ? "전공심화" : "교양"} ${course.credits}학점 ${course.courseId}`}
              </DetailString>

              {/* 확장 영역 */}
              {isExpanded && (
                <ExpandedArea>
                  {course.remarks && (
                    <RemarkText>비고 : {course.remarks}</RemarkText>
                  )}
                  <ButtonRow>
                    <Chip title={"시간표에 추가"} />
                    <Chip title={"강의평 보기 🔗"} />
                  </ButtonRow>
                </ExpandedArea>
              )}
            </CourseItem>
          );
        })}
      </CourseList>
    </StyledBottomSheet>
  );
};

export default MobileCourseSearchSheet;

// --- 스타일 ---

const StyledBottomSheet = styled(BottomSheet)`
  --rsbs-bg: white;
  --rsbs-handle-bg: #e0e0e0;
  --rsbs-max-w: auto;
  --rsbs-ml: env(safe-area-inset-left);
  --rsbs-mr: env(safe-area-inset-right);
  --rsbs-overlay-rounded: 24px;
  z-index: 100;
`;

const FilterContainer = styled.div`
  //padding: 12px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  align-items: center;
  background-color: white;
  //border-bottom: 1px solid #f0f0f0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CourseList = styled.div`
  padding: 0 16px 24px 16px;
`;

const CourseItem = styled.div<{ $isExpanded: boolean }>`
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: ${({ $isExpanded }) => ($isExpanded ? "#F8F9FA" : "white")};
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  transition: background-color 0.2s;
  cursor: pointer;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const MainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CourseName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #2d68ff;
`;

const ProfName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #333;
`;

const RightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledArrowIcon = styled(MdKeyboardArrowDown)<{ $isExpanded: boolean }>`
  font-size: 24px;
  color: #aaa;
  transition: transform 0.3s;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

const DetailString = styled.div`
  font-size: 12px;
  color: #888;
  line-height: 1.4;
`;

const ExpandedArea = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RemarkText = styled.div`
  font-size: 11px;
  color: #ff4b4b;
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;
