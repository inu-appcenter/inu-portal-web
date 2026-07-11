import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { Pencil, Plus, X, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

// --- Types ---
interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string; // A+, A0, B+, B0, C+, C0, D+, D0, F, P, NP
  isMajor: boolean;
}

type SemestersData = Record<string, Subject[]>;

// --- Constants ---
const SEMESTERS = [
  "1학년 1학기",
  "1학년 2학기",
  "2학년 1학기",
  "2학년 2학기",
  "3학년 1학기",
  "3학년 2학기",
  "4학년 1학기",
  "4학년 2학기",
  "기타학기",
];

const GRADES = ["A+", "A0", "B+", "B0", "C+", "C0", "D+", "D0", "F", "P", "NP"];

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.5,
  "A0": 4.0,
  "B+": 3.5,
  "B0": 3.0,
  "C+": 2.5,
  "C0": 2.0,
  "D+": 1.5,
  "D0": 1.0,
  "F": 0.0,
};

const DEFAULT_SUBJECTS_2_1: Subject[] = [
  { id: "1", name: "디지털엔터테인먼트콘텐츠", credits: 2, grade: "A+", isMajor: true },
  { id: "2", name: "문학과테마기행", credits: 3, grade: "B+", isMajor: false },
  { id: "3", name: "대학영어회화", credits: 1, grade: "C+", isMajor: false },
  { id: "4", name: "멀티미디어프로그래밍", credits: 2, grade: "D+", isMajor: true },
  { id: "5", name: "캐릭터디자인", credits: 2, grade: "F", isMajor: true },
];

const LOCAL_STORAGE_KEY = "intip_grade_calculator_data";

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  if (!payload || !payload.value) return null;
  const parts = payload.value.split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} textAnchor="middle" fill="#8b95a1" fontSize={11} fontWeight={500}>
        {parts[0]}
      </text>
      {parts[1] && (
        <text x={0} y={26} textAnchor="middle" fill="#8b95a1" fontSize={11} fontWeight={500}>
          {parts[1]}
        </text>
      )}
    </g>
  );
};

