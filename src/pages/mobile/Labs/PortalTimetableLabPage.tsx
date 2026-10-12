import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import EmptyState from "@/components/common/EmptyState";
import CapsuleButton from "@/components/common/CapsuleButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import {
  checkPortalAccountLinked,
  fetchFullAcademicReportFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import {
  TimetableCourseItem,
  FullAcademicReport,
} from "@/utils/ssvParser";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import PortalTimetableImportSheet from "@/components/mobile/timetable/PortalTimetableImportSheet";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import {
  School,
  Clock,
  MapPin,
  User,
  BookOpen,
  Smartphone,
  Code,
  GraduationCap,
  Award,
  BookMarked,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";
import { useSemesters } from "@/hooks/useSemesters";
import { formatSemester, pickCurrentSemester, termToTmGbn } from "@/utils/semester";
import { secureStorage } from "@/utils/secureStorage";
import { typography } from "@/styles/typography";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";

type TabKey = "timetable" | "semesterGrades" | "courseGrades" | "credits" | "scholarship";

const PortalTimetableLabPage = () => {
  const navigate = useNavigate();
  const { semesters } = useSemesters();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  const [activeTab, setActiveTab] = useState<TabKey>("timetable");
  const [report, setReport] = useState<FullAcademicReport | null>(null);
  const [timetableList, setTimetableList] = useState<TimetableCourseItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [isPortalAccountModalOpen, setIsPortalAccountModalOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const semesterOptions = useMemo(
    () =>
      semesters.map((s) => ({
        id: s.id,
        year: s.year,
        term: s.term,
        label: formatSemester(s.year, s.term),
      })),
    [semesters],
  );

  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  useEffect(() => {
    if (semesters.length > 0 && selectedSemesterId === null) {
      const current = pickCurrentSemester(semesters);
      setSelectedSemesterId(current?.id ?? semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  const selectedSemester = useMemo(
    () => semesterOptions.find((s) => s.id === selectedSemesterId) ?? null,
    [semesterOptions, selectedSemesterId],
  );

  // 기기 내 포털 연동 여부 확인
  const checkLinkStatus = useCallback(async () => {
    if (isMobileAppEnvironment()) {
      try {
        const linked = await checkPortalAccountLinked();
        return linked;
      } catch (err) {
        console.debug("checkPortalAccountLinked error:", err);
      }
    }
    return false;
  }, []);

  // 컴포넌트 마운트 시 데이터 복구 및 연동 상태 확인
  useEffect(() => {
    let isMounted = true;
    const restoreData = async () => {
      const savedReport = await secureStorage.getItem<FullAcademicReport>("portal_lab_academic_report");
      const savedTimetable = await secureStorage.getItem<TimetableCourseItem[]>("portal_lab_timetable_list");
      const savedTime = localStorage.getItem("portal_lab_timetable_last_updated");

      if (!isMounted) return;
      if (savedReport) {
        setReport(savedReport);
        if (savedReport.timetable && savedReport.timetable.length > 0) {
          setTimetableList(savedReport.timetable);
        } else if (savedTimetable) {
          setTimetableList(savedTimetable);
        }
        setLastUpdated(savedTime || new Date().toISOString());
        setIsFetched(true);
      } else if (savedTimetable && savedTime) {
        setTimetableList(savedTimetable);
        setLastUpdated(savedTime);
        setIsFetched(true);
      } else {
        setIsFetched(false);
      }
    };

    void restoreData();
    void checkLinkStatus();

    return () => {
      isMounted = false;
    };
  }, [checkLinkStatus]);

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsEnabled, isLabsFlagFetched, navigate]);

  useHeader({
    title: "시간표 및 성적 종합 가져오기",
    hasback: true,
  });

  // 모바일 앱 브릿지를 통해 시간표 + 성적 + 장학금 일괄 가져오기
  const fetchAllDataFromBridge = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 연동은 INTIP 모바일 앱 환경에서만 가능해요.");
      return;
    }

    if (!selectedSemester) return;

    setIsLoading(true);
    setLoadingMessage("개인학적조회(시간표·성적·장학)를 확인하고 있어요... (약 5~10초)");

    try {
      const tmGbn = termToTmGbn(selectedSemester.term);
      const res = await fetchFullAcademicReportFromApp({
        yy: String(selectedSemester.year),
        tmGbn,
      });

      if (res.success && res.data) {
        const fullReport = res.data;
        const now = new Date().toISOString();

        setReport(fullReport);
        setTimetableList(fullReport.timetable || []);
        setLastUpdated(now);
        setIsFetched(true);

        void secureStorage.setItem("portal_lab_academic_report", fullReport);
        if (fullReport.timetable) {
          void secureStorage.setItem("portal_lab_timetable_list", fullReport.timetable);
        }
        localStorage.setItem("portal_lab_timetable_last_updated", now);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 300);

        const ttCount = fullReport.timetable?.length ?? 0;
        const semCount = fullReport.semesterGrades?.length ?? 0;
        const crsCount = fullReport.courseGrades?.length ?? 0;
        const scalCount = fullReport.scholarships?.length ?? 0;

        alert(
          `성공적으로 가져왔어요!\n` +
          `• 수강 시간표: ${ttCount}과목\n` +
          `• 성적 이력: ${semCount}개 학기 (${crsCount}개 과목)\n` +
          `• 장학금 수혜: ${scalCount}건`
        );
      } else {
        if (res.errorCode === "AUTH_REQUIRED") {
          setIsPortalAccountModalOpen(true);
        } else {
          alert(`데이터를 가져오는 데 실패했어요: ${res.errorMessage || "조회 오류"}`);
        }
      }
    } catch (error: unknown) {
      console.error("종합 데이터 조회 실패:", error);
      const msg = error instanceof Error ? error.message : "데이터를 가져오는 중 오류가 발생했어요.";
      alert(msg);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleMainAction = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 연동은 INTIP 모바일 앱 환경에서만 지원돼요.");
      return;
    }

    const linked = await checkLinkStatus();
    if (linked) {
      await fetchAllDataFromBridge();
    } else {
      setIsPortalAccountModalOpen(true);
    }
  };

  const totalCredits = useMemo(
    () =>
      timetableList.reduce((sum, item) => {
        const c = Number(item.credits);
        return sum + (Number.isFinite(c) ? c : 0);
      }, 0),
    [timetableList],
  );

  return (
    <PageWrapper as="main">
      {!isMobileAppEnvironment() && (
        <WarningBanner>
          <Smartphone size={20} color="var(--interactive-primary)" />
          <WarningBannerText>
            <strong>INTIP 모바일 앱 환경이 아니에요</strong>
            <br />
            포털 연동은 기기 보안 저장소를 사용하는 모바일 앱 환경에서만 안전하게 동작해요.
          </WarningBannerText>
          <LaunchButton type="button" onClick={() => openIntipAppOrStore()}>
            앱으로 열기
          </LaunchButton>
        </WarningBanner>
      )}

      <ContentSection as="section">
        <TitleContentArea title="기능 안내">
          <Box>
            <DescriptionTextWrapper>
              포털 학사행정의 <strong>개인학적조회</strong> 시스템에서 <strong>수강 시간표, 학기별·과목별 성적, 이수구분별 취득학점, 장학금 수혜 내역</strong>을 한 번에 안전하게 가져와요.
              개인정보는 서버로 전송되지 않고 이 기기 내에서만 처리돼요.
            </DescriptionTextWrapper>
          </Box>
        </TitleContentArea>

        <TitleContentArea title="조회 학기 선택">
          <Box>
            <SelectContainer>
              <StyledSelect
                value={selectedSemesterId ?? ""}
                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                disabled={isLoading}
                aria-label="조회 학기 선택"
              >
                {semesterOptions.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.label}
                  </option>
                ))}
              </StyledSelect>
            </SelectContainer>
          </Box>
        </TitleContentArea>

        {isFetched ? (
          <>
            {/* 탭 네비게이션 */}
            <TabBar role="tablist" aria-label="성적 및 시간표 조회 탭">
              <TabButton
                role="tab"
                aria-selected={activeTab === "timetable"}
                $active={activeTab === "timetable"}
                onClick={() => setActiveTab("timetable")}
              >
                <Calendar size={14} />
                <span>시간표</span>
              </TabButton>
              <TabButton
                role="tab"
                aria-selected={activeTab === "semesterGrades"}
                $active={activeTab === "semesterGrades"}
                onClick={() => setActiveTab("semesterGrades")}
              >
                <GraduationCap size={14} />
                <span>학기별 성적</span>
              </TabButton>
              <TabButton
                role="tab"
                aria-selected={activeTab === "courseGrades"}
                $active={activeTab === "courseGrades"}
                onClick={() => setActiveTab("courseGrades")}
              >
                <BookOpen size={14} />
                <span>과목별 성적</span>
              </TabButton>
              <TabButton
                role="tab"
                aria-selected={activeTab === "credits"}
                $active={activeTab === "credits"}
                onClick={() => setActiveTab("credits")}
              >
                <BookMarked size={14} />
                <span>취득학점·교양</span>
              </TabButton>
              <TabButton
                role="tab"
                aria-selected={activeTab === "scholarship"}
                $active={activeTab === "scholarship"}
                onClick={() => setActiveTab("scholarship")}
              >
                <Award size={14} />
                <span>장학금</span>
              </TabButton>
            </TabBar>

            {/* 탭 1: 수강 시간표 */}
            {activeTab === "timetable" && (
              <>
                <TitleContentArea title="수강 요약">
                  <Box>
                    <SummaryRow>
                      <SummaryItem>
                        <span className="label">신청 과목수</span>
                        <span className="value">{timetableList.length}과목</span>
                      </SummaryItem>
                      <SummaryDivider />
                      <SummaryItem>
                        <span className="label">신청 학점</span>
                        <span className="value">{totalCredits}학점</span>
                      </SummaryItem>
                      <SummaryDivider />
                      <SummaryItem>
                        <span className="label">조회 기준</span>
                        <span className="value">{selectedSemester?.label || "-"}</span>
                      </SummaryItem>
                    </SummaryRow>
                  </Box>
                </TitleContentArea>

                <TitleContentArea title={`과목별 시간표 (${timetableList.length}건)`}>
                  {timetableList.length > 0 ? (
                    <CourseList>
                      {timetableList.map((item, idx) => (
                        <CourseCard key={idx}>
                          <CourseHeader>
                            <CourseTitle>{item.courseName}</CourseTitle>
                            <StatusBadge>{item.courseType || "전공"}</StatusBadge>
                          </CourseHeader>

                          <CourseMetaGrid>
                            <MetaItem>
                              <User size={13} color="var(--text-tertiary)" />
                              <span>{item.professorName || "교수 미정"}</span>
                            </MetaItem>
                            <MetaItem>
                              <BookOpen size={13} color="var(--text-tertiary)" />
                              <span>
                                {item.credits}학점 · {item.departmentName || "개설학과"}
                              </span>
                            </MetaItem>
                          </CourseMetaGrid>

                          {item.timeSlots.length > 0 && (
                            <TimeSlotsWrapper>
                              {item.timeSlots.map((slot, sIdx) => (
                                <TimeSlotTag key={sIdx}>
                                  <Clock size={12} />
                                  <span>
                                    {slot.day} {slot.periods}
                                  </span>
                                  {(slot.building || slot.room) && (
                                    <>
                                      <MapPin size={12} />
                                      <span>
                                        {slot.building} {slot.room}
                                      </span>
                                    </>
                                  )}
                                </TimeSlotTag>
                              ))}
                            </TimeSlotsWrapper>
                          )}

                          <CourseCodeText>학수번호: {item.courseCode}</CourseCodeText>
                        </CourseCard>
                      ))}
                    </CourseList>
                  ) : (
                    <EmptyState padding="32px 0">조회된 시간표 과목이 없어요.</EmptyState>
                  )}
                </TitleContentArea>

                <ActionButton as="button" onClick={() => setIsImportSheetOpen(true)}>
                  <School size={18} style={{ marginRight: 6 }} />
                  <span>내 시간표 서비스에 등록하기</span>
                </ActionButton>
              </>
            )}

            {/* 탭 2: 학기별 성적 */}
            {activeTab === "semesterGrades" && (
              <>
                {report?.semesterGrades && report.semesterGrades.length > 0 ? (
                  <>
                    <TitleContentArea title="성적 누적 요약">
                      <Box>
                        <SummaryRow>
                          <SummaryItem>
                            <span className="label">총 취득학점</span>
                            <span className="value">{report.semesterGrades[0]?.cumulativeAcquiredCredits || "-"}학점</span>
                          </SummaryItem>
                          <SummaryDivider />
                          <SummaryItem>
                            <span className="label">총 평점평균</span>
                            <span className="value highlight">
                              {report.semesterGrades[0]?.cumulativeAverageScore || "-"} / 4.5
                            </span>
                          </SummaryItem>
                          <SummaryDivider />
                          <SummaryItem>
                            <span className="label">총 백분위</span>
                            <span className="value">{report.semesterGrades[0]?.cumulativePercentage || "-"}점</span>
                          </SummaryItem>
                        </SummaryRow>
                      </Box>
                    </TitleContentArea>

                    <TitleContentArea title={`학기별 성적 이력 (${report.semesterGrades.length}개 학기)`}>
                      <CourseList>
                        {report.semesterGrades.map((sem, idx) => (
                          <GradeCard key={idx}>
                            <GradeCardHeader>
                              <div>
                                <SemesterTitle>{sem.semesterName}</SemesterTitle>
                                <GradeSubText>{sem.targetGrade || ""} · 신청 {sem.appliedCredits}학점 / 취득 {sem.acquiredCredits}학점</GradeSubText>
                              </div>
                              <ScoreBadge>
                                <strong>{sem.averageScore}</strong> / 4.5
                              </ScoreBadge>
                            </GradeCardHeader>

                            <GradeMetaGrid>
                              <GradeMetaItem>
                                <span className="meta-lbl">백분위</span>
                                <span className="meta-val">{sem.percentage}점</span>
                              </GradeMetaItem>
                              <GradeMetaItem>
                                <span className="meta-lbl">전공 석차</span>
                                <span className="meta-val">{sem.rank || "-"}</span>
                              </GradeMetaItem>
                              <GradeMetaItem>
                                <span className="meta-lbl">누적 평점</span>
                                <span className="meta-val">{sem.cumulativeAverageScore}</span>
                              </GradeMetaItem>
                            </GradeMetaGrid>
                          </GradeCard>
                        ))}
                      </CourseList>
                    </TitleContentArea>
                  </>
                ) : (
                  <EmptyState padding="32px 0">조회된 학기별 성적 데이터가 없어요.</EmptyState>
                )}
              </>
            )}

            {/* 탭 3: 과목별 성적 */}
            {activeTab === "courseGrades" && (
              <>
                {report?.courseGrades && report.courseGrades.length > 0 ? (
                  <TitleContentArea title={`이수 과목 전체 성적 (${report.courseGrades.length}과목)`}>
                    <CourseList>
                      {report.courseGrades.map((crs, idx) => (
                        <CourseGradeCard key={idx}>
                          <CourseInfoColumn>
                            <CourseTypeRow>
                              <StatusBadge>{crs.courseTypeName}</StatusBadge>
                              <span className="sem-name">{crs.semesterName}</span>
                              {crs.isRetake && <RetakeBadge>재수강</RetakeBadge>}
                            </CourseTypeRow>
                            <CourseTitle>{crs.courseName}</CourseTitle>
                            <CourseCodeText>{crs.credits}학점 · {crs.courseCode}</CourseCodeText>
                          </CourseInfoColumn>
                          <GradeResultBox $grade={crs.grade}>
                            <span className="grade">{crs.grade}</span>
                            {crs.score && <span className="score">{crs.score}</span>}
                          </GradeResultBox>
                        </CourseGradeCard>
                      ))}
                    </CourseList>
                  </TitleContentArea>
                ) : (
                  <EmptyState padding="32px 0">조회된 과목별 성적 데이터가 없어요.</EmptyState>
                )}
              </>
            )}

            {/* 탭 4: 취득학점 및 교양 영역별 이수 */}
            {activeTab === "credits" && (
              <>
                {report?.creditSummary && (
                  <TitleContentArea title="이수구분별 취득학점 요약">
                    <Box>
                      <CreditGrid>
                        <CreditBox>
                          <span className="lbl">총 취득학점</span>
                          <span className="val highlight">
                            {report.creditSummary.totalCredits}
                            {report.creditSummary.standardTotalCredits !== "0" && (
                              <small> / {report.creditSummary.standardTotalCredits}학점</small>
                            )}
                          </span>
                        </CreditBox>
                        <CreditBox>
                          <span className="lbl">전공 취득</span>
                          <span className="val">{report.creditSummary.majorCredits}학점</span>
                          <span className="sub">핵심 {report.creditSummary.majorCoreCredits} · 심화 {report.creditSummary.majorDeepCredits}</span>
                        </CreditBox>
                        <CreditBox>
                          <span className="lbl">교양 취득</span>
                          <span className="val">{report.creditSummary.generalCredits}학점</span>
                          <span className="sub">교필 {report.creditSummary.generalRequiredCredits} · 단교 {report.creditSummary.collegeGeneralCredits}</span>
                        </CreditBox>
                        <CreditBox>
                          <span className="lbl">이수 학기수</span>
                          <span className="val">{report.creditSummary.completedSemesterCount || "-"}</span>
                        </CreditBox>
                      </CreditGrid>
                    </Box>
                  </TitleContentArea>
                )}

                {report?.generalEducationAreas && report.generalEducationAreas.length > 0 && (
                  <TitleContentArea title="교양 영역별 이수 현황 (기초과학 제외)">
                    <CourseList>
                      {report.generalEducationAreas.map((area, idx) => (
                        <AreaCard key={idx}>
                          <AreaRow>
                            <div>
                              <span className="area-type">{area.courseTypeName}</span>
                              <AreaTitle>{area.areaName}</AreaTitle>
                            </div>
                            <AreaCreditStatus $satisfied={area.isSatisfied}>
                              {area.isSatisfied ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                              <span>
                                {area.acquiredCredits}
                                {area.standardCredits !== "0" && ` / ${area.standardCredits}`}학점
                              </span>
                            </AreaCreditStatus>
                          </AreaRow>
                        </AreaCard>
                      ))}
                    </CourseList>
                  </TitleContentArea>
                )}
              </>
            )}

            {/* 탭 5: 장학금 수혜 */}
            {activeTab === "scholarship" && (
              <>
                <TitleContentArea title="장학금 총 수혜액">
                  <ScholarshipBanner>
                    <Award size={32} color="var(--interactive-primary)" />
                    <div>
                      <div className="title">총 누적 수혜 장학금</div>
                      <div className="amount">
                        {(report?.totalScholarshipAmount ?? 0).toLocaleString()}원
                      </div>
                    </div>
                  </ScholarshipBanner>
                </TitleContentArea>

                {report?.scholarships && report.scholarships.length > 0 ? (
                  <TitleContentArea title={`장학금 수혜 내역 (${report.scholarships.length}건)`}>
                    <CourseList>
                      {report.scholarships.map((scal, idx) => (
                        <CourseCard key={idx}>
                          <CourseHeader>
                            <CourseTitle>{scal.scholarshipName}</CourseTitle>
                            <StatusBadge>{scal.paymentMethod}</StatusBadge>
                          </CourseHeader>
                          <ScholarshipMetaRow>
                            <span className="sem-text">{scal.semesterName}</span>
                            <span className="amount-text">
                              {scal.amount.toLocaleString()}원
                            </span>
                          </ScholarshipMetaRow>
                        </CourseCard>
                      ))}
                    </CourseList>
                  </TitleContentArea>
                ) : (
                  <EmptyState padding="32px 0">수혜받은 장학금 내역이 없거나 아직 등록되지 않았어요.</EmptyState>
                )}
              </>
            )}

            {/* 공통 하단 액션 버튼 */}
            <ActionArea>
              <CapsuleButton
                variant="secondary"
                fullWidth
                onClick={handleMainAction}
                disabled={isLoading}
              >
                {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 최신 데이터 다시 가져오기"}
              </CapsuleButton>

              <RawJsonToggleButton type="button" onClick={() => setShowRawJson(!showRawJson)}>
                <Code size={14} />
                <span>{showRawJson ? "원문 JSON 숨기기" : "원문 파싱 JSON 보기"}</span>
              </RawJsonToggleButton>

              {showRawJson && (
                <RawJsonPre>{JSON.stringify(report || timetableList, null, 2)}</RawJsonPre>
              )}

              {lastUpdated && (
                <FootnoteText>
                  최근 조회 시각: {formatKoreanDateTime(lastUpdated)}
                </FootnoteText>
              )}
            </ActionArea>
          </>
        ) : (
          <ActionArea>
            <ActionButton as="button" onClick={handleMainAction} disabled={isLoading}>
              {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 시간표 & 성적 가져오기"}
            </ActionButton>
            <FootnoteText>개인정보는 서버로 전송되지 않고 이 폰에서 안전하게 처리돼요.</FootnoteText>
          </ActionArea>
        )}
      </ContentSection>

      <PortalAccountModal
        isOpen={isPortalAccountModalOpen}
        onClose={() => setIsPortalAccountModalOpen(false)}
        onSuccess={() => {
          setIsPortalAccountModalOpen(false);
          void fetchAllDataFromBridge();
        }}
      />

      <PortalTimetableImportSheet
        isOpen={isImportSheetOpen}
        onClose={() => setIsImportSheetOpen(false)}
        initialSemester={selectedSemester?.label}
        onSuccess={() => {
          setIsImportSheetOpen(false);
          navigate(ROUTES.TIMETABLE.ROOT);
        }}
      />
    </PageWrapper>
  );
};

export default PortalTimetableLabPage;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 calc(32px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
`;

const WarningBanner = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background-color: var(--bg-brand);
  border: 1px solid var(--border-brand-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
`;

const WarningBannerText = styled.p`
  ${typography.body2}
  color: var(--text-primary);
  margin: 0;
  flex: 1;

  strong {
    color: var(--text-brand);
    font-weight: 600;
  }
`;

const LaunchButton = styled.button`
  background: var(--interactive-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  ${typography.label3}
  cursor: pointer;
  white-space: nowrap;

  &:active {
    background: var(--interactive-primary-pressed);
  }
`;

const DescriptionTextWrapper = styled.div`
  padding: 16px;
  ${typography.body2}
  color: var(--text-secondary);
  line-height: 1.5;

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const SelectContainer = styled.div`
  padding: 12px 14px;
  width: 100%;
  box-sizing: border-box;
`;

const StyledSelect = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background-color: var(--bg-subtle);
  ${typography.body2}
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    border-color: var(--border-brand);
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  ${typography.label2}
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  background-color: ${(props) => (props.$active ? "var(--text-primary)" : "var(--bg-muted)")};
  color: ${(props) => (props.$active ? "var(--text-inverse)" : "var(--text-secondary)")};
  border: 1px solid ${(props) => (props.$active ? "transparent" : "var(--border-default)")};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--border-brand);
  }
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 16px 12px;
  box-sizing: border-box;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .label {
    ${typography.caption1}
    color: var(--text-tertiary);
  }

  .value {
    ${typography.title3}
    color: var(--text-primary);

    &.highlight {
      color: var(--text-brand);
    }
  }
`;

const SummaryDivider = styled.div`
  width: 1px;
  height: 28px;
  background-color: var(--border-default);
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const CourseCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const CourseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CourseTitle = styled.h4`
  ${typography.heading2}
  color: var(--text-primary);
  margin: 0;
`;

const StatusBadge = styled.span`
  ${typography.caption1}
  font-weight: 600;
  background-color: var(--bg-brand);
  color: var(--text-brand);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
`;

const RetakeBadge = styled.span`
  ${typography.caption1}
  font-weight: 600;
  background-color: var(--bg-error);
  color: var(--text-error);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
`;

const CourseMetaGrid = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const TimeSlotsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`;

const TimeSlotTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  ${typography.caption1}
  color: var(--text-secondary);
  background-color: var(--bg-muted);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
`;

const CourseCodeText = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const GradeCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GradeCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SemesterTitle = styled.h4`
  ${typography.heading2}
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const GradeSubText = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const ScoreBadge = styled.div`
  background-color: var(--bg-brand);
  color: var(--text-brand);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  ${typography.label2}

  strong {
    font-size: 16px;
    font-weight: 700;
  }
`;

const GradeMetaGrid = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-subtle);
  border-radius: var(--radius-md);
  padding: 10px 14px;
`;

const GradeMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .meta-lbl {
    ${typography.caption1}
    color: var(--text-tertiary);
  }

  .meta-val {
    ${typography.label2}
    font-weight: 700;
    color: var(--text-secondary);
  }
`;

const CourseGradeCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const CourseInfoColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CourseTypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;

  .sem-name {
    ${typography.caption1}
    color: var(--text-tertiary);
  }
`;

const GradeResultBox = styled.div<{ $grade: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  background-color: ${(props) =>
    props.$grade.startsWith("A")
      ? "var(--bg-brand)"
      : props.$grade === "P"
      ? "var(--bg-subtle)"
      : "var(--bg-muted)"};

  .grade {
    ${typography.heading2}
    font-weight: 800;
    color: ${(props) =>
      props.$grade.startsWith("A")
        ? "var(--text-brand)"
        : props.$grade === "P"
        ? "var(--border-success)"
        : "var(--text-secondary)"};
  }

  .score {
    ${typography.caption1}
    color: var(--text-tertiary);
    font-weight: 600;
  }
`;

const CreditGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
`;

const CreditBox = styled.div`
  background: var(--bg-subtle);
  padding: 12px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 2px;

  .lbl {
    ${typography.caption1}
    color: var(--text-tertiary);
  }

  .val {
    ${typography.title3}
    color: var(--text-primary);

    &.highlight {
      color: var(--text-brand);
    }

    small {
      ${typography.caption1}
      color: var(--text-tertiary);
    }
  }

  .sub {
    ${typography.caption1}
    color: var(--text-tertiary);
    margin-top: 2px;
  }
`;

const AreaCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px 14px;
`;

const AreaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .area-type {
    ${typography.caption1}
    color: var(--text-tertiary);
  }
`;

const AreaTitle = styled.h5`
  ${typography.heading3}
  color: var(--text-primary);
  margin: 2px 0 0 0;
`;

const AreaCreditStatus = styled.div<{ $satisfied: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  ${typography.label2}
  font-weight: 700;
  color: ${(props) => (props.$satisfied ? "var(--border-success)" : "var(--text-error)")};
`;

const ScholarshipBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: var(--bg-brand);
  border: 1px solid var(--border-brand-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-sizing: border-box;
  width: 100%;

  .title {
    ${typography.label2}
    color: var(--text-secondary);
    margin-bottom: 2px;
  }

  .amount {
    ${typography.title1}
    color: var(--text-brand);
  }
`;

const ScholarshipMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;

  .sem-text {
    ${typography.body2}
    color: var(--text-secondary);
  }

  .amount-text {
    ${typography.title3}
    color: var(--text-primary);
  }
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  width: 100%;
`;

const RawJsonToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  ${typography.caption1}
  cursor: pointer;
  padding: 4px 8px;
`;

const RawJsonPre = styled.pre`
  width: 100%;
  background: var(--gray-900);
  color: var(--gray-300);
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 11.5px;
  overflow-x: auto;
  box-sizing: border-box;
  text-align: left;
`;

const FootnoteText = styled.p`
  ${typography.caption1}
  color: var(--text-tertiary);
  margin: 0;
  text-align: center;
`;
