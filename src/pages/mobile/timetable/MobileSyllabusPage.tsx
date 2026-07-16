import { useState, useMemo } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DESKTOP_MEDIA } from "@/styles/responsive";

// --- 타입 정의 ---
interface TimeSlot {
  day: string;
  time: string;
}

interface SyllabusData {
  courseName: string;
  professor: string;
  credits: string;
  isMajor: string;
  gradingType: string;
  department: string;
  grade: string;
  courseCode: string;
  schedule: TimeSlot[];
  classroom: string;
  overview: {
    paragraphs: string[];
  };
  objectives: string[];
  deliveryMethod: {
    classTypes: { name: string; value: string }[];
    equipmentTypes: { name: string; value: string }[];
  };
  evaluation: { name: string; value: number; color: string }[];
  references: {
    title: string;
    author: string;
    type: string;
    details: string;
  }[];
  weeklyPlan: { week: string; desc: string }[];
  assignment: {
    title: string;
    type: string;
    objective: string;
    method: string;
    reference: string;
  };
  weights: {
    core: string[];
    major: string[];
  };
}

// --- 기본 데이터 (피그마 데이터 반영) ---
const DEFAULT_SYLLABUS_DATA: SyllabusData = {
  courseName: "프로그래밍언어",
  professor: "최욱",
  credits: "3학점",
  isMajor: "전공심화",
  gradingType: "상대평가",
  department: "전자공학부",
  grade: "3학년",
  courseCode: "EPC6046001",
  schedule: [
    { day: "화(야1-2A)", time: "18:00-19:15" },
    { day: "수(2B-3)", time: "10:45-12:00" },
  ],
  classroom: "08-326",
  overview: {
    paragraphs: [
      "본 과목은 전자공학에서 배우는 다양한 과목들에 대한 심도 있는 이해를 위한 인생의 동반자로 Python을 잘 활용하는 것을 목적으로 함. 다음과 같은 활동을 통해 본 목적을 달성할 계획임.",
      "1. Python을 활용한 수학, 물리, 회로이론, 디지털 신호처리, 주식시장의 문제 해결, 데이터 분석, 시각화",
      "2. Python 패키지 활용: NumPy, Matplotlib, SymPy, Pandas, Scipy, Scikit-Learn 등 이로 인해 인천대학교 전자공학부 학생들이 1학년 1학기부터 2학년 1학기에 걸쳐서 배우는 대학수학, 물리, 선형대수학, 회로이론, 전자기학, 복소함수 및 벡터와 같은 과목들에 대해서 더욱 심도 있는 복습 및 문제 해결이 가능해 질 뿐만 아니라 추후 배우게 될 디지털 신호처리와 같은 과목에 대해서도 강력한 시각화를 통해 미리 물리적 개념을 잘 이해하여 효과적인 예습을 할 수 있음.",
    ],
  },
  objectives: [
    "1. Python 활용 능력 증대: NumPy, Matplotlib, Pandas와 같은 기본 패키지 뿐만 아니라 SymPy, Scipy, Scikit-Learn과 같은 scientific computing을 위한 패키지 활용 능력 증대",
    "2. 전자공학 교과목 이해도 증대: 기본 코드를 응용하여 다양한 입력에 대한 결과 값이 어떻게 시각화 되는지를 파악. 이론적으로만 배웠던 내용들에 대한 심도 있는 이해.",
    "3. 인공지능 활용 능력 증대: Python 코딩을 위해서 생성형 AI를 활용. 생성된 코드의 정확성을 검증하며 디버깅 수행 능력 함양. AI 와 함께 살아가야 하는 신인류가 되기 위한 발판 마련.",
  ],
  deliveryMethod: {
    classTypes: [
      { name: "강의", value: "0%" },
      { name: "토론", value: "0%" },
      { name: "세미나", value: "0%" },
      { name: "실습", value: "0%" },
      { name: "시청각", value: "0%" },
      { name: "유인물", value: "0%" },
      { name: "견학", value: "0%" },
      { name: "기타", value: "0%" },
    ],
    equipmentTypes: [
      { name: "판서", value: "0%" },
      { name: "OHP", value: "0%" },
      { name: "슬라이드", value: "0%" },
      { name: "차트", value: "0%" },
      { name: "비디오", value: "0%" },
      { name: "오디오", value: "0%" },
      { name: "컴퓨터", value: "0%" },
      { name: "기타", value: "0%" },
    ],
  },
  evaluation: [
    { name: "시험", value: 40, color: "var(--border-brand, #0061ff)" },
    { name: "출석", value: 20, color: "var(--border-warn, #ffc72c)" },
    { name: "과제", value: 40, color: "var(--text-success, #10b981)" },
  ],
  references: [
    {
      title: "인천대학교 최욱 교수의 강의 노트",
      author: "최욱",
      type: "주교재",
      details: "2026",
    },
    {
      title: "점프 투 파이썬",
      author: "박응용",
      type: "기타서적",
      details: "https://wikidocs.net/book/1",
    },
  ],
  weeklyPlan: [
    { week: "1주차", desc: "오리엔테이션, 개발 환경 구축" },
    { week: "2주차", desc: "Python 기본 문법 I – 자료형, 조건문, 반복문, 예외 처리" },
    { week: "3주차", desc: "Python 기본 문법 II – 함수, 클래스, 모듈, 파일 입출력" },
    { week: "4주차", desc: "NumPy – 선형대수학" },
    { week: "5주차", desc: "Matplotlib – 다양한 그래프 그리기" },
    { week: "6주차", desc: "SymPy – 미적분과 미분 방정식" },
    { week: "7주차", desc: "Matplotlib – 매개변수 곡선, 전자기장 그리기" },
    { week: "8주차", desc: "중간고사" },
    { week: "9주차", desc: "Pandas – 데이터 분석 기초" },
    { week: "10주차", desc: "Pandas – 주식 데이터 다루기" },
    { week: "11주차", desc: "Scipy – 최적화, 미적분, 수치해석" },
    { week: "12주차", desc: "Scipy – 신호처리" },
    { week: "13주차", desc: "Scikit-Learn – 주성분 분석" },
    { week: "14주차", desc: "Scikit-Learn – 선형 회귀" },
    { week: "15주차", desc: "기말고사" },
  ],
  assignment: {
    title: "매주 코딩 숙제",
    type: "과제 1",
    objective: "Python을 활용한 문제 해결 능력 함양",
    method: "실습 시간에 배운 내용을 응용해 매주 과제 코드 제출",
    reference: "-",
  },
  weights: {
    core: ["문제해결", "창의융합", "협업인성"],
    major: ["실습설계", "AI활용"],
  },
};

