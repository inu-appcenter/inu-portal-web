import { useMemo, useState } from "react";
import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { WizardCard, WizardCourseRow } from "@/components/mobile/timetable/wizard/ui";
import { typo } from "@/components/mobile/timetable/wizard/ui/tokens";
import TimetableGrid, {
  type ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import ClassDetailBottomSheet from "@/components/mobile/timetable/ClassDetailBottomSheet";
import { formatCourseMeetings, mapWizardCoursesToClassItems } from "@/utils/timetableWizardFormat";
import { getOnlineTypeLabel } from "@/components/mobile/timetable/filter/courseFilterModel";
import type { WizardCandidate } from "@/types/timetableWizard";

interface WizardDetailScreenProps {
  candidate: WizardCandidate;
  /**
   * 화면 끝에 고정 버튼만큼 여백을 둘지. 하단 버튼을 WizardBottomCTA(자체 여백 포함)로
   * 그리는 화면은 false로 넘긴다. 기본값 true는 자체 고정 버튼을 쓰는 그룹 마법사용.
   */
  reserveBottomSpace?: boolean;
}

// Figma: 시간표 마법사 / 추천시간표 (3059:9386)
const WizardDetailScreen = ({ candidate, reserveBottomSpace = true }: WizardDetailScreenProps) => {
  const gridEvents = useMemo(
    () => mapWizardCoursesToClassItems(candidate.courses),
    [candidate.courses],
  );

  // 강의 목록 행의 accent bar와 동일한 색으로 상세 시트의 점 색상을 맞춘다.
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    candidate.courses.forEach((course, index) => {
      map.set(course.title, BLOCK_COLORS[index % BLOCK_COLORS.length]);
    });
    return map;
  }, [candidate.courses]);

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // meetings가 없는(비대면/온라인 전용) 강의도 상세를 열 수 있도록 gridEvents 조회에
  // 의존하지 않고 candidate.courses에서 직접 ClassItem을 구성한다.
  const handleCourseRowClick = (
    course: WizardCandidate["courses"][number],
    courseIndex: number,
  ) => {
    const firstMeeting = course.meetings[0];
    setSelectedClass({
      id: courseIndex * 1000,
      name: course.title,
      room: firstMeeting?.location ?? "",
      day: firstMeeting?.day ?? 0,
      startTime: firstMeeting?.startTime ?? 0,
      endTime: firstMeeting?.endTime ?? 0,
      credits: course.credit,
      professor: course.professor ?? undefined,
      ssupTypeName: course.ssupTypeName ?? undefined,
      ssupTypeCode: course.ssupTypeCode ?? undefined,
      courseOfferingId: course.courseOfferingId,
      courseId: course.subjectNumber,
      isUntimed: course.meetings.length === 0,
    });
    setDetailOpen(true);
  };

  return (
    <Body>
      <WizardCard>
        <TimetableGrid events={gridEvents} isFreeMode />
      </WizardCard>

      <ReasonsCard $radius={16}>
        <CardTitle>이 시간표를 추천한 이유</CardTitle>
        <ReasonList>
          {candidate.reasons.map((reason, index) => (
            <ReasonItem key={index}>
              <ReasonIcon $met={reason.met} aria-label={reason.met ? "충족" : "주의"}>
                <Icon name={reason.met ? "check" : "triangle-warning"} size={20} />
              </ReasonIcon>
              <ReasonText>
                <ReasonHeadline $met={reason.met}>{reason.headline}</ReasonHeadline>
                {reason.detail && <ReasonDetail>{reason.detail}</ReasonDetail>}
              </ReasonText>
            </ReasonItem>
          ))}
        </ReasonList>
      </ReasonsCard>

      {/* 시간 정보가 없는(이러닝 등) 강의는 격자에 안 나오므로 목록으로도 보여 준다 */}
      <CourseListCard $radius={16}>
        <CardTitle>강의 목록</CardTitle>
        <div>
          {candidate.courses.map((course, index) => {
            const onlineTypeLabel = getOnlineTypeLabel(
              course.ssupTypeName,
              course.ssupTypeCode,
            );
            const meta = [
              course.professor,
              `${course.credit}학점`,
              formatCourseMeetings(course) || onlineTypeLabel,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <WizardCourseRow
                key={course.subjectNumber}
                title={course.title}
                meta={meta}
                onClick={() => handleCourseRowClick(course, index)}
              />
            );
          })}
        </div>
      </CourseListCard>

      {reserveBottomSpace && <BottomActionsSpacer />}

      <ClassDetailBottomSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        selectedClass={selectedClass}
        allEvents={gridEvents}
        colorMap={colorMap}
        readOnly
      />
    </Body>
  );
};

export default WizardDetailScreen;

// 앱 전역 시간표 색감과 같은 --time-table-color-* 팔레트
const BLOCK_COLORS = [
  "var(--time-table-color-pink, #fab5cd)",
  "var(--time-table-color-skyblue, #94cdfa)",
  "var(--time-table-color-teal, #79dddf)",
  "var(--time-table-color-orange, #ffcb94)",
  "var(--time-table-color-violet, #c1acfc)",
  "var(--time-table-color-yellow, #ffe589)",
  "var(--time-table-color-lightgreen, #8ce99a)",
  "var(--time-table-color-lilac, #acbcfd)",
  "var(--time-table-color-purple, #e9adf7)",
  "var(--time-table-color-red, #ffa6a6)",
];

const Body = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReasonsCard = styled(WizardCard)`
  padding: 16px;
  gap: 16px;
`;

const CourseListCard = styled(WizardCard)`
  padding: 16px 8px 8px;
  gap: 8px;

  & > h2 {
    padding: 0 8px;
  }
`;

const CardTitle = styled.h2`
  margin: 0;
  color: var(--text-primary, #191f28);
  ${typo.heading2}
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
`;

const ReasonIcon = styled.span<{ $met: boolean }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $met }) =>
    $met ? "var(--interactive-brand, #0061ff)" : "var(--text-warn, #b58000)"};
`;

const ReasonText = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
`;

const ReasonHeadline = styled.span<{ $met: boolean }>`
  color: ${({ $met }) =>
    $met ? "var(--text-secondary, #333d4b)" : "var(--text-warn, #b58000)"};
  ${typo.label2}
`;

const ReasonDetail = styled.span`
  color: var(--text-tertiary, #8b95a1);
  ${typo.caption1}
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
`;
