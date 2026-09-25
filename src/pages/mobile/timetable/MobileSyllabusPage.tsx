import { useMemo, useState } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Icon from "@/components/common/Icon";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import CapsuleButton from "@/components/common/CapsuleButton";
import { useSyllabus } from "@/hooks/useSyllabus";
import type { SyllabusContent } from "@/types/syllabus";

// 진행률 표(수업방식비율/기자재활용비율/성적평가비율) 세그먼트에 순서대로 돌려쓰는 색상.
// 디자인 토큰에 없는 항목 수까지 대비해 고정 hex로 넉넉히 둔다.
const RATIO_COLORS = [
  "#0061ff",
  "#ffc72c",
  "#10b981",
  "#f43f5e",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
  "#64748b",
];

// 값이 0(혹은 null)인 항목은 표에서 굳이 강조할 필요가 없어 걸러낸다.
const toRatioEntries = (record?: Record<string, number | null> | null) =>
  Object.entries(record ?? {}).filter(([, v]) => v !== null && v !== undefined);

const splitLines = (text?: string | null) =>
  (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

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
          <Icon name="chevron-down" size={24} />
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

interface SyllabusLocationState {
  courseOfferingId?: number;
  courseName?: string;
  professor?: string;
}

// --- 메인 페이지 컴포넌트 ---
const MobileSyllabusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = (location.state ?? {}) as SyllabusLocationState;
  const paramId = searchParams.get("id") || searchParams.get("courseOfferingId");
  const courseOfferingId =
    state.courseOfferingId ?? (paramId ? Number(paramId) : undefined);

  const {
    syllabus,
    isLoading,
    isError,
    refetch,
  } = useSyllabus(courseOfferingId, { enabled: courseOfferingId !== undefined });

  const content: SyllabusContent | null = syllabus?.content ?? null;

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

  const courseName =
    content?.과목명 || state.courseName || searchParams.get("name") || "-";
  const professor =
    content?.교수 || state.professor || searchParams.get("professor") || "-";

  const deliveryRows = useMemo(
    () => toRatioEntries(content?.수업방식비율),
    [content],
  );
  const equipmentRows = useMemo(
    () => toRatioEntries(content?.기자재활용비율),
    [content],
  );
  const evaluationRows = useMemo(
    () => toRatioEntries(content?.성적평가비율),
    [content],
  );
  const coreCompetencyRows = useMemo(
    () => toRatioEntries(content?.핵심역량가중치),
    [content],
  );
  const overviewParagraphs = useMemo(
    () => splitLines(content?.교과목개요및목적),
    [content],
  );
  const objectiveLines = useMemo(() => splitLines(content?.수업목표), [content]);

  const handleAddToTimetable = () => {
    alert(`"${courseName}" 과목이 시간표에 추가되었습니다.`);
    navigate(ROUTES.TIMETABLE.EDIT, { replace: true });
  };

  if (courseOfferingId === undefined) {
    return (
      <PageWrapper>
        <EmptyState padding="120px 24px">
          강의 정보를 찾을 수 없어요. 시간표에서 다시 시도해 주세요.
        </EmptyState>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <HeaderBlock>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="30%" height={20} />
        </HeaderBlock>
        <CatalogInfo>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="card"
              height={48}
              style={{ marginBottom: 8 }}
            />
          ))}
        </CatalogInfo>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper>
        <EmptyState padding="120px 24px">
          강의계획서를 불러오지 못했어요.
          <RetryButton type="button" onClick={() => refetch()}>
            다시 시도
          </RetryButton>
        </EmptyState>
      </PageWrapper>
    );
  }

  if (!content) {
    return (
      <PageWrapper>
        <HeaderBlock>
          <CourseTitleWrapper>
            <CourseTitle>{courseName}</CourseTitle>
            {professor !== "-" && <ProfessorName>{professor}</ProfessorName>}
          </CourseTitleWrapper>
        </HeaderBlock>
        <EmptyState padding="80px 24px">
          아직 등록된 강의계획서가 없어요.
        </EmptyState>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* 1. 헤더 블록 */}
      <HeaderBlock>
        <CourseTitleWrapper>
          <CourseTitle>{courseName}</CourseTitle>
          <ProfessorName>{professor}</ProfessorName>
        </CourseTitleWrapper>
        <ChipRow>
          {content.학점 && (
            <Chip>
              <span>{content.학점}학점</span>
            </Chip>
          )}
          {content.이수구분 && (
            <Chip>
              <span>{content.이수구분}</span>
            </Chip>
          )}
          {content.성적평가방법 && (
            <Chip>
              <span>{content.성적평가방법}</span>
            </Chip>
          )}
        </ChipRow>
      </HeaderBlock>

      {/* 2. 기본 정보 표 */}
      <CatalogInfo>
        <CatalogInfoRow>
          <InfoLabel>학과</InfoLabel>
          <InfoValue>{content.학과 || content.소속 || "-"}</InfoValue>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>학년</InfoLabel>
          <InfoValue>{content.학년 ? `${content.학년}학년` : "-"}</InfoValue>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>과목코드</InfoLabel>
          <InfoValue>{content.과목코드 || "-"}</InfoValue>
        </CatalogInfoRow>
        <CatalogInfoRow>
          <InfoLabel>요일/교시/강의실</InfoLabel>
          <InfoValue>{content.요일교시강의실 || "-"}</InfoValue>
        </CatalogInfoRow>
        {content.면담가능시간 && (
          <CatalogInfoRow>
            <InfoLabel>면담가능시간</InfoLabel>
            <InfoValue>{content.면담가능시간}</InfoValue>
          </CatalogInfoRow>
        )}
        {content.전화번호 && (
          <CatalogInfoRow>
            <InfoLabel>연락처</InfoLabel>
            <InfoValue>{content.전화번호}</InfoValue>
          </CatalogInfoRow>
        )}
      </CatalogInfo>

      {/* 3. 아코디언 섹션 목록 */}
      <AccordionSectionGroup>
        {/* 교과목개요 */}
        <Accordion
          title="교과목개요"
          isOpen={openSections.overview}
          onToggle={() => toggleSection("overview")}
        >
          {overviewParagraphs.length > 0 ? (
            <OverviewText>
              {overviewParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </OverviewText>
          ) : (
            <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
          )}
        </Accordion>

        {/* 수업목표 */}
        <Accordion
          title="수업목표"
          isOpen={openSections.objectives}
          onToggle={() => toggleSection("objectives")}
        >
          {objectiveLines.length > 0 ? (
            <BulletList>
              {objectiveLines.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </BulletList>
          ) : (
            <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
          )}
        </Accordion>

        {/* 수업진행방법 */}
        <Accordion
          title="수업진행방법"
          isOpen={openSections.delivery}
          onToggle={() => toggleSection("delivery")}
        >
          {content.수업진행방법 && <OverviewText><p>{content.수업진행방법}</p></OverviewText>}
          {deliveryRows.length > 0 && (
            <>
              <TableTitle>수업방식</TableTitle>
              <DeliveryTable $columns={deliveryRows.length}>
                {deliveryRows.map(([name, value]) => (
                  <TableCell key={name}>
                    <div className="label-container">
                      <span className="label-text">{name}</span>
                    </div>
                    <div className="value-container">
                      <span className="value-text">{value}%</span>
                    </div>
                  </TableCell>
                ))}
              </DeliveryTable>
            </>
          )}

          {equipmentRows.length > 0 && (
            <>
              <TableTitle style={{ marginTop: "8px" }}>기자재활용</TableTitle>
              <DeliveryTable $columns={equipmentRows.length}>
                {equipmentRows.map(([name, value]) => (
                  <TableCell key={name}>
                    <div className="label-container">
                      <span className="label-text">{name}</span>
                    </div>
                    <div className="value-container">
                      <span className="value-text">{value}%</span>
                    </div>
                  </TableCell>
                ))}
              </DeliveryTable>
            </>
          )}

          {deliveryRows.length === 0 && equipmentRows.length === 0 && !content.수업진행방법 && (
            <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
          )}
        </Accordion>

        {/* 학습평가방법 */}
        <Accordion
          title="학습평가방법"
          isOpen={openSections.grading}
          onToggle={() => toggleSection("grading")}
        >
          {content.학습평가방법 && <OverviewText><p>{content.학습평가방법}</p></OverviewText>}
          {evaluationRows.length > 0 ? (
            <>
              <GradingProgressBar>
                {evaluationRows.map(([name, value], idx) => (
                  <GradingProgressSegment
                    key={name}
                    $width={value ?? 0}
                    $bgColor={RATIO_COLORS[idx % RATIO_COLORS.length]}
                  />
                ))}
              </GradingProgressBar>
              <GradingLegendRow>
                {evaluationRows.map(([name, value], idx) => (
                  <GradingLegendItem key={name}>
                    <div
                      className="dot"
                      style={{
                        backgroundColor: RATIO_COLORS[idx % RATIO_COLORS.length],
                      }}
                    />
                    <span className="text">
                      {name} {value}%
                    </span>
                  </GradingLegendItem>
                ))}
              </GradingLegendRow>
            </>
          ) : (
            !content.학습평가방법 && (
              <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
            )
          )}
        </Accordion>

        {/* 주교재/참고서적 */}
        <Accordion
          title="주교재/참고서적"
          isOpen={openSections.books}
          onToggle={() => toggleSection("books")}
        >
          {content.교재?.주교재?.map((ref, idx) => (
            <ReferenceCard key={`main-${idx}`}>
              <ReferenceHeaderRow>
                <ReferenceTitle>{ref.교재명 || "-"}</ReferenceTitle>
                <ReferenceChip>
                  <span>주교재</span>
                </ReferenceChip>
              </ReferenceHeaderRow>
              <ReferenceDetailsRow>
                <span className="author">{ref.저자 || "-"}</span>
                {ref.출판사 && (
                  <>
                    <span className="separator">·</span>
                    <span className="details">{ref.출판사}</span>
                  </>
                )}
                {ref.발행년도 && (
                  <>
                    <span className="separator">·</span>
                    <span className="details">{ref.발행년도}</span>
                  </>
                )}
              </ReferenceDetailsRow>
            </ReferenceCard>
          ))}
          {content.교재?.참고서적?.map((ref, idx) => (
            <ReferenceCard key={`ref-${idx}`}>
              <ReferenceHeaderRow>
                <ReferenceTitle>{ref.교재명 || "-"}</ReferenceTitle>
                <ReferenceChip>
                  <span>참고서적</span>
                </ReferenceChip>
              </ReferenceHeaderRow>
              <ReferenceDetailsRow>
                <span className="author">{ref.저자 || "-"}</span>
                {ref.출판사 && (
                  <>
                    <span className="separator">·</span>
                    <span className="details">{ref.출판사}</span>
                  </>
                )}
                {ref.발행년도 && (
                  <>
                    <span className="separator">·</span>
                    <span className="details">{ref.발행년도}</span>
                  </>
                )}
              </ReferenceDetailsRow>
            </ReferenceCard>
          ))}
          {content.교재?.기타서적 && (
            <ReferenceCard>
              <ReferenceHeaderRow>
                <ReferenceTitle>{content.교재.기타서적}</ReferenceTitle>
                <ReferenceChip>
                  <span>기타서적</span>
                </ReferenceChip>
              </ReferenceHeaderRow>
            </ReferenceCard>
          )}
          {!content.교재?.주교재?.length &&
            !content.교재?.참고서적?.length &&
            !content.교재?.기타서적 && (
              <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
            )}
        </Accordion>

        {/* 주별 세부 수업계획 */}
        <Accordion
          title="주별 세부 수업계획"
          isOpen={openSections.weekly}
          onToggle={() => toggleSection("weekly")}
        >
          {content.주별수업계획?.length ? (
            content.주별수업계획.map((plan, idx) => (
              <WeeklyPlanItem key={idx}>
                <WeeklyChip>
                  <span>{plan.주차 ? `${plan.주차}주차` : "-"}</span>
                </WeeklyChip>
                <WeeklyDesc>{plan.내용 || "-"}</WeeklyDesc>
              </WeeklyPlanItem>
            ))
          ) : (
            <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
          )}
        </Accordion>

        {/* 과제 */}
        <Accordion
          title="과제"
          isOpen={openSections.assignments}
          onToggle={() => toggleSection("assignments")}
        >
          {content.과제?.length ? (
            content.과제.map((assignment, idx) => (
              <AssignmentCard key={idx}>
                <AssignmentTitleRow>
                  <AssignmentTitle>{assignment.과제명 || "-"}</AssignmentTitle>
                  {assignment.번호 !== null && assignment.번호 !== undefined && (
                    <AssignmentChip>
                      <span>과제 {assignment.번호}</span>
                    </AssignmentChip>
                  )}
                </AssignmentTitleRow>
                {assignment.제출일 && (
                  <AssignmentField>
                    <span className="label">제출일</span>
                    <span className="value">{assignment.제출일}</span>
                  </AssignmentField>
                )}
                {assignment.목표 && (
                  <AssignmentField>
                    <span className="label">목표</span>
                    <span className="value">{assignment.목표}</span>
                  </AssignmentField>
                )}
                {assignment.진행방법및유의사항 && (
                  <AssignmentField>
                    <span className="label">진행방법</span>
                    <span className="value">{assignment.진행방법및유의사항}</span>
                  </AssignmentField>
                )}
                {assignment.참고자료 && (
                  <AssignmentField>
                    <span className="label">참고자료</span>
                    <span className="value">{assignment.참고자료}</span>
                  </AssignmentField>
                )}
              </AssignmentCard>
            ))
          ) : (
            <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
          )}
        </Accordion>

        {/* 핵심역량 / 전공능력 가중치 */}
        <Accordion
          title="핵심역량 / 전공능력 가중치"
          isOpen={openSections.weights}
          onToggle={() => toggleSection("weights")}
        >
          {coreCompetencyRows.length > 0 && (
            <WeightsSection>
              <span className="title">핵심역량</span>
              <TagChipRow>
                {coreCompetencyRows.map(([name, value]) => (
                  <TagChip key={name}>
                    <span>
                      {name} {value}
                    </span>
                  </TagChip>
                ))}
              </TagChipRow>
            </WeightsSection>
          )}
          {!!content.전공능력가중치?.length && (
            <WeightsSection style={{ marginTop: "8px" }}>
              <span className="title">전공능력</span>
              <TagChipRow>
                {content.전공능력가중치.map((w, idx) => (
                  <TagChip key={idx}>
                    <span>
                      {w.전공능력} {w.가중치}
                    </span>
                  </TagChip>
                ))}
              </TagChipRow>
            </WeightsSection>
          )}
          {coreCompetencyRows.length === 0 && !content.전공능력가중치?.length && (
            <EmptyState padding="8px 0">등록된 내용이 없어요.</EmptyState>
          )}
        </Accordion>
      </AccordionSectionGroup>

      {/* 4. 장애학생 학습지원 */}
      <DisabilitySupportBox>
        <DisabilityTitle>장애학생 학습지원</DisabilityTitle>
        <DisabilityContent>
          {content.장애학생학습지원 ? (
            <p>{content.장애학생학습지원}</p>
          ) : (
            <>
              <p>
                장애학생은 수강 시 필요한 지원 사항에 대하여 담당 교수 및
                장애학생지원센터에 요청할 수 있어요.
              </p>
              <p>예) 학습도우미, 과제제출, 시험시간 연장 등</p>
            </>
          )}
        </DisabilityContent>
      </DisabilitySupportBox>

      {/* 5. 하단 플로팅 버튼 그룹 (Gradient 백그라운드 포함) */}
      <BottomCTAContainer>
        <CapsuleButton
          variant="secondary"
          onClick={() => alert("강의평 페이지 준비 중입니다.")}
          style={{ width: "116px", flexShrink: 0 }}
        >
          강의평
        </CapsuleButton>
        <CapsuleButton variant="primary" fullWidth onClick={handleAddToTimetable}>
          시간표에 추가
        </CapsuleButton>
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

const RetryButton = styled.button`
  display: block;
  margin: 12px auto 0;
  padding: 8px 16px;
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-secondary, #333d4b);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
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
  flex-wrap: wrap;
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

const DeliveryTable = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => Math.max($columns, 1)}, 1fr);
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
  flex-wrap: wrap;
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
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
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
  flex: 1;
`;

const AssignmentChip = styled.div`
  background-color: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  padding: 2px 8px;
  border-radius: var(--radius-full, 999px);
  flex-shrink: 0;

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
  background: transparent;
  pointer-events: auto;

  @media ${DESKTOP_MEDIA} {
    max-width: 768px;
    left: 50%;
    transform: translateX(-50%);
  }
`;
