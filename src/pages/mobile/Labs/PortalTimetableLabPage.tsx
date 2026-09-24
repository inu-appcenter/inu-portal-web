import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
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
    const savedReport = localStorage.getItem("portal_lab_academic_report");
    const savedTimetable = localStorage.getItem("portal_lab_timetable_list");
    const savedTime = localStorage.getItem("portal_lab_timetable_last_updated");

    if (savedReport) {
      try {
        const parsedReport = JSON.parse(savedReport) as FullAcademicReport;
        setReport(parsedReport);
        if (parsedReport.timetable && parsedReport.timetable.length > 0) {
          setTimetableList(parsedReport.timetable);
        } else if (savedTimetable) {
          setTimetableList(JSON.parse(savedTimetable));
        }
        setLastUpdated(savedTime || new Date().toISOString());
        setIsFetched(true);
      } catch (e) {
        console.error("Failed to parse saved report:", e);
      }
    } else if (savedTimetable && savedTime) {
      try {
        setTimetableList(JSON.parse(savedTimetable));
        setLastUpdated(savedTime);
        setIsFetched(true);
      } catch (e) {
        console.error("Failed to parse saved timetable:", e);
      }
    } else {
      setIsFetched(false);
    }

    void checkLinkStatus();
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

        localStorage.setItem("portal_lab_academic_report", JSON.stringify(fullReport));
        if (fullReport.timetable) {
          localStorage.setItem("portal_lab_timetable_list", JSON.stringify(fullReport.timetable));
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
    } catch (error: any) {
      console.error("종합 데이터 조회 실패:", error);
      alert(error?.message || "데이터를 가져오는 중 오류가 발생했어요.");
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
    <PageWrapper>
      {!isMobileAppEnvironment() && (
        <WarningBanner>
          <Smartphone size={20} color="#0061ff" />
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

      <ContentSection>
        <TitleContentArea title="기능 안내">
          <Box>
            <DescriptionText>
              포털 학사행정의 <strong>개인학적조회</strong> 시스템에서 <strong>수강 시간표, 학기별·과목별 성적, 이수구분별 취득학점, 장학금 수혜 내역</strong>을 한 번에 안전하게 가져와요.
              개인정보는 서버로 전송되지 않고 이 기기 내에서만 처리돼요.
            </DescriptionText>
          </Box>
        </TitleContentArea>

        <TitleContentArea title="조회 학기 선택">
          <Box>
            <StyledSelect
              value={selectedSemesterId ?? ""}
              onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
              disabled={isLoading}
            >
              {semesterOptions.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.label}
                </option>
              ))}
            </StyledSelect>
          </Box>
        </TitleContentArea>

        {isFetched ? (
          <>
            {/* 탭 네비게이션 */}
            <TabBar>
              <TabButton $active={activeTab === "timetable"} onClick={() => setActiveTab("timetable")}>
                <Calendar size={14} />
                <span>시간표</span>
              </TabButton>
              <TabButton $active={activeTab === "semesterGrades"} onClick={() => setActiveTab("semesterGrades")}>
                <GraduationCap size={14} />
                <span>학기별 성적</span>
              </TabButton>
              <TabButton $active={activeTab === "courseGrades"} onClick={() => setActiveTab("courseGrades")}>
                <BookOpen size={14} />
                <span>과목별 성적</span>
              </TabButton>
              <TabButton $active={activeTab === "credits"} onClick={() => setActiveTab("credits")}>
                <BookMarked size={14} />
                <span>취득학점·교양</span>
              </TabButton>
              <TabButton $active={activeTab === "scholarship"} onClick={() => setActiveTab("scholarship")}>
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
                        <SummaryLabel>신청 과목수</SummaryLabel>
                        <SummaryValue>{timetableList.length}과목</SummaryValue>
                      </SummaryItem>
                      <SummaryDivider />
                      <SummaryItem>
                        <SummaryLabel>신청 학점</SummaryLabel>
                        <SummaryValue>{totalCredits}학점</SummaryValue>
                      </SummaryItem>
                      <SummaryDivider />
                      <SummaryItem>
                        <SummaryLabel>조회 기준</SummaryLabel>
                        <SummaryValue>{selectedSemester?.label || "-"}</SummaryValue>
                      </SummaryItem>
                    </SummaryRow>
                  </Box>
                </TitleContentArea>

                <TitleContentArea title={`과목별 시간표 (${timetableList.length}건)`}>
                  <CourseList>
                    {timetableList.map((item, idx) => (
                      <CourseCard key={idx}>
                        <CourseHeader>
                          <CourseTitle>{item.courseName}</CourseTitle>
                          <Badge>{item.courseType || "전공"}</Badge>
                        </CourseHeader>

                        <CourseMetaGrid>
                          <MetaItem>
                            <User size={13} color="#6b7684" />
                            <span>{item.professorName || "교수 미정"}</span>
                          </MetaItem>
                          <MetaItem>
                            <BookOpen size={13} color="#6b7684" />
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
                                    <MapPin size={12} style={{ marginLeft: 4 }} />
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
                </TitleContentArea>

                <ActionButton as="button" onClick={() => setIsImportSheetOpen(true)}>
                  <School size={18} />
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
                            <SummaryLabel>총 취득학점</SummaryLabel>
                            <SummaryValue>{report.semesterGrades[0]?.cumulativeAcquiredCredits || "-"}학점</SummaryValue>
                          </SummaryItem>
                          <SummaryDivider />
                          <SummaryItem>
                            <SummaryLabel>총 평점평균</SummaryLabel>
                            <SummaryValue style={{ color: "#0061ff" }}>
                              {report.semesterGrades[0]?.cumulativeAverageScore || "-"} / 4.5
                            </SummaryValue>
                          </SummaryItem>
                          <SummaryDivider />
                          <SummaryItem>
                            <SummaryLabel>총 백분위</SummaryLabel>
                            <SummaryValue>{report.semesterGrades[0]?.cumulativePercentage || "-"}점</SummaryValue>
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
                                <span>백분위</span>
                                <strong>{sem.percentage}점</strong>
                              </GradeMetaItem>
                              <GradeMetaItem>
                                <span>전공 석차</span>
                                <strong>{sem.rank || "-"}</strong>
                              </GradeMetaItem>
                              <GradeMetaItem>
                                <span>누적 평점</span>
                                <strong>{sem.cumulativeAverageScore}</strong>
                              </GradeMetaItem>
                            </GradeMetaGrid>
                          </GradeCard>
                        ))}
                      </CourseList>
                    </TitleContentArea>
                  </>
                ) : (
                  <EmptyBox>조회된 학기별 성적 데이터가 없어요.</EmptyBox>
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
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <Badge>{crs.courseTypeName}</Badge>
                              <span style={{ fontSize: 12, color: "#8b95a1" }}>{crs.semesterName}</span>
                              {crs.isRetake && <RetakeBadge>재수강</RetakeBadge>}
                            </div>
                            <CourseTitle>{crs.courseName}</CourseTitle>
                            <CourseCodeText style={{ marginTop: 2 }}>{crs.credits}학점 · {crs.courseCode}</CourseCodeText>
                          </div>
                          <GradeResultBox $grade={crs.grade}>
                            <span className="grade">{crs.grade}</span>
                            {crs.score && <span className="score">{crs.score}</span>}
                          </GradeResultBox>
                        </CourseGradeCard>
                      ))}
                    </CourseList>
                  </TitleContentArea>
                ) : (
                  <EmptyBox>조회된 과목별 성적 데이터가 없어요.</EmptyBox>
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
                          <span className="val" style={{ color: "#0061ff" }}>
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
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                              <span style={{ fontSize: 12, color: "#8b95a1" }}>{area.courseTypeName}</span>
                              <AreaTitle>{area.areaName}</AreaTitle>
                            </div>
                            <AreaCreditStatus $satisfied={area.isSatisfied}>
                              {area.isSatisfied ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                              <span>
                                {area.acquiredCredits}
                                {area.standardCredits !== "0" && ` / ${area.standardCredits}`}학점
                              </span>
                            </AreaCreditStatus>
                          </div>
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
                    <Award size={32} color="#0061ff" />
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
                            <Badge>{scal.paymentMethod}</Badge>
                          </CourseHeader>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                            <span style={{ fontSize: 13, color: "#6b7684" }}>{scal.semesterName}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#191f28" }}>
                              {scal.amount.toLocaleString()}원
                            </span>
                          </div>
                        </CourseCard>
                      ))}
                    </CourseList>
                  </TitleContentArea>
                ) : (
                  <EmptyBox>수혜받은 장학금 내역이 없거나 아직 등록되지 않았어요.</EmptyBox>
                )}
              </>
            )}

            {/* 공통 하단 액션 버튼 */}
            <ActionArea>
              <SecondaryButton type="button" onClick={handleMainAction} disabled={isLoading}>
                {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 최신 데이터 다시 가져오기"}
              </SecondaryButton>

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
  gap: 20px;
  padding: 16px 16px 50px 16px;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WarningBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f0f6ff;
  border: 1px solid #d3e5ff;
  border-radius: 12px;
  padding: 14px;
`;

const WarningBannerText = styled.p`
  font-size: 13px;
  color: #191f28;
  line-height: 1.45;
  margin: 0;
  flex: 1;

  strong {
    color: #0061ff;
  }
`;

const LaunchButton = styled.button`
  background: #0061ff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #4e5968;
  line-height: 1.5;
  margin: 0;

  strong {
    color: #191f28;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background-color: #ffffff;
  font-size: 15px;
  color: #191f28;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #0061ff;
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
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  background-color: ${(props) => (props.$active ? "#191f28" : "#f2f4f6")};
  color: ${(props) => (props.$active ? "#ffffff" : "#4e5968")};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 4px 0;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const SummaryLabel = styled.span`
  font-size: 12px;
  color: #8b95a1;
`;

const SummaryValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
`;

const SummaryDivider = styled.div`
  width: 1px;
  height: 28px;
  background-color: #e5e8eb;
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const CourseCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CourseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CourseTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const Badge = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  background-color: #e8f3ff;
  color: #0061ff;
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
`;

const RetakeBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  background-color: #fef0f0;
  color: #f04438;
  padding: 2px 6px;
  border-radius: 6px;
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
  font-size: 12.5px;
  color: #6b7684;
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
  font-size: 11.5px;
  color: #333d4b;
  background-color: #f2f4f6;
  padding: 3px 8px;
  border-radius: 6px;
`;

const CourseCodeText = styled.span`
  font-size: 11.5px;
  color: #8b95a1;
  margin-top: 2px;
`;

const GradeCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
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
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
  margin: 0 0 4px 0;
`;

const GradeSubText = styled.span`
  font-size: 12.5px;
  color: #8b95a1;
`;

const ScoreBadge = styled.div`
  background-color: #e8f3ff;
  color: #0061ff;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 13px;

  strong {
    font-size: 16px;
    font-weight: 800;
  }
`;

const GradeMetaGrid = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 10px 14px;
`;

const GradeMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  span {
    font-size: 11.5px;
    color: #8b95a1;
  }

  strong {
    font-size: 13.5px;
    font-weight: 700;
    color: #333d4b;
  }
`;

const CourseGradeCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const GradeResultBox = styled.div<{ $grade: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 6px 8px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.$grade.startsWith("A")
      ? "#e8f3ff"
      : props.$grade === "P"
      ? "#e6f8ed"
      : "#f2f4f6"};

  .grade {
    font-size: 16px;
    font-weight: 800;
    color: ${(props) =>
      props.$grade.startsWith("A")
        ? "#0061ff"
        : props.$grade === "P"
        ? "#12b76a"
        : "#333d4b"};
  }

  .score {
    font-size: 11px;
    color: #6b7684;
    font-weight: 600;
  }
`;

const CreditGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`;

const CreditBox = styled.div`
  background: #f9fafb;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .lbl {
    font-size: 12px;
    color: #8b95a1;
  }

  .val {
    font-size: 18px;
    font-weight: 700;
    color: #191f28;

    small {
      font-size: 12px;
      font-weight: 400;
      color: #8b95a1;
    }
  }

  .sub {
    font-size: 11px;
    color: #6b7684;
    margin-top: 2px;
  }
`;

const AreaCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  padding: 12px 14px;
`;

const AreaTitle = styled.h5`
  font-size: 14.5px;
  font-weight: 700;
  color: #191f28;
  margin: 2px 0 0 0;
`;

const AreaCreditStatus = styled.div<{ $satisfied: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: ${(props) => (props.$satisfied ? "#12b76a" : "#f04438")};
`;

const ScholarshipBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #f0f6ff;
  border: 1px solid #d3e5ff;
  border-radius: 14px;
  padding: 16px;

  .title {
    font-size: 13px;
    color: #4e5968;
    margin-bottom: 4px;
  }

  .amount {
    font-size: 22px;
    font-weight: 800;
    color: #0061ff;
  }
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: #8b95a1;
  font-size: 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px dashed #e5e8eb;
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const SecondaryButton = styled.button`
  width: 100%;
  height: 48px;
  background: #f2f4f6;
  color: #333d4b;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #e5e8eb;
  }
`;

const RawJsonToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #8b95a1;
  font-size: 12.5px;
  cursor: pointer;
  padding: 4px 8px;
`;

const RawJsonPre = styled.pre`
  width: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 10px;
  font-size: 11.5px;
  overflow-x: auto;
  box-sizing: border-box;
  text-align: left;
`;

const FootnoteText = styled.p`
  font-size: 12px;
  color: #8b95a1;
  margin: 0;
  text-align: center;
`;