// --- 아코디언 컴포넌트 ---
interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion = ({ title, isOpen, onToggle, children }: AccordionProps) => {
  return (
    <AccordionContainer>
      <AccordionHeader onClick={onToggle}>
        <AccordionTitle>{title}</AccordionTitle>
        <ChevronIconWrapper $isOpen={isOpen}>
          <ChevronDown size={24} />
        </ChevronIconWrapper>
      </AccordionHeader>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <AccordionContent>{children}</AccordionContent>
          </motion.div>
        )}
      </AnimatePresence>
    </AccordionContainer>
  );
};

// --- 메인 페이지 컴포넌트 ---
const MobileSyllabusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // state 데이터 또는 기본값 적용
  const courseName = location.state?.courseName || "프로그래밍언어";
  const professor = location.state?.professor || "최욱";

  // 헤더 설정
  useHeader({
    title: "강의계획서",
    showAlarm: false,
    hasback: true,
  });

  // 상태 관리 - 모든 섹션은 접힘(false)이 기본값
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: false,
    objectives: false,
    delivery: false,
    grading: false,
    books: false,
    weekly: false,
    assignments: false,
    weights: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // 선택 과목에 따른 다이내믹 정보 연산
  const data = useMemo(() => {
    if (courseName.includes("웹프로그래밍")) {
      return {
        ...DEFAULT_SYLLABUS_DATA,
        courseName: "웹프로그래밍",
        professor: professor || "박기석",
        credits: "2학점",
        isMajor: "전공",
        department: "컴퓨터공학과",
        courseCode: "0008868001",
        schedule: [{ day: "화", time: "17:00-18:45" }],
        classroom: "07-304",
      };
    } else if (courseName.includes("운영체제")) {
      return {
        ...DEFAULT_SYLLABUS_DATA,
        courseName: "운영체제",
        professor: professor || "문주팍",
        credits: "1학점",
        isMajor: "전공",
        department: "컴퓨터공학과",
        courseCode: "0008868001",
        schedule: [{ day: "화", time: "17:00-18:45" }],
        classroom: "07-304",
      };
    } else if (courseName.includes("창의적사고")) {
      return {
        ...DEFAULT_SYLLABUS_DATA,
        courseName: "창의적사고와문제해결",
        professor: professor || "김창의",
        credits: "2학점",
        isMajor: "교양",
        department: "교양학부",
        courseCode: "0001234001",
        schedule: [{ day: "목", time: "13:00-15:00" }],
        classroom: "05-202",
      };
    }
    return DEFAULT_SYLLABUS_DATA;
  }, [courseName, professor]);

  const handleAddToTimetable = () => {
    alert(`"${data.courseName}" 과목이 시간표에 추가되었습니다.`);
    navigate(ROUTES.TIMETABLE.EDIT);
  };

  return (
    <PageWrapper>
      {/* 1. 헤더 블록 */}
      <HeaderBlock>
        <CourseTitleWrapper>
          <CourseTitle>{data.courseName}</CourseTitle>
          <ProfessorName>{data.professor}</ProfessorName>
        </CourseTitleWrapper>
        <ChipRow>
          <Chip>
            <span>{data.credits}</span>
          </Chip>
          <Chip>
            <span>{data.isMajor}</span>
          </Chip>
          <Chip>
            <span>{data.gradingType}</span>
          </Chip>
        </ChipRow>
      </HeaderBlock>

      {/* 2. 기본 정보 표 */}
      <CatalogInfo>
        <CatalogInfoRow>
          <InfoLabel>학과</InfoLabel>
          <InfoValue>{data.department}</InfoValue>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>학년</InfoLabel>
          <InfoValue>{data.grade}</InfoValue>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>과목코드</InfoLabel>
          <InfoValue>{data.courseCode}</InfoValue>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>시간</InfoLabel>
          <TimeSlotList>
            {data.schedule.map((sch, i) => (
              <TimeSlotItem key={i}>
                <span className="day">{sch.day}</span>
                <span className="time">{sch.time}</span>
              </TimeSlotItem>
            ))}
          </TimeSlotList>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>강의실</InfoLabel>
          <InfoValue>{data.classroom}</InfoValue>
        </CatalogInfoRow>
      </CatalogInfo>

      {/* 3. 아코디언 섹션 목록 */}
      <AccordionSectionGroup>
        {/* 교과목개요 */}
        <Accordion
          title="교과목개요"
          isOpen={openSections.overview}
          onToggle={() => toggleSection("overview")}
        >
          <OverviewText>
            {data.overview.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </OverviewText>
        </Accordion>

        {/* 수업목표 */}
        <Accordion
          title="수업목표"
          isOpen={openSections.objectives}
          onToggle={() => toggleSection("objectives")}
        >
          <BulletList>
            {data.objectives.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </BulletList>
        </Accordion>

        {/* 수업진행방법 */}
        <Accordion
          title="수업진행방법"
          isOpen={openSections.delivery}
          onToggle={() => toggleSection("delivery")}
        >
          <TableTitle>수업방식</TableTitle>
          <DeliveryTable>
            {data.deliveryMethod.classTypes.map((type, idx) => (
              <TableCell key={idx}>
                <div className="label-container">
                  <span className="label-text">{type.name}</span>
                </div>
                <div className="value-container">
                  <span className="value-text">{type.value}</span>
                </div>
              </TableCell>
            ))}
          </DeliveryTable>

          <TableTitle style={{ marginTop: "8px" }}>기자재활용</TableTitle>
          <DeliveryTable>
            {data.deliveryMethod.equipmentTypes.map((type, idx) => (
              <TableCell key={idx}>
                <div className="label-container">
                  <span className="label-text">{type.name}</span>
                </div>
                <div className="value-container">
                  <span className="value-text">{type.value}</span>
                </div>
              </TableCell>
            ))}
          </DeliveryTable>
        </Accordion>

        {/* 학습평가방법 */}
        <Accordion
          title="학습평가방법"
          isOpen={openSections.grading}
          onToggle={() => toggleSection("grading")}
        >
          <GradingProgressBar>
            {data.evaluation.map((ev, idx) => (
              <GradingProgressSegment
                key={idx}
                $width={ev.value}
                $bgColor={ev.color}
              />
            ))}
          </GradingProgressBar>
          <GradingLegendRow>
            {data.evaluation.map((ev, idx) => (
              <GradingLegendItem key={idx}>
                <div className="dot" style={{ backgroundColor: ev.color }} />
                <span className="text">
                  {ev.name} {ev.value}%
                </span>
              </GradingLegendItem>
            ))}
          </GradingLegendRow>
        </Accordion>

        {/* 주교재/참고서적 */}
        <Accordion
          title="주교재/참고서적"
          isOpen={openSections.books}
          onToggle={() => toggleSection("books")}
        >
          {data.references.map((ref, idx) => (
            <ReferenceCard key={idx}>
              <ReferenceHeaderRow>
                <ReferenceTitle>{ref.title}</ReferenceTitle>
                <ReferenceChip>
                  <span>{ref.type}</span>
                </ReferenceChip>
              </ReferenceHeaderRow>
              <ReferenceDetailsRow>
                <span className="author">{ref.author}</span>
                <span className="separator">·</span>
                <span className="details">{ref.details}</span>
              </ReferenceDetailsRow>
            </ReferenceCard>
          ))}
        </Accordion>

        {/* 주별 세부 수업계획 */}
        <Accordion
          title="주별 세부 수업계획"
          isOpen={openSections.weekly}
          onToggle={() => toggleSection("weekly")}
        >
          {data.weeklyPlan.map((plan, idx) => (
            <WeeklyPlanItem key={idx}>
              <WeeklyChip>
                <span>{plan.week}</span>
              </WeeklyChip>
              <WeeklyDesc>{plan.desc}</WeeklyDesc>
            </WeeklyPlanItem>
          ))}
        </Accordion>

        {/* 과제 */}
        <Accordion
          title="과제"
          isOpen={openSections.assignments}
          onToggle={() => toggleSection("assignments")}
        >
          <AssignmentCard>
            <AssignmentTitleRow>
              <AssignmentTitle>{data.assignment.title}</AssignmentTitle>
              <AssignmentChip>
                <span>{data.assignment.type}</span>
              </AssignmentChip>
            </AssignmentTitleRow>
            <AssignmentField>
              <span className="label">목표</span>
              <span className="value">{data.assignment.objective}</span>
            </AssignmentField>
            <AssignmentField>
              <span className="label">진행방법</span>
              <span className="value">{data.assignment.method}</span>
            </AssignmentField>
            <AssignmentField>
              <span className="label">참고자료</span>
              <span className="value">{data.assignment.reference}</span>
            </AssignmentField>
          </AssignmentCard>
        </Accordion>

        {/* 핵심역량 / 전공능력 가중치 */}
        <Accordion
          title="핵심역량 / 전공능력 가중치"
          isOpen={openSections.weights}
          onToggle={() => toggleSection("weights")}
        >
          <WeightsSection>
            <span className="title">핵심역량</span>
            <TagChipRow>
              {data.weights.core.map((tag, idx) => (
                <TagChip key={idx}>
                  <span>{tag}</span>
                </TagChip>
              ))}
            </TagChipRow>
          </WeightsSection>
          <WeightsSection style={{ marginTop: "8px" }}>
            <span className="title">전공능력</span>
            <TagChipRow>
              {data.weights.major.map((tag, idx) => (
                <TagChip key={idx}>
                  <span>{tag}</span>
                </TagChip>
              ))}
            </TagChipRow>
          </WeightsSection>
        </Accordion>
      </AccordionSectionGroup>

      {/* 4. 장애학생 학습지원 */}
      <DisabilitySupportBox>
        <DisabilityTitle>장애학생 학습지원</DisabilityTitle>
        <DisabilityContent>
          <p>
            장애학생은 수강 시 필요한 지원 사항에 대하여 담당 교수 및
            장애학생지원센터에 요청할 수 있어요.
          </p>
          <p>예) 학습도우미, 과제제출, 시험시간 연장 등</p>
        </DisabilityContent>
      </DisabilitySupportBox>

      {/* 5. 하단 플로팅 버튼 그룹 (Gradient 백그라운드 포함) */}
      <BottomCTAContainer>
        <GrayCTAButton onClick={() => alert("강의평 페이지 준비 중입니다.")}>
          <span>강의평</span>
        </GrayCTAButton>
        <BlueCTAButton onClick={handleAddToTimetable}>
          <span>시간표에 추가</span>
        </BlueCTAButton>
      </BottomCTAContainer>
    </PageWrapper>
  );
};

