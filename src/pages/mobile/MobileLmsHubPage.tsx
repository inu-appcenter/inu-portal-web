import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import {
  getUpcomingLmsAssignments,
  getMyLmsCourses,
  getCourseContents,
  getCourseCompletionMap,
  getCourseGradesOverview,
  LmsAssignmentEvent,
  LmsCourse,
  LmsSection,
  LmsCourseGrade,
} from "@/apis/lms";
import {
  checkLmsAccountLinked,
  registerLocalWatchJobInApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import Skeleton from "@/components/common/Skeleton";
import {
  GraduationCap,
  Calendar,
  Clock,
  Bell,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Video,
  FileText,
  HelpCircle,
  Folder,
  Award,
  ChevronRight,
  X,
  KeyRound,
} from "lucide-react";
import { LmsAccountModal } from "@/components/mobile/agent/LmsAccountModal";

export default function MobileLmsHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"assignments" | "courses" | "grades">("assignments");
  const [assignments, setAssignments] = useState<LmsAssignmentEvent[]>([]);
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [grades, setGrades] = useState<LmsCourseGrade[]>([]);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 강좌 주차별 상세 모달 상태
  const [selectedCourse, setSelectedCourse] = useState<LmsCourse | null>(null);
  const [courseSections, setCourseSections] = useState<LmsSection[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<number, boolean>>({});
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState<boolean>(false);

  useHeader({
    title: "사이버캠퍼스(LMS) 스마트 허브",
    subHeader: null,
    hasback: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isMobileAppEnvironment()) {
        const linkRes = await checkLmsAccountLinked().catch(() => ({ linked: false }));
        setIsLinked(linkRes.linked);

        if (linkRes.linked) {
          const [assignList, courseList, gradeList] = await Promise.all([
            getUpcomingLmsAssignments().catch(() => []),
            getMyLmsCourses().catch(() => []),
            getCourseGradesOverview().catch(() => []),
          ]);
          setAssignments(assignList);
          setCourses(courseList);
          setGrades(gradeList);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleOpenModal = () => setIsAuthModalOpen(true);
    window.addEventListener("openLmsAccountModal", handleOpenModal);
    return () => {
      window.removeEventListener("openLmsAccountModal", handleOpenModal);
    };
  }, []);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // 강좌 클릭 시 주차별 상세 콘텐츠 로드
  const handleOpenCourseDetail = async (course: LmsCourse) => {
    setSelectedCourse(course);
    setIsLoadingCourseDetail(true);
    try {
      const [sections, completions] = await Promise.all([
        getCourseContents(course.id).catch(() => []),
        getCourseCompletionMap(course.id).catch(() => ({})),
      ]);
      setCourseSections(sections);
      setCompletionMap(completions);
    } catch (e) {
      console.error(e);
      alert("강좌 상세 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoadingCourseDetail(false);
    }
  };

  // 외부 링크 열기
  const handleOpenUrl = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  // 과제 마감 알림 예약
  const handleRegisterAssignmentReminder = async (item: LmsAssignmentEvent) => {
    if (!isMobileAppEnvironment()) {
      alert("과제 리마인더 알림은 INTIP 모바일 앱에서 예약할 수 있습니다.");
      return;
    }

    try {
      const dueIso = new Date(item.timesort * 1000).toISOString();
      await registerLocalWatchJobInApp({
        watchType: "SEAT_EXPIRATION",
        seatName: `[과제/학습 마감] ${item.course?.fullname || "LMS"}: ${item.name}`,
        endTime: dueIso,
      });
      showToast(`🔔 '${item.name}' 마감 알림이 기기에 예약되었습니다!`);
    } catch (e) {
      console.error(e);
      alert("알림 예약에 실패했습니다.");
    }
  };

  const getModuleIcon = (modname: string) => {
    switch (modname) {
      case "vod":
        return <Video size={15} color="#2563eb" />;
      case "assign":
        return <FileText size={15} color="#7c3aed" />;
      case "quiz":
        return <HelpCircle size={15} color="#d97706" />;
      case "folder":
      case "resource":
        return <Folder size={15} color="#475569" />;
      default:
        return <BookOpen size={15} color="#64748b" />;
    }
  };

  return (
    <Container>
      {/* 상단 탭 내비게이션 */}
      <TabBar>
        <TabButton $active={activeTab === "assignments"} onClick={() => setActiveTab("assignments")}>
          <Calendar size={15} />
          <span>마감 일정</span>
          {assignments.length > 0 && <CountBadge>{assignments.length}</CountBadge>}
        </TabButton>
        <TabButton $active={activeTab === "courses"} onClick={() => setActiveTab("courses")}>
          <GraduationCap size={15} />
          <span>수강 강좌 & 진도</span>
          {courses.length > 0 && <CountBadge>{courses.length}</CountBadge>}
        </TabButton>
        <TabButton $active={activeTab === "grades"} onClick={() => setActiveTab("grades")}>
          <Award size={15} />
          <span>성적 요약</span>
        </TabButton>
      </TabBar>

      {/* 스마트 감시 대시보드 바로가기 배너 */}
      <BannerCard onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}>
        <BannerLeft>
          <Sparkles size={18} color="#2563eb" />
          <BannerText>
            <strong>스마트 감시 & 리마인더 관리</strong>
            <span>과제 마감 리마인더 및 도서관 감시 내역</span>
          </BannerText>
        </BannerLeft>
        <ChevronRight size={18} color="#94a3b8" />
      </BannerCard>

      {/* 액션 안내 토스트 배너 */}
      {actionMessage && (
        <ToastBanner>
          <Sparkles size={16} />
          <span>{actionMessage}</span>
        </ToastBanner>
      )}

      {isLoading ? (
        <SectionWrapper>
          <SectionTop>
            <Skeleton width="160px" height="18px" />
            <Skeleton width="60px" height="18px" />
          </SectionTop>
          <ListContainer>
            {Array.from({ length: 3 }).map((_, idx) => (
              <CardItem key={`lms-skel-${idx}`}>
                <CardMain>
                  <AssignTop>
                    <Skeleton width="100px" height="18px" style={{ borderRadius: "4px" }} />
                    <Skeleton width="50px" height="18px" style={{ borderRadius: "4px" }} />
                  </AssignTop>
                  <Skeleton width="180px" height="18px" style={{ margin: "10px 0 6px" }} />
                  <Skeleton width="140px" height="14px" />
                </CardMain>
                <SmartActionRow>
                  <Skeleton width="120px" height="30px" style={{ borderRadius: "20px" }} />
                  <Skeleton width="90px" height="30px" style={{ borderRadius: "20px" }} />
                </SmartActionRow>
              </CardItem>
            ))}
          </ListContainer>
        </SectionWrapper>
      ) : !isLinked ? (
        <EmptyBox>
          <GraduationCap size={36} color="#94a3b8" />
          <EmptyTitle>사이버캠퍼스(LMS) 계정 연동이 필요해요</EmptyTitle>
          <EmptyDesc>
            포털 SSO 계정(학번/비밀번호)을 연동하면 실시간 과제 마감 일정, 주차별 강의 영상 출석 현황,
            성적 정보를 확인하실 수 있습니다.
          </EmptyDesc>
          <PrimaryActionBtn
            style={{ marginTop: "16px", padding: "10px 24px" }}
            onClick={() => setIsAuthModalOpen(true)}
          >
            <KeyRound size={15} />
            <span>LMS 계정 연동하기</span>
          </PrimaryActionBtn>
        </EmptyBox>
      ) : (
        <>
          {/* ================= 1. 과제 & 마감 일정 탭 ================= */}
          {activeTab === "assignments" && (
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>다가오는 과제 및 학습 마감</SectionTitle>
                <RefreshBtn onClick={loadData}>
                  <RefreshCw size={12} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {assignments.length === 0 ? (
                <EmptyBox>
                  <CheckCircle2 size={32} color="#22c55e" />
                  <EmptyTitle>마감 예정인 과제나 일정이 없습니다</EmptyTitle>
                  <EmptyDesc>모든 학업 일정을 완료했거나 2주 이내 마감 건이 없습니다.</EmptyDesc>
                </EmptyBox>
              ) : (
                <ListContainer>
                  {assignments.map((item) => (
                    <CardItem key={item.id} $isUrgent={item.isUrgent}>
                      <CardMain>
                        <AssignTop>
                          <CourseNameBadge>{item.course?.fullname || "강좌"}</CourseNameBadge>
                          <DueBadge $isUrgent={item.isUrgent}>
                            {item.daysRemaining !== undefined && item.daysRemaining <= 0
                              ? "오늘 마감"
                              : `D-${item.daysRemaining}`}
                          </DueBadge>
                        </AssignTop>

                        <AssignTitle>{item.name}</AssignTitle>

                        <TimeRow>
                          <Clock size={13} />
                          <span>마감 일시: {new Date(item.timesort * 1000).toLocaleString()}</span>
                        </TimeRow>
                      </CardMain>

                      <SmartActionRow>
                        {item.url && (
                          <ActionButton onClick={() => handleOpenUrl(item.url)}>
                            <ExternalLink size={13} />
                            <span>{item.actionName || "활동 바로가기"}</span>
                          </ActionButton>
                        )}
                        <ActionButton
                          $highlight
                          onClick={() => handleRegisterAssignmentReminder(item)}
                        >
                          <Bell size={13} />
                          <span>마감 리마인더</span>
                        </ActionButton>
                      </SmartActionRow>
                    </CardItem>
                  ))}
                </ListContainer>
              )}
            </SectionWrapper>
          )}

          {/* ================= 2. 수강 강좌 & 주차별 진도 탭 ================= */}
          {activeTab === "courses" && (
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>수강 중인 강좌 ({courses.length})</SectionTitle>
                <RefreshBtn onClick={loadData}>
                  <RefreshCw size={12} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              <NoticeBox>
                💡 강좌를 터치하면 <strong>주차별 강의 영상(출석), 과제, 퀴즈 현황</strong>을 확인하실 수 있습니다.
              </NoticeBox>

              {courses.length === 0 ? (
                <EmptyBox>
                  <GraduationCap size={32} color="#94a3b8" />
                  <EmptyTitle>수강 중인 강좌가 없습니다</EmptyTitle>
                </EmptyBox>
              ) : (
                <ListContainer>
                  {courses.map((c) => (
                    <CourseCard key={c.id} onClick={() => handleOpenCourseDetail(c)}>
                      <CourseHeader>
                        <div>
                          <CourseTitle>{c.fullname}</CourseTitle>
                          <CourseCode>{c.shortname}</CourseCode>
                        </div>
                        <ChevronRight size={18} color="#94a3b8" />
                      </CourseHeader>
                      <CourseMetaRow>
                        <span>수강생 {c.enrolledusercount ?? 0}명</span>
                        <OpenDetailText>주차별 진도 보기 &rarr;</OpenDetailText>
                      </CourseMetaRow>
                    </CourseCard>
                  ))}
                </ListContainer>
              )}
            </SectionWrapper>
          )}

          {/* ================= 3. 성적 요약 탭 ================= */}
          {activeTab === "grades" && (
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>과목별 성적 요약</SectionTitle>
                <RefreshBtn onClick={loadData}>
                  <RefreshCw size={12} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {grades.length === 0 ? (
                <EmptyBox>
                  <Award size={32} color="#94a3b8" />
                  <EmptyTitle>공개된 성적 정보가 없습니다</EmptyTitle>
                  <EmptyDesc>학기 말 성적 입력 기간 또는 e-Campus에 등록된 성적이 표시됩니다.</EmptyDesc>
                </EmptyBox>
              ) : (
                <ListContainer>
                  {grades.map((g, idx) => {
                    const matchCourse = courses.find((c) => c.id === g.courseid);
                    return (
                      <GradeCard key={idx}>
                        <GradeLeft>
                          <GradeCourseName>{matchCourse?.fullname || `과목 ID ${g.courseid}`}</GradeCourseName>
                          {g.rawgrade && <GradeRaw>원점수: {g.rawgrade}</GradeRaw>}
                        </GradeLeft>
                        <GradeBadge>{g.grade || "-"}</GradeBadge>
                      </GradeCard>
                    );
                  })}
                </ListContainer>
              )}
            </SectionWrapper>
          )}
        </>
      )}

      {/* ================= 강좌 상세 주차별 콘텐츠 모달 ================= */}
      {selectedCourse && (
        <ModalOverlay onClick={() => setSelectedCourse(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>{selectedCourse.fullname}</ModalTitle>
                <ModalSubtitle>주차별 학습 요소 및 출석/완료 현황</ModalSubtitle>
              </div>
              <CloseBtn onClick={() => setSelectedCourse(null)}>
                <X size={20} />
              </CloseBtn>
            </ModalHeader>

            {isLoadingCourseDetail ? (
              <ModalLoading>
                <RefreshCw size={24} className="spin" />
                <span>주차별 학습 콘텐츠를 불러오는 중...</span>
              </ModalLoading>
            ) : courseSections.length === 0 ? (
              <EmptyBox>등록된 주차별 콘텐츠가 없습니다.</EmptyBox>
            ) : (
              <SectionListContainer>
                {courseSections.map((sec) => (
                  <SectionCard key={sec.id}>
                    <SectionName>{sec.name}</SectionName>
                    {sec.modules && sec.modules.length > 0 ? (
                      <ModuleList>
                        {sec.modules.map((mod) => {
                          const isCompleted = Boolean(completionMap[mod.id]);
                          return (
                            <ModuleItem
                              key={mod.id}
                              onClick={() => handleOpenUrl(mod.url)}
                              style={{ cursor: mod.url ? "pointer" : "default" }}
                            >
                              <ModuleLeft>
                                {getModuleIcon(mod.modname)}
                                <ModuleName>{mod.name}</ModuleName>
                              </ModuleLeft>

                              <ModuleRight>
                                {mod.modname === "vod" ? (
                                  <StatusBadge $done={isCompleted}>
                                    {isCompleted ? "출석 완료" : "미시청"}
                                  </StatusBadge>
                                ) : mod.modname === "assign" ? (
                                  <StatusBadge $done={isCompleted}>
                                    {isCompleted ? "제출 완료" : "미제출"}
                                  </StatusBadge>
                                ) : mod.modname === "quiz" ? (
                                  <StatusBadge $done={isCompleted}>
                                    {isCompleted ? "응시 완료" : "미응시"}
                                  </StatusBadge>
                                ) : null}
                                {mod.url && <ExternalLink size={13} color="#94a3b8" />}
                              </ModuleRight>
                            </ModuleItem>
                          );
                        })}
                      </ModuleList>
                    ) : (
                      <EmptySectionText>콘텐츠가 없습니다.</EmptySectionText>
                    )}
                  </SectionCard>
                ))}
              </SectionListContainer>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* LMS 계정 연동 모달 */}
      <LmsAccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          showToast("🎉 LMS 계정이 성공적으로 연동되었습니다!");
          loadData();
        }}
      />
    </Container>
  );
}

// ================= STYLES =================
const PrimaryActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #2563eb;
  color: #ffffff;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const Container = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER}px 80px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8fafc;
`;

const TabBar = styled.div`
  display: flex;
  background: #ffffff;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? "#2563eb" : "#64748b")};
  background: ${({ $active }) => ($active ? "#eff6ff" : "transparent")};
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;

const CountBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 1px 6px;
  border-radius: 999px;
`;

const BannerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  cursor: pointer;
`;

const BannerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  strong {
    font-size: 14px;
    color: #1e40af;
  }
  span {
    font-size: 12px;
    color: #3b82f6;
  }
`;

const ToastBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #166534;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 14px;
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
`;

const NoticeBox = styled.div`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardItem = styled.div<{ $isUrgent?: boolean }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${({ $isUrgent }) => ($isUrgent ? "#fca5a5" : "#e2e8f0")};
`;

const CardMain = styled.div`
  margin-bottom: 12px;
`;

const AssignTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const CourseNameBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
`;

const DueBadge = styled.span<{ $isUrgent?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $isUrgent }) => ($isUrgent ? "#fee2e2" : "#f1f5f9")};
  color: ${({ $isUrgent }) => ($isUrgent ? "#b91c1c" : "#475569")};
`;

const AssignTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 6px 0;
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748b;
`;

const SmartActionRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $highlight?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $highlight }) => ($highlight ? "#eff6ff" : "#f8fafc")};
  color: ${({ $highlight }) => ($highlight ? "#1d4ed8" : "#334155")};
  border: 1px solid ${({ $highlight }) => ($highlight ? "#bfdbfe" : "#e2e8f0")};
  cursor: pointer;
`;

const CourseCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
`;

const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const CourseTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const CourseCode = styled.span`
  font-size: 11px;
  color: #64748b;
`;

const CourseMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
`;

const OpenDetailText = styled.span`
  color: #2563eb;
  font-weight: 600;
`;

const GradeCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GradeLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const GradeCourseName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

const GradeRaw = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const GradeBadge = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: #2563eb;
  background: #eff6ff;
  padding: 4px 12px;
  border-radius: 8px;
`;

const EmptyBox = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px dashed #cbd5e1;
`;

const EmptyTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin: 4px 0 0 0;
`;

const EmptyDesc = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

// ================= MODAL STYLES =================
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px 16px 36px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
`;

const ModalLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #64748b;
  font-size: 13px;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const SectionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 65vh;
  overflow-y: auto;
`;

const SectionCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
`;

const SectionName = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`;

const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModuleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
`;

const ModuleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
`;

const ModuleName = styled.span`
  font-size: 13px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ModuleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusBadge = styled.span<{ $done: boolean }>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $done }) => ($done ? "#dcfce7" : "#ffedd5")};
  color: ${({ $done }) => ($done ? "#16a34a" : "#c2410c")};
`;

const EmptySectionText = styled.span`
  font-size: 11px;
  color: #94a3b8;
`;
