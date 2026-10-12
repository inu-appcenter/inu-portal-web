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
  startLmsDeadlineOngoingBridge,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import Skeleton from "@/components/common/Skeleton";
import Box from "@/components/common/Box";
import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";
import EmptyState from "@/components/common/EmptyState";
import Modal from "@/components/common/Modal";
import { typography } from "@/styles/typography";
import {
  Search,
  X,
  GraduationCap,
  Calendar,
  Clock,
  Bell,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Folder,
  Award,
  ChevronRight,
  KeyRound,
  Check,
  Smartphone,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";

export default function MobileLmsHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"assignments" | "courses" | "grades">("assignments");
  const [assignments, setAssignments] = useState<LmsAssignmentEvent[]>([]);
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [grades, setGrades] = useState<LmsCourseGrade[]>([]);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 검색 및 필터 상태
  const [assignSearchQuery, setAssignSearchQuery] = useState<string>("");
  const [assignFilter, setAssignFilter] = useState<"all" | "urgent" | "assign" | "vod" | "quiz">("all");
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>("");
  const [gradeSearchQuery, setGradeSearchQuery] = useState<string>("");

  // 안내/경고 공용 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  // 강좌 주차별 상세 바텀시트 상태
  const [selectedCourse, setSelectedCourse] = useState<LmsCourse | null>(null);
  const [courseSections, setCourseSections] = useState<LmsSection[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<number, boolean>>({});
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState<boolean>(false);

  const showAlert = (title: string, description: string) => {
    setAlertModal({ isOpen: true, title, description });
  };

  useHeader({
    title: "이러닝 (LMS)",
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
    void loadData();

    const handleOpenModal = () => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
    window.addEventListener("openLmsAccountModal", handleOpenModal);
    return () => {
      window.removeEventListener("openLmsAccountModal", handleOpenModal);
    };
  }, [navigate]);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
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
    } catch (e: unknown) {
      console.error(e);
      showAlert("강좌 상세 조회 오류", "강좌 상세 정보를 불러오지 못했습니다.");
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
      showAlert(
        "모바일 앱 전용 기능",
        "과제 마감 알림 등록은 INTIP 모바일 앱 환경에서 이용하실 수 있습니다."
      );
      return;
    }

    try {
      const dueTimestamp = item.timesort * 1000;
      const dueIso = new Date(dueTimestamp).toISOString();
      await registerLocalWatchJobInApp({
        watchType: "ASSIGNMENT_REMINDER",
        seatName: `[과제/학습 마감] ${item.course?.fullname || "LMS"}: ${item.name}`,
        endTime: dueIso,
      });

      // 마감까지 3시간 이내로 남은 경우 잠금화면 Now Bar Ongoing 알림 동시 활성화
      const now = Date.now();
      if (dueTimestamp > now && dueTimestamp - now <= 3 * 60 * 60 * 1000) {
        startLmsDeadlineOngoingBridge({
          id: item.id,
          courseName: item.course?.fullname || "LMS",
          itemName: item.name,
          type: item.modulename === "quiz" ? "QUIZ" : item.modulename === "vod" ? "VOD" : "ASSIGNMENT",
          dueTime: dueIso,
          courseId: item.course?.id,
          cmid: item.id,
        }).catch(() => {});
      }

      showToast(`'${item.name}' 마감 알림이 등록되었습니다.`);
    } catch (e: unknown) {
      console.error(e);
      showAlert("알림 등록 실패", "알림 예약에 실패했습니다.");
    }
  };

  const getModuleIcon = (modname: string) => {
    switch (modname) {
      case "vod":
        return <Video size={16} color="var(--interactive-primary)" />;
      case "assign":
        return <FileText size={16} color="var(--text-brand)" />;
      case "quiz":
        return <HelpCircle size={16} color="var(--text-warn)" />;
      case "folder":
      case "resource":
        return <Folder size={16} color="var(--text-secondary)" />;
      default:
        return <BookOpen size={16} color="var(--text-tertiary)" />;
    }
  };

  const filteredAssignments = assignments.filter((item) => {
    if (assignSearchQuery.trim()) {
      const q = assignSearchQuery.trim().toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCourse = item.course?.fullname ? item.course.fullname.toLowerCase().includes(q) : false;
      if (!matchName && !matchCourse) return false;
    }
    if (assignFilter === "urgent") {
      const days = item.daysRemaining;
      if (days === undefined || days > 3) return false;
    } else if (assignFilter === "assign") {
      if (item.modulename !== "assign") return false;
    } else if (assignFilter === "vod") {
      if (item.modulename !== "vod") return false;
    } else if (assignFilter === "quiz") {
      if (item.modulename !== "quiz") return false;
    }
    return true;
  });

  const filteredCourses = courses.filter((c) => {
    if (!courseSearchQuery.trim()) return true;
    const q = courseSearchQuery.trim().toLowerCase();
    const matchName = c.fullname.toLowerCase().includes(q);
    const matchShort = c.shortname ? c.shortname.toLowerCase().includes(q) : false;
    return matchName || matchShort;
  });

  const filteredGrades = grades.filter((g) => {
    if (!gradeSearchQuery.trim()) return true;
    const q = gradeSearchQuery.trim().toLowerCase();
    const matchCourse = courses.find((c) => c.id === g.courseid);
    const name = matchCourse?.fullname || `과목 ID ${g.courseid}`;
    return name.toLowerCase().includes(q);
  });

  return (
    <Container as="main">
      {/* 상단 탭 네비게이션 */}
      <TabBar role="tablist" aria-label="이러닝 메뉴">
        <TabButton
          type="button"
          role="tab"
          aria-selected={activeTab === "assignments"}
          $active={activeTab === "assignments"}
          onClick={() => setActiveTab("assignments")}
        >
          <Calendar size={15} />
          <span>마감 일정</span>
          {assignments.length > 0 && <CountBadge>{assignments.length}</CountBadge>}
        </TabButton>
        <TabButton
          type="button"
          role="tab"
          aria-selected={activeTab === "courses"}
          $active={activeTab === "courses"}
          onClick={() => setActiveTab("courses")}
        >
          <GraduationCap size={15} />
          <span>수강 강좌</span>
          {courses.length > 0 && <CountBadge>{courses.length}</CountBadge>}
        </TabButton>
        <TabButton
          type="button"
          role="tab"
          aria-selected={activeTab === "grades"}
          $active={activeTab === "grades"}
          onClick={() => setActiveTab("grades")}
        >
          <Award size={15} />
          <span>성적 요약</span>
        </TabButton>
      </TabBar>

      {/* 알림 관리 바로가기 배너 */}
      <BannerCard
        role="button"
        tabIndex={0}
        onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(ROUTES.MYPAGE.SMART_WATCH);
          }
        }}
      >
        <BannerLeft>
          <Bell size={18} color="var(--interactive-primary)" />
          <BannerText>
            <strong>빈자리 및 마감 알림 관리</strong>
            <span>등록된 과제 리마인더 및 도서관 빈자리 알림 목록</span>
          </BannerText>
        </BannerLeft>
        <ChevronRight size={18} color="var(--text-disabled)" />
      </BannerCard>

      {/* 액션 안내 토스트 배너 */}
      {actionMessage && (
        <ToastBanner role="status">
          <Check size={16} />
          <span>{actionMessage}</span>
        </ToastBanner>
      )}

      {isLoading ? (
        <SectionWrapper>
          <SectionTop>
            <Skeleton width="140px" height="18px" />
            <Skeleton width="60px" height="18px" />
          </SectionTop>
          <ListContainer>
            {[1, 2, 3].map((i) => (
              <Box key={i} style={{ padding: "16px" }}>
                <AssignTop>
                  <Skeleton width="90px" height="20px" style={{ borderRadius: "6px" }} />
                  <Skeleton width="45px" height="20px" style={{ borderRadius: "6px" }} />
                </AssignTop>
                <Skeleton width="180px" height="18px" style={{ margin: "10px 0 6px" }} />
                <Skeleton width="140px" height="14px" />
              </Box>
            ))}
          </ListContainer>
        </SectionWrapper>
      ) : (
        <>
          {/* ================= 1. 과제 & 마감 일정 탭 ================= */}
          {activeTab === "assignments" && (
            <SectionWrapper as="section" aria-label="마감 예정 과제 및 학습">
              <SectionTop>
                <SectionTitle>마감 예정 과제 및 학습 ({isLinked ? filteredAssignments.length : 0})</SectionTitle>
                <RefreshBtn type="button" onClick={() => void loadData()}>
                  <RefreshCw size={13} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {isLinked && (
                <FilterArea>
                  <SearchBox>
                    <Search size={16} color="var(--text-tertiary)" />
                    <SearchInput
                      type="text"
                      placeholder="과제명 또는 강좌명 검색"
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                      aria-label="과제 검색"
                    />
                    {assignSearchQuery && (
                      <ClearBtn onClick={() => setAssignSearchQuery("")} type="button" aria-label="검색어 지우기">
                        <X size={14} />
                      </ClearBtn>
                    )}
                  </SearchBox>
                  <ChipRow role="tablist" aria-label="과제 필터">
                    <FilterChip
                      type="button"
                      role="tab"
                      aria-selected={assignFilter === "all"}
                      $active={assignFilter === "all"}
                      onClick={() => setAssignFilter("all")}
                    >
                      전체
                    </FilterChip>
                    <FilterChip
                      type="button"
                      role="tab"
                      aria-selected={assignFilter === "urgent"}
                      $active={assignFilter === "urgent"}
                      onClick={() => setAssignFilter("urgent")}
                    >
                      마감 임박 (D-3)
                    </FilterChip>
                    <FilterChip
                      type="button"
                      role="tab"
                      aria-selected={assignFilter === "assign"}
                      $active={assignFilter === "assign"}
                      onClick={() => setAssignFilter("assign")}
                    >
                      과제
                    </FilterChip>
                    <FilterChip
                      type="button"
                      role="tab"
                      aria-selected={assignFilter === "vod"}
                      $active={assignFilter === "vod"}
                      onClick={() => setAssignFilter("vod")}
                    >
                      온라인 강의
                    </FilterChip>
                    <FilterChip
                      type="button"
                      role="tab"
                      aria-selected={assignFilter === "quiz"}
                      $active={assignFilter === "quiz"}
                      onClick={() => setAssignFilter("quiz")}
                    >
                      퀴즈/시험
                    </FilterChip>
                  </ChipRow>
                </FilterArea>
              )}

              {!isMobileAppEnvironment() ? (
                <EmptyStateCard>
                  <EmptyStateContent>
                    <Smartphone size={32} color="var(--interactive-primary)" />
                    <EmptyStateTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyStateTitle>
                    <EmptyStateDescription>과제 마감 일정 및 수강 강좌 확인은 기기 보안 환경이 지원되는 INTIP 모바일 앱에서 제공돼요.</EmptyStateDescription>
                    <CapsuleButton
                      variant="brand"
                      style={{ marginTop: "12px", padding: "8px 20px" }}
                      onClick={() => openIntipAppOrStore("lms")}
                    >
                      앱에서 열기
                    </CapsuleButton>
                  </EmptyStateContent>
                </EmptyStateCard>
              ) : !isLinked ? (
                <EmptyStateCard>
                  <EmptyStateContent>
                    <KeyRound size={28} color="var(--interactive-primary)" />
                    <EmptyStateTitle>포털 계정 연동 후 마감 일정을 확인할 수 있어요</EmptyStateTitle>
                    <EmptyStateDescription>계정을 연동하면 제출 기한이 남은 과제와 온라인 강의 일정이 표시돼요.</EmptyStateDescription>
                    <CapsuleButton
                      variant="brand"
                      style={{ marginTop: "12px", padding: "8px 20px" }}
                      onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                    >
                      포털 계정 연동하기
                    </CapsuleButton>
                  </EmptyStateContent>
                </EmptyStateCard>
              ) : assignments.length === 0 ? (
                <EmptyStateCard>
                  <EmptyState padding="32px 0">마감 예정인 과제나 학습 일정이 없어요.</EmptyState>
                </EmptyStateCard>
              ) : filteredAssignments.length === 0 ? (
                <EmptyStateCard>
                  <EmptyState padding="32px 0">검색 조건과 일치하는 마감 일정이 없어요.</EmptyState>
                </EmptyStateCard>
              ) : (
                <ListContainer>
                  {filteredAssignments.map((item) => (
                    <Box key={item.id} style={{ padding: "16px", width: "100%", boxSizing: "border-box" }}>
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
                        <span>마감: {new Date(item.timesort * 1000).toLocaleString()}</span>
                      </TimeRow>

                      <ActionBtnRow>
                        {item.url && (
                          <SubActionBtn type="button" onClick={() => handleOpenUrl(item.url)}>
                            <ExternalLink size={13} />
                            <span>{item.actionName || "과제 바로가기"}</span>
                          </SubActionBtn>
                        )}
                        <PrimaryActionBtn type="button" onClick={() => void handleRegisterAssignmentReminder(item)}>
                          <Bell size={13} />
                          <span>마감 알림 등록</span>
                        </PrimaryActionBtn>
                      </ActionBtnRow>
                    </Box>
                  ))}
                </ListContainer>
              )}
            </SectionWrapper>
          )}

          {/* ================= 2. 수강 강좌 & 주차별 진도 탭 ================= */}
          {activeTab === "courses" && (
            <SectionWrapper as="section" aria-label="수강 중인 강좌">
              <SectionTop>
                <SectionTitle>수강 중인 강좌 ({isLinked ? filteredCourses.length : 0})</SectionTitle>
                <RefreshBtn type="button" onClick={() => void loadData()}>
                  <RefreshCw size={13} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {isLinked && (
                <FilterArea>
                  <SearchBox>
                    <Search size={16} color="var(--text-tertiary)" />
                    <SearchInput
                      type="text"
                      placeholder="강좌명 또는 학수번호 검색"
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      aria-label="강좌 검색"
                    />
                    {courseSearchQuery && (
                      <ClearBtn onClick={() => setCourseSearchQuery("")} type="button" aria-label="검색어 지우기">
                        <X size={14} />
                      </ClearBtn>
                    )}
                  </SearchBox>
                </FilterArea>
              )}

              {!isMobileAppEnvironment() ? (
                <EmptyStateCard>
                  <EmptyStateContent>
                    <Smartphone size={32} color="var(--interactive-primary)" />
                    <EmptyStateTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyStateTitle>
                    <EmptyStateDescription>수강 강좌 및 주차별 강의 확인은 INTIP 모바일 앱에서 제공돼요.</EmptyStateDescription>
                    <CapsuleButton
                      variant="brand"
                      style={{ marginTop: "12px", padding: "8px 20px" }}
                      onClick={() => openIntipAppOrStore("lms")}
                    >
                      앱에서 열기
                    </CapsuleButton>
                  </EmptyStateContent>
                </EmptyStateCard>
              ) : !isLinked ? (
                <EmptyStateCard>
                  <EmptyStateContent>
                    <KeyRound size={28} color="var(--interactive-primary)" />
                    <EmptyStateTitle>포털 계정 연동 후 수강 강좌를 확인할 수 있어요</EmptyStateTitle>
                    <EmptyStateDescription>이번 학기 수강 중인 강좌 목록과 주차별 학습 현황을 확인해보세요.</EmptyStateDescription>
                    <CapsuleButton
                      variant="brand"
                      style={{ marginTop: "12px", padding: "8px 20px" }}
                      onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                    >
                      포털 계정 연동하기
                    </CapsuleButton>
                  </EmptyStateContent>
                </EmptyStateCard>
              ) : courses.length === 0 ? (
                <EmptyStateCard>
                  <EmptyState padding="32px 0">수강 중인 강좌가 없어요.</EmptyState>
                </EmptyStateCard>
              ) : filteredCourses.length === 0 ? (
                <EmptyStateCard>
                  <EmptyState padding="32px 0">일치하는 강좌가 없어요.</EmptyState>
                </EmptyStateCard>
              ) : (
                <ListContainer>
                  {filteredCourses.map((c) => (
                    <Box
                      key={c.id}
                      onClick={() => void handleOpenCourseDetail(c)}
                      style={{ padding: "16px", width: "100%", boxSizing: "border-box" }}
                    >
                      <CourseHeader>
                        <div>
                          <CourseTitle>{c.fullname}</CourseTitle>
                          <CourseCode>{c.shortname}</CourseCode>
                        </div>
                        <ChevronRight size={18} color="var(--text-disabled)" />
                      </CourseHeader>
                      <CourseMetaRow>
                        <span>수강생 {c.enrolledusercount ?? 0}명</span>
                        <OpenDetailText>주차별 진도 확인</OpenDetailText>
                      </CourseMetaRow>
                    </Box>
                  ))}
                </ListContainer>
              )}
            </SectionWrapper>
          )}

          {/* ================= 3. 성적 요약 탭 ================= */}
          {activeTab === "grades" && (
            <SectionWrapper as="section" aria-label="과목별 성적 현황">
              <SectionTop>
                <SectionTitle>과목별 성적 현황 ({isLinked ? filteredGrades.length : 0})</SectionTitle>
                <RefreshBtn type="button" onClick={() => void loadData()}>
                  <RefreshCw size={13} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {isLinked && (
                <FilterArea>
                  <SearchBox>
                    <Search size={16} color="var(--text-tertiary)" />
                    <SearchInput
                      type="text"
                      placeholder="과목명 검색"
                      value={gradeSearchQuery}
                      onChange={(e) => setGradeSearchQuery(e.target.value)}
                      aria-label="과목 검색"
                    />
                    {gradeSearchQuery && (
                      <ClearBtn onClick={() => setGradeSearchQuery("")} type="button" aria-label="검색어 지우기">
                        <X size={14} />
                      </ClearBtn>
                    )}
                  </SearchBox>
                </FilterArea>
              )}

              {!isMobileAppEnvironment() ? (
                <EmptyStateCard>
                  <EmptyStateContent>
                    <Smartphone size={32} color="var(--interactive-primary)" />
                    <EmptyStateTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyStateTitle>
                    <EmptyStateDescription>과목별 성적 조회는 기기 보안 인증이 지원되는 INTIP 모바일 앱에서 제공돼요.</EmptyStateDescription>
                    <CapsuleButton
                      variant="brand"
                      style={{ marginTop: "12px", padding: "8px 20px" }}
                      onClick={() => openIntipAppOrStore("lms")}
                    >
                      앱에서 열기
                    </CapsuleButton>
                  </EmptyStateContent>
                </EmptyStateCard>
              ) : !isLinked ? (
                <EmptyStateCard>
                  <EmptyStateContent>
                    <KeyRound size={28} color="var(--interactive-primary)" />
                    <EmptyStateTitle>포털 계정 연동 후 성적을 확인할 수 있어요</EmptyStateTitle>
                    <EmptyStateDescription>계정을 연동하면 과목별 원점수 및 취득 성적을 확인할 수 있어요.</EmptyStateDescription>
                    <CapsuleButton
                      variant="brand"
                      style={{ marginTop: "12px", padding: "8px 20px" }}
                      onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                    >
                      포털 계정 연동하기
                    </CapsuleButton>
                  </EmptyStateContent>
                </EmptyStateCard>
              ) : grades.length === 0 ? (
                <EmptyStateCard>
                  <EmptyState padding="32px 0">조회된 성적 정보가 없어요. 학기 말 성적 입력 기간에 확인해보세요.</EmptyState>
                </EmptyStateCard>
              ) : filteredGrades.length === 0 ? (
                <EmptyStateCard>
                  <EmptyState padding="32px 0">일치하는 과목 성적이 없어요.</EmptyState>
                </EmptyStateCard>
              ) : (
                <ListContainer>
                  {filteredGrades.map((g, idx) => {
                    const matchCourse = courses.find((c) => c.id === g.courseid);
                    return (
                      <Box key={idx} style={{ padding: "16px", width: "100%", boxSizing: "border-box" }}>
                        <GradeCardInner>
                          <GradeLeft>
                            <GradeCourseName>{matchCourse?.fullname || `과목 ID ${g.courseid}`}</GradeCourseName>
                            {g.rawgrade && <GradeRaw>원점수: {g.rawgrade}</GradeRaw>}
                          </GradeLeft>
                          <GradeBadge>{g.grade || "-"}</GradeBadge>
                        </GradeCardInner>
                      </Box>
                    );
                  })}
                </ListContainer>
              )}
            </SectionWrapper>
          )}
        </>
      )}

      {/* ================= 강좌 상세 주차별 콘텐츠 바텀시트 ================= */}
      <BottomSheet
        open={Boolean(selectedCourse)}
        onOpenChange={(open) => {
          if (!open) setSelectedCourse(null);
        }}
        height="85%"
        maxHeight="92%"
        showCloseButton={true}
      >
        <SheetContainer>
          <SheetHeader>
            <SheetTitle>{selectedCourse?.fullname}</SheetTitle>
            <SheetSubtitle>주차별 학습 콘텐츠 및 출석/완료 현황</SheetSubtitle>
          </SheetHeader>

          {isLoadingCourseDetail ? (
            <SectionListContainer>
              {[1, 2, 3].map((s) => (
                <SectionGroup key={s}>
                  <Skeleton width="120px" height="18px" style={{ marginBottom: "6px" }} />
                  <ModuleList>
                    {[1, 2].map((m) => (
                      <ModuleItem key={m}>
                        <ModuleLeft>
                          <Skeleton width="18px" height="18px" style={{ borderRadius: "4px" }} />
                          <Skeleton width="160px" height="16px" />
                        </ModuleLeft>
                        <Skeleton width="60px" height="20px" style={{ borderRadius: "6px" }} />
                      </ModuleItem>
                    ))}
                  </ModuleList>
                </SectionGroup>
              ))}
            </SectionListContainer>
          ) : courseSections.length === 0 ? (
            <EmptyState padding="32px 0">등록된 주차별 콘텐츠가 없습니다.</EmptyState>
          ) : (
            <SectionListContainer>
              {courseSections.map((sec) => (
                <SectionGroup key={sec.id}>
                  <SectionName>{sec.name}</SectionName>
                  {sec.modules && sec.modules.length > 0 ? (
                    <ModuleList>
                      {sec.modules.map((mod) => {
                        const isCompleted = Boolean(completionMap[mod.id]);
                        return (
                          <ModuleItem
                            key={mod.id}
                            role={mod.url ? "link" : undefined}
                            tabIndex={mod.url ? 0 : undefined}
                            onClick={() => handleOpenUrl(mod.url)}
                            onKeyDown={(e) => {
                              if (mod.url && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                handleOpenUrl(mod.url);
                              }
                            }}
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
                              {mod.url && <ExternalLink size={13} color="var(--text-disabled)" />}
                            </ModuleRight>
                          </ModuleItem>
                        );
                      })}
                    </ModuleList>
                  ) : (
                    <EmptySectionText>등록된 학습 요소가 없어요.</EmptySectionText>
                  )}
                </SectionGroup>
              ))}
            </SectionListContainer>
          )}
        </SheetContainer>
      </BottomSheet>

      {/* 안내/경고 공용 모달 */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        description={alertModal.description}
        primaryButton={{
          text: "확인",
          variant: "brand",
          onClick: () => setAlertModal((prev) => ({ ...prev, isOpen: false })),
        }}
      />

      <FootnoteText>기기 백그라운드 작업은 휴대폰 환경에 맞추어 안전하게 수행돼요.</FootnoteText>
    </Container>
  );
}