export default MobileSyllabusPage;

// --- 스타일 정의 ---
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 0 160px; /* 상단 여백은 SubLayout의 headerHeight로 기본 처리되므로 0으로 설정 */
  min-height: 100vh;
  position: relative;

  @media ${DESKTOP_MEDIA} {
    max-width: 768px;
    margin: 0 auto;
    padding-top: 0;
    border-left: 1px solid var(--border-default, #e5e8eb);
    border-right: 1px solid var(--border-default, #e5e8eb);
  }
`;

const HeaderBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 16px 20px;
`;

const CourseTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CourseTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  color: var(--text-secondary, #333d4b);
  letter-spacing: -0.2px;
  margin: 0;
`;

const ProfessorName = styled.p`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-tertiary, #8b95a1);
  margin: 0;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Chip = styled.div`
  background-color: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  padding: 4px 10px;
  border-radius: var(--radius-full, 999px);
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    color: var(--text-brand, #0061ff);
    white-space: nowrap;
  }
`;

const CatalogInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
`;

const CatalogInfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--text-tertiary, #8b95a1);
`;

const InfoValue = styled.span`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const TimeSlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeSlotItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;

  .day {
    color: var(--text-secondary, #333d4b);
    width: 92px;
  }

  .time {
    color: var(--text-tertiary, #8b95a1);
  }
`;

const AccordionSectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const AccordionContainer = styled.div`
  width: 100%;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
`;

const AccordionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
`;

const AccordionTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const ChevronIconWrapper = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease-in-out;
  color: var(--text-secondary, #333d4b);
`;

const AccordionContent = styled.div`
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OverviewText = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: var(--text-secondary, #333d4b);

  p {
    margin: 0 0 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const BulletList = styled.ul`
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
  padding-left: 0;
  list-style-type: none;

  li {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const TableTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--text-secondary, #333d4b);
  margin: 0 0 6px;
`;

const DeliveryTable = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
`;

const TableCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 52px;
  border-right: 1px solid var(--border-default, #e5e8eb);
  box-sizing: border-box;

  &:last-child {
    border-right: none;
  }

  .label-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    border-bottom: 1px solid var(--border-default, #e5e8eb);
    background-color: var(--bg-subtle, #f8f9fb);
    padding: 2px 0;
  }

  .label-text {
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;
    color: var(--text-secondary, #333d4b);
    text-align: center;
    white-space: nowrap;
  }

  .value-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    padding: 2px 0;
  }

  .value-text {
    font-size: 10px;
    font-weight: 400;
    line-height: 14px;
    color: var(--text-secondary, #333d4b);
    text-align: center;
  }
`;

const GradingProgressBar = styled.div`
  display: flex;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background-color: var(--bg-subtle, #f8f9fb);
  margin-bottom: 8px;
`;

const GradingProgressSegment = styled.div<{ $width: number; $bgColor: string }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  background-color: ${({ $bgColor }) => $bgColor};
`;

const GradingLegendRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const GradingLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .text {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--text-secondary, #333d4b);
  }
`;

const ReferenceCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: var(--radius-xl, 16px);
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ReferenceHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const ReferenceTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
  flex: 1;
`;

const ReferenceChip = styled.div`
  background-color: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  padding: 2px 8px;
  border-radius: var(--radius-full, 999px);

  span {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--text-brand, #0061ff);
  }
`;

const ReferenceDetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);

  .author {
    color: var(--text-secondary, #333d4b);
  }

  .separator {
    color: var(--text-tertiary, #8b95a1);
  }

  .details {
    color: var(--text-tertiary, #8b95a1);
    word-break: break-all;
  }
`;

const WeeklyPlanItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  width: 100%;
  box-sizing: border-box;

  &:last-child {
    border-bottom: none;
  }
`;

const WeeklyChip = styled.div`
  background-color: var(--bg-warn-subtle, #fffaeb);
  border: 1px solid var(--bg-warn, #fef3c7);
  padding: 4px 8px;
  border-radius: var(--radius-full, 999px);
  width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  span {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--text-warn, #7a5400);
  }
`;

const WeeklyDesc = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
  flex: 1;
`;

const AssignmentCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: var(--radius-xl, 16px);
  width: 100%;
  box-sizing: border-box;
`;

const AssignmentTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssignmentTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
`;

const AssignmentChip = styled.div`
  background-color: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  padding: 2px 8px;
  border-radius: var(--radius-full, 999px);

  span {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--text-brand, #0061ff);
  }
`;

const AssignmentField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--text-tertiary, #8b95a1);
  }

  .value {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--text-secondary, #333d4b);
  }
`;

const WeightsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;

  .title {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const TagChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagChip = styled.div`
  background-color: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  padding: 4px 8px;
  border-radius: var(--radius-full, 999px);

  span {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--text-brand, #0061ff);
  }
`;

const DisabilitySupportBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 32px;
  width: 100%;
  box-sizing: border-box;
`;

const DisabilityTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
`;

const DisabilityContent = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: var(--text-tertiary, #8b95a1);

  p {
    margin: 0;
  }
`;

const BottomCTAContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  width: 100%;
  padding: 48px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  gap: 12px;
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.0) 16.02%, #FFF 100%);
  pointer-events: auto;

  @media ${DESKTOP_MEDIA} {
    max-width: 768px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const GrayCTAButton = styled.button`
  width: 116px;
  height: 48px;
  border-radius: var(--radius-full, 999px);
  background-color: var(--bg-muted, #f1f3f5);
  border: 1px solid var(--border-default, #e5e8eb);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;

  span {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    color: var(--text-secondary, #333d4b);
  }

  &:active {
    background-color: var(--border-default, #e5e8eb);
    transform: scale(0.96);
  }
`;

const BlueCTAButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: var(--radius-full, 999px);
  background-color: var(--interactive-primary, #3b82f6);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;

  span {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    color: #ffffff;
  }

  &:active {
    background-color: var(--interactive-primary-pressed, #0061ff);
    transform: scale(0.96);
  }
`;
