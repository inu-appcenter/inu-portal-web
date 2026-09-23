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
  fetchStudentTimetableFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { TimetableCourseItem } from "@/utils/ssvParser";
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
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";
import { useSemesters } from "@/hooks/useSemesters";
import { formatSemester, pickCurrentSemester, termToTmGbn } from "@/utils/semester";

const PortalTimetableLabPage = () => {
  const navigate = useNavigate();
  const { semesters } = useSemesters();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

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
    const savedData = localStorage.getItem("portal_lab_timetable_list");
    const savedTime = localStorage.getItem("portal_lab_timetable_last_updated");

    if (savedData && savedTime) {
      try {
        setTimetableList(JSON.parse(savedData));
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
    title: "포털 시간표 가져오기",
    hasback: true,
  });

  // 모바일 앱 브릿지를 통해 직접 시간표 가져오기
  const fetchTimetableFromBridge = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 시간표 조회는 INTIP 모바일 앱 환경에서만 가능해요.");
      return;
    }

    if (!selectedSemester) return;

    setIsLoading(true);
    setLoadingMessage("포털 로그인 및 수강 시간표를 확인하고 있어요... (약 5~10초)");

    try {
      const tmGbn = termToTmGbn(selectedSemester.term);
      const res = await fetchStudentTimetableFromApp({
        yy: String(selectedSemester.year),
        tmGbn,
      });

      if (res.success && res.data) {
        const items = res.data;
        const now = new Date().toISOString();

        setTimetableList(items);
        setLastUpdated(now);
        setIsFetched(true);

        localStorage.setItem("portal_lab_timetable_list", JSON.stringify(items));
        localStorage.setItem("portal_lab_timetable_last_updated", now);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 300);

        alert(`성공적으로 ${items.length}개 과목 시간표를 가져왔어요.`);
      } else {
        if (res.errorCode === "AUTH_REQUIRED") {
          setIsPortalAccountModalOpen(true);
        } else {
          alert(`시간표를 가져오는 데 실패했어요: ${res.errorMessage || "조회 오류"}`);
        }
      }
    } catch (error: any) {
      console.error("시간표 조회 실패:", error);
      alert(error?.message || "시간표를 가져오는 중 오류가 발생했어요.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleMainAction = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 시간표 연동은 INTIP 모바일 앱 환경에서만 지원돼요.");
      return;
    }

    const linked = await checkLinkStatus();
    if (linked) {
      await fetchTimetableFromBridge();
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
            포털 시간표 가져오기는 기기 보안 저장소를 사용하는 모바일 앱 환경에서만 안전하게 동작해요.
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
              인천대학교 학사행정(ERP) 포털 사이트에 등록된 <strong>내 수강신청 시간표</strong>를 직접 조회하고 테스트해요.
              조회된 시간표는 메인 시간표 서비스와 연동해 내 시간표로 바로 등록할 수 있어요.
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

        {isFetched && timetableList.length > 0 ? (
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

            <ActionArea>
              <ActionButton
                as="button"
                onClick={() => setIsImportSheetOpen(true)}
              >
                <School size={18} />
                <span>내 시간표 서비스에 등록하기</span>
              </ActionButton>

              <SecondaryButton
                type="button"
                onClick={handleMainAction}
                disabled={isLoading}
              >
                {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 다시 가져오기"}
              </SecondaryButton>

              <RawJsonToggleButton
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                <Code size={14} />
                <span>{showRawJson ? "원문 JSON 숨기기" : "원문 파싱 JSON 보기"}</span>
              </RawJsonToggleButton>

              {showRawJson && (
                <RawJsonPre>{JSON.stringify(timetableList, null, 2)}</RawJsonPre>
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
            <ActionButton
              as="button"
              onClick={handleMainAction}
              disabled={isLoading}
            >
              {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 시간표 가져오기"}
            </ActionButton>
            <FootnoteText>이 폰에서 직접 안전하게 작업이 수행돼요.</FootnoteText>
          </ActionArea>
        )}
      </ContentSection>

      <PortalAccountModal
        isOpen={isPortalAccountModalOpen}
        onClose={() => setIsPortalAccountModalOpen(false)}
        onSuccess={() => {
          setIsPortalAccountModalOpen(false);
          void fetchTimetableFromBridge();
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
  gap: 24px;
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