// ================= STYLES =================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: 100vh;
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 calc(32px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  }
`;

const FootnoteText = styled.p`
  margin: var(--space-4) 0 0;
  ${typography.caption1}
  color: var(--text-tertiary);
  text-align: center;
`;

const TabBar = styled.div`
  display: flex;
  background: var(--bg-muted);
  padding: 4px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  ${typography.label2}
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? "var(--text-brand)" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "var(--bg-base)" : "transparent")};
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none")};
  transition: all 0.15s ease;
`;

const CountBadge = styled.span`
  ${typography.caption1}
  font-weight: 700;
  background: var(--bg-brand);
  color: var(--text-brand);
  padding: 1px 6px;
  border-radius: var(--radius-full);
`;

const BannerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.12s ease-in-out, background-color 0.12s ease;

  &:active {
    transform: scale(0.98);
    background: var(--bg-subtle);
  }
`;

const BannerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  strong {
    ${typography.heading2}
    font-size: 14px;
    color: var(--text-primary);
  }
  span {
    ${typography.caption1}
    color: var(--text-tertiary);
    margin-top: 2px;
  }
`;

const ToastBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-success);
  color: var(--border-success);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  ${typography.label2}
  width: 100%;
  box-sizing: border-box;
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const SectionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  width: 100%;
  box-sizing: border-box;
`;

const FilterArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: var(--space-1);
  width: 100%;
  box-sizing: border-box;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 9px 12px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--interactive-primary);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  ${typography.body2}
  color: var(--text-primary);
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--text-disabled);
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
  cursor: pointer;
  border-radius: var(--radius-full);

  &:hover {
    color: var(--text-primary);
  }
`;

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  ${typography.label3}
  color: ${({ $active }) => ($active ? "var(--text-brand)" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand)" : "var(--bg-muted)")};
  border: 1px solid ${({ $active }) => ($active ? "var(--interactive-primary)" : "var(--border-default)")};
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:active {
    transform: scale(0.97);
  }
`;

const SectionTitle = styled.h2`
  ${typography.title4}
  color: var(--text-primary);
  margin: 0;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  ${typography.label3}
  color: var(--text-tertiary);
  cursor: pointer;
`;

const EmptyStateCard = styled(Box)`
  padding: 32px 16px;
  width: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
`;

const EmptyStateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  gap: var(--space-2);
`;

const EmptyStateTitle = styled.div`
  ${typography.heading2}
  color: var(--text-primary);
  margin-top: var(--space-1);
  text-align: center;
`;

const EmptyStateDescription = styled.div`
  ${typography.body2}
  color: var(--text-tertiary);
  max-width: 320px;
  line-height: 1.5;
  text-align: center;
  margin: 0 auto;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