export default function MobileGradeCalculatorPage() {
  // --- State ---
  const [selectedSemester, setSelectedSemester] = useState<string>("2학년 1학기");
  const [semestersData, setSemestersData] = useState<SemestersData>({});
  const [targetCredits, setTargetCredits] = useState<number>(130);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [showSemesterSheet, setShowSemesterSheet] = useState<boolean>(false);
  const [showTimetableSheet, setShowTimetableSheet] = useState<boolean>(false);

  const { timetables } = useTimetableStore();

  // --- Header Integration ---
  useHeader({
    title: "학점계산기",
    hasback: true,
    rightArea: null,
  });

  // --- Load Data ---
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.semestersData) setSemestersData(parsed.semestersData);
        if (parsed.targetCredits) setTargetCredits(parsed.targetCredits);
      } catch (e) {
        console.error("Failed to parse cached grades", e);
      }
    } else {
      // Default initial data
      const initial: SemestersData = {
        "2학년 1학기": DEFAULT_SUBJECTS_2_1,
      };
      setSemestersData(initial);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ semestersData: initial, targetCredits: 130 }));
    }
  }, []);

  // --- Save Data Helper ---
  const saveToLocalStorage = (newData: SemestersData, targetC: number = targetCredits) => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ semestersData: newData, targetCredits: targetC })
    );
  };

  // --- Subject Operations ---
  const currentSubjects = useMemo(() => {
    return semestersData[selectedSemester] || [];
  }, [semestersData, selectedSemester]);

  const updateSubjects = (newSubjects: Subject[]) => {
    const updated = {
      ...semestersData,
      [selectedSemester]: newSubjects,
    };
    setSemestersData(updated);
    saveToLocalStorage(updated);
  };

  const handleAddSubject = () => {
    const newSub: Subject = {
      id: `${Date.now()}-${Math.random()}`,
      name: "",
      credits: 3,
      grade: "A+",
      isMajor: false,
    };
    updateSubjects([...currentSubjects, newSub]);
  };

  const handleUpdateSubject = (id: string, field: keyof Subject, value: any) => {
    const updated = currentSubjects.map((sub) => {
      if (sub.id === id) {
        return { ...sub, [field]: value };
      }
      return sub;
    });
    updateSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = currentSubjects.filter((sub) => sub.id !== id);
    updateSubjects(updated);
  };

  const handleResetSubjects = () => {
    if (window.confirm("이 학기의 입력된 모든 과목 정보를 초기화할까요?")) {
      updateSubjects([]);
    }
  };

  // --- Target Credits Change ---
  const handleEditTargetCredits = () => {
    const val = window.prompt("목표 취득 학점을 입력해주세요. (예: 130)", String(targetCredits));
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setTargetCredits(parsed);
        saveToLocalStorage(semestersData, parsed);
      } else {
        alert("올바른 숫자를 입력해주세요.");
      }
    }
  };

  // --- Calculations ---
  // Helper to calculate statistics for a given list of subjects
  const calculateSemesterStats = (subjects: Subject[]) => {
    let totalGpaCredits = 0;
    let totalGpaPoints = 0;
    let majorGpaCredits = 0;
    let majorGpaPoints = 0;
    let acquiredCredits = 0;

    subjects.forEach((sub) => {
      // P, NP do not count in GPA
      const countsInGpa = sub.grade !== "P" && sub.grade !== "NP";
      const isPass = sub.grade !== "F" && sub.grade !== "NP";

      if (isPass) {
        acquiredCredits += sub.credits;
      }

      if (countsInGpa) {
        const point = GRADE_POINTS[sub.grade] ?? 0.0;
        totalGpaCredits += sub.credits;
        totalGpaPoints += sub.credits * point;

        if (sub.isMajor) {
          majorGpaCredits += sub.credits;
          majorGpaPoints += sub.credits * point;
        }
      }
    });

    const gpa = totalGpaCredits > 0 ? totalGpaPoints / totalGpaCredits : 0.0;
    const majorGpa = majorGpaCredits > 0 ? majorGpaPoints / majorGpaCredits : 0.0;

    return { gpa, majorGpa, acquiredCredits };
  };

  // Overall/Cumulative calculations across all semesters
  const overallStats = useMemo(() => {
    let totalGpaCredits = 0;
    let totalGpaPoints = 0;
    let majorGpaCredits = 0;
    let majorGpaPoints = 0;
    let totalAcquired = 0;

    Object.keys(semestersData).forEach((sem) => {
      const subjects = semestersData[sem] || [];
      subjects.forEach((sub) => {
        const countsInGpa = sub.grade !== "P" && sub.grade !== "NP";
        const isPass = sub.grade !== "F" && sub.grade !== "NP";

        if (isPass) {
          totalAcquired += sub.credits;
        }

        if (countsInGpa) {
          const point = GRADE_POINTS[sub.grade] ?? 0.0;
          totalGpaCredits += sub.credits;
          totalGpaPoints += sub.credits * point;

          if (sub.isMajor) {
            majorGpaCredits += sub.credits;
            majorGpaPoints += sub.credits * point;
          }
        }
      });
    });

    const gpa = totalGpaCredits > 0 ? totalGpaPoints / totalGpaCredits : 0.0;
    const majorGpa = majorGpaCredits > 0 ? majorGpaPoints / majorGpaCredits : 0.0;

    return {
      gpa,
      majorGpa,
      acquiredCredits: totalAcquired,
    };
  }, [semestersData]);

  // Current semester calculations
  const currentSemesterStats = useMemo(() => {
    return calculateSemesterStats(currentSubjects);
  }, [currentSubjects]);

  // --- SVG Graph Data ---
  const graphData = useMemo(() => {
    const semestersWithData = SEMESTERS.map((sem) => {
      const subjects = semestersData[sem] || [];
      if (subjects.length === 0) return null;
      const stats = calculateSemesterStats(subjects);
      return { semester: sem, gpa: stats.gpa };
    }).filter((item): item is { semester: string; gpa: number } => item !== null);

    return semestersWithData;
  }, [semestersData]);

  // --- Timetable Importer ---
  const handleImportTimetable = (timetableId: number) => {
    const tb = timetables.find((t) => t.id === timetableId);
    if (!tb) return;

    if (
      window.confirm(
        `"${tb.semester} (${tb.name})" 시간표의 과목들을 불러올까요?\n현재 학기(${selectedSemester})에 작성 중인 과목 목록은 덮어씌워집니다.`
      )
    ) {
      const imported: Subject[] = tb.events.map((event) => {
        // Estimate credits based on class hours (endTime - startTime)
        // Usually, 2 hours = 2 credits, 3 hours = 3 credits, etc.
        const hours = Math.max(1, event.endTime - event.startTime);
        return {
          id: `${Date.now()}-${Math.random()}`,
          name: event.name,
          credits: hours,
          grade: "A+",
          isMajor: false,
        };
      });

      updateSubjects(imported);
      setShowTimetableSheet(false);
    }
  };

  return (
    <PageWrapper>
      {/* 1. 전체 학기 요약 카드 */}
      <StickyStatsCard>
        <StatsHeader>
          <StatsTitle>전체 학기</StatsTitle>
        </StatsHeader>
        <StatsRow>
          <StatBox>
            <StatLabel>전체 평점</StatLabel>
            <StatValueWrapper>
              <StatValueText>{overallStats.gpa.toFixed(2)}</StatValueText>
              <StatMaxText>/ 4.5</StatMaxText>
            </StatValueWrapper>
          </StatBox>
          <StatBox>
            <StatLabel>전공 평점</StatLabel>
            <StatValueWrapper>
              <StatValueText>{overallStats.majorGpa.toFixed(2)}</StatValueText>
              <StatMaxText>/ 4.5</StatMaxText>
            </StatValueWrapper>
          </StatBox>
          <StatBox>
            <StatLabel>취득 학점</StatLabel>
            <StatValueWrapper>
              <StatValueText>{overallStats.acquiredCredits}</StatValueText>
              <TargetCreditsButton onClick={handleEditTargetCredits}>
                <span className="target-limit">/ {targetCredits}</span>
                <Pencil size={12} className="pencil-icon" />
              </TargetCreditsButton>
            </StatValueWrapper>
          </StatBox>
        </StatsRow>

        {/* 그래프 토글 헤더 (항상 노출, 좌측 상단 버튼 배치) */}
        <GraphHeaderRow>
          <GraphFoldButton onClick={() => setShowGraph(!showGraph)}>
            <span>{showGraph ? "그래프 접기" : "그래프 보기"}</span>
            {showGraph ? <ChevronUp size={16} className="caret-icon" /> : <ChevronDown size={16} className="caret-icon" />}
          </GraphFoldButton>
          {showGraph && (
            <GraphLegendRow>
              <LegendItem>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <line x1="0" y1="4" x2="12" y2="4" stroke="var(--border-brand, #0061FF)" strokeWidth="2"/>
                  <circle cx="6" cy="4" r="2.5" fill="#ffffff" stroke="var(--border-brand, #0061FF)" strokeWidth="2"/>
                </svg>
                <span>전체 평점</span>
              </LegendItem>
              <LegendItem>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <line x1="0" y1="4" x2="12" y2="4" stroke="var(--border-warn, #FEE588)" strokeWidth="2"/>
                  <circle cx="6" cy="4" r="2.5" fill="#ffffff" stroke="var(--border-warn, #FEE588)" strokeWidth="2"/>
                </svg>
                <span>전공 평점</span>
              </LegendItem>
            </GraphLegendRow>
          )}
        </GraphHeaderRow>

        <GraphSection $expanded={showGraph}>
          {/* 그래프 카드 본문 */}
          {graphData.length < 2 ? (
            <EmptyGraphText>다음 학기부터 성적 추이를 볼 수 있어요.</EmptyGraphText>
          ) : (
            <GraphCardBody style={{ height: "220px", marginTop: "12px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    return graphData.map((d) => {
                      const subjects = semestersData[d.semester] || [];
                      const stats = calculateSemesterStats(subjects);
                      return {
                        name: d.semester,
                        overall: parseFloat(d.gpa.toFixed(2)),
                        major: parseFloat(stats.majorGpa.toFixed(2)),
                      };
                    });
                  })()}
                  margin={{ top: 20, right: 16, left: 8, bottom: 30 }}
                >
                  <ReferenceLine y={4.5} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={4.0} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={3.5} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={3.0} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={2.0} stroke="#e5e8eb" strokeWidth={1} />

                  <XAxis
                    dataKey="name"
                    tick={<CustomXAxisTick />}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    padding={{ left: 24, right: 24 }}
                  />
                  <YAxis
                    domain={[1.2, 4.8]}
                    ticks={[2.0, 3.0, 3.5, 4.0, 4.5]}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    interval={0}
                    tickFormatter={(val) => val.toFixed(1)}
                    tick={{ fill: "#8b95a1", fontSize: 12, fontWeight: 500 }}
                  />
                  <Line
                    type="linear"
                    dataKey="overall"
                    stroke="var(--border-brand, #0061FF)"
                    strokeWidth={2.5}
                    dot={{ stroke: "var(--border-brand, #0061FF)", strokeWidth: 2, r: 4, fill: "#ffffff", fillOpacity: 1 }}
                    label={{ position: "top", fill: "#333d4b", fontSize: 10, fontWeight: "bold", offset: 8 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="linear"
                    dataKey="major"
                    stroke="var(--border-warn, #FEE588)"
                    strokeWidth={2.5}
                    dot={{ stroke: "var(--border-warn, #FEE588)", strokeWidth: 2, r: 4, fill: "#ffffff", fillOpacity: 1 }}
                    label={{ position: "top", fill: "#8b95a1", fontSize: 10, fontWeight: "bold", offset: 8 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GraphCardBody>
          )}
        </GraphSection>
      </StickyStatsCard>

      {/* 2. 학기별 학점계산기 메인 카드 */}
      <MainContainer>
        <SemesterSummaryHeader>
          <SemesterSelectButton onClick={() => setShowSemesterSheet(true)}>
            <span className="semester-name">{selectedSemester}</span>
            <ChevronDown size={20} className="dropdown-caret" />
          </SemesterSelectButton>

          <SemesterStatsRow>
            <SemStatBox>
              <span className="stat-val bold">{currentSemesterStats.gpa.toFixed(2)}</span>
              <span className="stat-label">평점</span>
            </SemStatBox>
            <SemStatBox>
              <span className="stat-val">{currentSemesterStats.majorGpa.toFixed(2)}</span>
              <span className="stat-label">전공</span>
            </SemStatBox>
            <SemStatBox>
              <span className="stat-val">{currentSemesterStats.acquiredCredits}</span>
              <span className="stat-label">취득</span>
            </SemStatBox>
          </SemesterStatsRow>

          <ImportTimetableButton onClick={() => setShowTimetableSheet(true)}>
            <Calendar size={16} className="calendar-icon" />
            <span className="import-text">시간표 불러오기</span>
          </ImportTimetableButton>
        </SemesterSummaryHeader>

        {/* 3. 과목 리스트 테이블 */}
        <GradeTable>
          <TableHeader>
            <ColSubject>과목명</ColSubject>
            <ColCredits>학점</ColCredits>
            <ColGrade>성적</ColGrade>
            <ColMajor>전공</ColMajor>
            <ColDelete></ColDelete>
          </TableHeader>

          <TableBody>
            {currentSubjects.length === 0 ? (
              <EmptyRowText>등록된 과목이 없습니다. 아래 과목 추가를 눌러보세요.</EmptyRowText>
            ) : (
              currentSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <ColSubject>
                    <SubjectInput
                      type="text"
                      value={subject.name}
                      placeholder="과목명 입력"
                      onChange={(e) => handleUpdateSubject(subject.id, "name", e.target.value)}
                    />
                  </ColSubject>
                  <ColCredits>
                    <CreditsSelectorWrapper>
                      <span className="credits-val">{subject.credits}</span>
                      <HiddenSelect
                        value={subject.credits}
                        onChange={(e) => handleUpdateSubject(subject.id, "credits", parseInt(e.target.value, 10))}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </HiddenSelect>
                    </CreditsSelectorWrapper>
                  </ColCredits>
                  <ColGrade>
                    <GradeSelectorButton>
                      <span className="grade-val">{subject.grade}</span>
                      <ChevronDown size={14} className="grade-caret" />
                      <HiddenSelect
                        value={subject.grade}
                        onChange={(e) => handleUpdateSubject(subject.id, "grade", e.target.value)}
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </HiddenSelect>
                    </GradeSelectorButton>
                  </ColGrade>
                  <ColMajor>
                    <CheckboxWrapper onClick={() => handleUpdateSubject(subject.id, "isMajor", !subject.isMajor)}>
                      {subject.isMajor ? (
                        <CheckedIcon>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </CheckedIcon>
                      ) : (
                        <UncheckedIcon />
                      )}
                    </CheckboxWrapper>
                  </ColMajor>
                  <ColDelete>
                    <DeleteButton onClick={() => handleDeleteSubject(subject.id)}>
                      <X size={16} />
                    </DeleteButton>
                  </ColDelete>
                </TableRow>
              ))
            )}
          </TableBody>

          {/* 테이블 하단 컨트롤 */}
          <TableFooter>
            <AddSubjectButton onClick={handleAddSubject}>
              <Plus size={16} />
              <span>과목 추가</span>
            </AddSubjectButton>
            <ResetButton onClick={handleResetSubjects}>초기화</ResetButton>
          </TableFooter>
        </GradeTable>
      </MainContainer>

      {/* 학기 선택 바텀 시트 */}
      {showSemesterSheet && (
        <>
          <SheetOverlay onClick={() => setShowSemesterSheet(false)} />
          <BottomSheet>
            <SheetHeader>
              <div className="drag-handle" />
              <div className="title">학기 선택</div>
            </SheetHeader>
            <SheetList>
              {SEMESTERS.map((sem) => (
                <SheetItem
                  key={sem}
                  $active={sem === selectedSemester}
                  onClick={() => {
                    setSelectedSemester(sem);
                    setShowSemesterSheet(false);
                  }}
                >
                  {sem}
                </SheetItem>
              ))}
            </SheetList>
          </BottomSheet>
        </>
      )}

      {/* 시간표 불러오기 바텀 시트 */}
      {showTimetableSheet && (
        <>
          <SheetOverlay onClick={() => setShowTimetableSheet(false)} />
          <BottomSheet>
            <SheetHeader>
              <div className="drag-handle" />
              <div className="title">시간표 불러오기</div>
            </SheetHeader>
            <SheetList>
              {timetables.length === 0 ? (
                <EmptySheetText>등록된 시간표가 없습니다.</EmptySheetText>
              ) : (
                timetables.map((tb) => (
                  <SheetItem key={tb.id} onClick={() => handleImportTimetable(tb.id)}>
                    <div className="timetable-info">
                      <span className="semester">{tb.semester}</span>
                      <span className="name">{tb.name}</span>
                      <span className="count">({tb.events.length}개 과목)</span>
                    </div>
                  </SheetItem>
                ))
              )}
            </SheetList>
          </BottomSheet>
        </>
      )}
    </PageWrapper>
  );
}