`;

const AssignTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const CourseNameBadge = styled.span`
  ${typography.caption1}
  font-weight: 600;
  color: var(--text-brand);
  background: var(--bg-brand);
  padding: 3px 8px;
  border-radius: 6px;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DueBadge = styled.span<{ $isUrgent?: boolean }>`
  ${typography.caption1}
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $isUrgent }) => ($isUrgent ? "var(--bg-error)" : "var(--bg-muted)")};
  color: ${({ $isUrgent }) => ($isUrgent ? "var(--text-error)" : "var(--text-secondary)")};
`;

const AssignTitle = styled.div`
  ${typography.heading2}
  color: var(--text-primary);
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  ${typography.caption1}
  color: var(--text-secondary);
  margin-top: 6px;
  width: 100%;
  box-sizing: border-box;
`;

const ActionBtnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
  width: 100%;
  box-sizing: border-box;
`;

const SubActionBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  ${typography.label3}
  color: var(--text-secondary);
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryActionBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  ${typography.label3}
  color: var(--text-inverse);
  background: var(--interactive-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const CourseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
`;

const CourseTitle = styled.div`
  ${typography.heading2}
  color: var(--text-primary);
`;

const CourseCode = styled.div`
  ${typography.caption1}
  color: var(--text-disabled);
  margin-top: 2px;
`;

const CourseMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-default);
  ${typography.caption1}
  color: var(--text-secondary);
  width: 100%;
  box-sizing: border-box;
`;

const OpenDetailText = styled.span`
  color: var(--text-brand);
  font-weight: 600;
`;

const GradeCardInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
`;

const GradeLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const GradeCourseName = styled.div`
  ${typography.heading2}
  color: var(--text-primary);
`;

const GradeRaw = styled.div`
  ${typography.caption1}
  color: var(--text-disabled);
`;

const GradeBadge = styled.div`
  ${typography.title3}
  color: var(--text-brand);
  background: var(--bg-brand);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
`;

// 바텀시트 내부 스타일
const SheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SheetTitle = styled.h2`
  margin: 0;
  ${typography.title2}
  color: var(--text-primary);
`;

const SheetSubtitle = styled.div`
  ${typography.body2}
  color: var(--text-secondary);
`;

const SectionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionName = styled.div`
  ${typography.label2}
  font-weight: 700;
  color: var(--text-primary);
  padding-left: 2px;
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
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  gap: 10px;
`;

const ModuleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const ModuleName = styled.span`
  ${typography.body2}
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModuleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const StatusBadge = styled.span<{ $done: boolean }>`
  ${typography.caption1}
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${({ $done }) => ($done ? "var(--bg-subtle)" : "var(--bg-muted)")};
  color: ${({ $done }) => ($done ? "var(--border-success)" : "var(--text-disabled)")};
  border: 1px solid ${({ $done }) => ($done ? "var(--border-success)" : "var(--border-default)")};
`;

const EmptySectionText = styled.div`
  ${typography.caption1}
  color: var(--text-disabled);
  padding: 6px 4px;
`;