// --- Styled Components ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 24px 16px 24px;
  gap: 16px;
`;

// 1. 요약 카드 스타일
const StickyStatsCard = styled.div`
  background-color: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 16px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
`;

const StatsTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
  margin: 0;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 8px;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 4px;
`;

const StatValueWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
`;

const StatValueText = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-secondary, #333d4b);
  letter-spacing: -0.2px;
  line-height: 32px;
`;

const StatMaxText = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
  line-height: 16px;
`;

const TargetCreditsButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 0;
  outline: none;

  .target-limit {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
    line-height: 16px;
  }

  .pencil-icon {
    color: var(--text-tertiary, #8b95a1);
    opacity: 0.8;
  }

  &:hover .pencil-icon {
    opacity: 1;
  }
`;

const GraphSection = styled.div<{ $expanded: boolean }>`
  border-top: 1px solid ${(props) => (props.$expanded ? "var(--border-default, #e5e8eb)" : "transparent")};
  padding: ${(props) => (props.$expanded ? "16px 0 8px" : "0px")};
  width: 100%;
  max-height: ${(props) => (props.$expanded ? "320px" : "0px")};
  opacity: ${(props) => (props.$expanded ? "1" : "0")};
  transform: ${(props) => (props.$expanded ? "translateY(0)" : "translateY(-10px)")};
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease,
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s ease;
`;

const GraphHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 44px;
`;

const GraphFoldButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  outline: none;

  span {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-tertiary, #8b95a1);
  }

  .caret-icon {
    color: var(--text-tertiary, #8b95a1);
  }
`;

const GraphLegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const GraphCardBody = styled.div`
  display: flex;
  width: 100%;
  margin-top: 8px;
`;



const EmptyGraphText = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--text-disabled, #b0b8c1);
  padding: 40px 16px;
  width: 100%;
`;



// 2. 메인 컨테이너 스타일
const MainContainer = styled.div`
  background-color: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const SemesterSummaryHeader = styled.div`
  padding: 16px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterSelectButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
  outline: none;

  .semester-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #333d4b);
  }

  .dropdown-caret {
    color: var(--text-secondary, #333d4b);
  }
`;

const SemesterStatsRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 4px;
`;

const SemStatBox = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;

  .stat-val {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #333d4b);

    &.bold {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 32px;
    }
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const ImportTimetableButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 0;
  align-self: flex-start;
  outline: none;
  margin-top: 8px;

  .calendar-icon {
    color: var(--text-brand, #0061ff);
  }

  .import-text {
    font-size: 14px;
    color: var(--text-brand, #0061ff);
  }
`;

// 3. 과목 테이블 스타일
const GradeTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  border-top: 1px solid var(--border-default, #e5e8eb);
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-subtle, #f8f9fb);
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  font-weight: 400;
  text-align: center;
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  height: 52px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  &:last-child {
    border-bottom: none;
  }
`;

const EmptyRowText = styled.div`
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  padding: 40px 16px;
`;

// 컬럼 비율/가로 정의
const ColSubject = styled.div`
  flex: 1;
  text-align: left;
  padding-left: 16px;
  min-width: 0;
`;

const ColCredits = styled.div`
  width: 60px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const ColGrade = styled.div`
  width: 70px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const ColMajor = styled.div`
  width: 50px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const ColDelete = styled.div`
  width: 40px;
  text-align: center;
  display: flex;
  justify-content: center;
  padding-right: 8px;
`;

// 입력 요소들 스타일
const SubjectInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-secondary, #333d4b);
  outline: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  &::placeholder {
    color: var(--text-disabled, #b0b8c1);
  }
`;

const CreditsSelectorWrapper = styled.div`
  position: relative;
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 8px;
  background-color: var(--bg-subtle, #f8f9fb);
  cursor: pointer;

  .credits-val {
    font-size: 14px;
    color: var(--text-secondary, #333d4b);
  }
`;

const GradeSelectorButton = styled.div`
  position: relative;
  background-color: var(--bg-warn-subtle, #fffaeb);
  border: 1px solid #fef3c7; /* border/warn-subtle */
  border-radius: 999px;
  height: 32px;
  width: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;

  .grade-val {
    font-size: 14px;
    font-weight: 500;
    color: var(--yellow-600, #b58000);
    text-align: center;
    min-width: 24px;
  }

  .grade-caret {
    color: var(--yellow-600, #b58000);
    opacity: 0.4;
  }
`;

// 네이티브 셀렉트 오버레이
const HiddenSelect = styled.select`
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  -webkit-appearance: none;
  outline: none;
`;

// 체크박스 커스텀
const CheckboxWrapper = styled.div`
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckedIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: var(--interactive-primary-pressed, #0061ff);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UncheckedIcon = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-strong, #d1d6db);
  border-radius: 8px;
  box-sizing: border-box;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary, #8b95a1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  outline: none;
  opacity: 0.7;

  &:hover {
    color: var(--text-error, #ef4444);
    opacity: 1;
  }
`;

// 테이블 푸터 컨트롤
const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const AddSubjectButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--interactive-primary, #3b82f6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  padding: 4px 0;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  padding: 4px 0;
`;

// 바텀 시트 스타일들
const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const BottomSheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-base, #ffffff);
  border-radius: 24px 24px 0 0;
  max-height: 70vh;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s cubic-bezier(0.1, 0.76, 0.55, 0.94);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 8px;

  .drag-handle {
    width: 36px;
    height: 4px;
    background-color: var(--border-default, #e5e8eb);
    border-radius: 2px;
    margin-bottom: 12px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary, #333d4b);
  }
`;

const SheetList = styled.div`
  overflow-y: auto;
  padding: 8px 16px 24px;
  display: flex;
  flex-direction: column;
`;

const SheetItem = styled.div<{ $active?: boolean }>`
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 15px;
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  background-color: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "transparent")};
  cursor: pointer;

  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }

  .timetable-info {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .semester {
      font-size: 12px;
      color: var(--text-tertiary, #8b95a1);
    }
    
    .name {
      font-size: 14px;
      color: var(--text-secondary, #333d4b);
      font-weight: 500;
    }

    .count {
      font-size: 12px;
      color: var(--text-brand, #0061ff);
    }
  }
`;

const EmptySheetText = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
  padding: 32px 16px;
`;
