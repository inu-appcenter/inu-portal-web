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
import Modal from "@/components/common/Modal";
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
  CheckCircle2,
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
    loadData();

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
    } catch (e) {
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
    } catch (e) {
      console.error(e);
      showAlert("알림 등록 실패", "알림 예약에 실패했습니다.");
    }
  };

  const getModuleIcon = (modname: string) => {
    switch (modname) {
      case "vod":
        return <Video size={16} color="#2563eb" />;
      case "assign":
        return <FileText size={16} color="#7c3aed" />;
      case "quiz":
        return <HelpCircle size={16} color="#d97706" />;
      case "folder":
      case "resource":
        return <Folder size={16} color="#475569" />;
      default:
        return <BookOpen size={16} color="#64748b" />;
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
    <Container>
      {/* 상단 탭 네비게이션 */}
      <TabBar>
        <TabButton $active={activeTab === "assignments"} onClick={() => setActiveTab("assignments")}>
          <Calendar size={15} />
          <span>마감 일정</span>
          {assignments.length > 0 && <CountBadge>{assignments.length}</CountBadge>}
        </TabButton>
        <TabButton $active={activeTab === "courses"} onClick={() => setActiveTab("courses")}>
          <GraduationCap size={15} />
          <span>수강 강좌</span>
          {courses.length > 0 && <CountBadge>{courses.length}</CountBadge>}
        </TabButton>
        <TabButton $active={activeTab === "grades"} onClick={() => setActiveTab("grades")}>
          <Award size={15} />
          <span>성적 요약</span>
        </TabButton>
      </TabBar>

      {/* 알림 관리 바로가기 배너 */}
      <BannerCard onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}>
        <BannerLeft>
          <Bell size={18} color="#0061ff" />
          <BannerText>
            <strong>빈자리 및 마감 알림 관리</strong>
            <span>등록된 과제 리마인더 및 도서관 빈자리 알림 목록</span>
          </BannerText>
        </BannerLeft>
        <ChevronRight size={18} color="#94a3b8" />
      </BannerCard>

      {/* 액션 안내 토스트 배너 */}
      {actionMessage && (
        <ToastBanner>
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
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>마감 예정 과제 및 학습 ({isLinked ? filteredAssignments.length : 0})</SectionTitle>
                <RefreshBtn onClick={loadData}>
                  <RefreshCw size={13} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {isLinked && (
                <FilterArea>
                  <SearchBox>
                    <Search size={16} color="#8b95a1" />
                    <SearchInput
                      type="text"
                      placeholder="과제명 또는 강좌명 검색"
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                    />
                    {assignSearchQuery && (
                      <ClearBtn onClick={() => setAssignSearchQuery("")} type="button">
                        <X size={14} />
                      </ClearBtn>
                    )}
                  </SearchBox>
                  <ChipRow>
                    <FilterChip $active={assignFilter === "all"} onClick={() => setAssignFilter("all")}>
                      전체
                    </FilterChip>
                    <FilterChip $active={assignFilter === "urgent"} onClick={() => setAssignFilter("urgent")}>
                      마감 임박 (D-3)
                    </FilterChip>
                    <FilterChip $active={assignFilter === "assign"} onClick={() => setAssignFilter("assign")}>
                      과제
                    </FilterChip>
                    <FilterChip $active={assignFilter === "vod"} onClick={() => setAssignFilter("vod")}>
                      온라인 강의
                    </FilterChip>
                    <FilterChip $active={assignFilter === "quiz"} onClick={() => setAssignFilter("quiz")}>
                      퀴즈/시험
                    </FilterChip>
                  </ChipRow>
                </FilterArea>
              )}

              {!isMobileAppEnvironment() ? (
                <EmptyBox>
                  <Smartphone size={32} color="#0061ff" />
                  <EmptyTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyTitle>
                  <EmptyDesc>과제 마감 일정 및 수강 강좌 확인은 INTIP 모바일 앱에서 제공돼요.</EmptyDesc>
                  <CapsuleButton
                    variant="brand"
                    style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => openIntipAppOrStore("lms")}
                  >
                    앱에서 보기
                  </CapsuleButton>
                </EmptyBox>
              ) : !isLinked ? (
                <EmptyBox>
                  <KeyRound size={28} color="#0061ff" />
                  <EmptyTitle>포털 계정 연동 후 마감 일정을 확인할 수 있어요</EmptyTitle>
                  <EmptyDesc>계정을 연동하면 제출 기한이 남은 과제와 온라인 강의 일정이 표시돼요.</EmptyDesc>
                  <CapsuleButton
                    variant="brand"
                    style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                  >
                    포털 계정 연동하기
                  </CapsuleButton>
                </EmptyBox>
              ) : assignments.length === 0 ? (
                <EmptyBox>
                  <CheckCircle2 size={32} color="#16a34a" />
                  <EmptyTitle>마감 예정인 일정이 없습니다</EmptyTitle>
                  <EmptyDesc>모든 과제를 제출했거나 2주 이내 마감 예정 항목이 없습니다.</EmptyDesc>
                </EmptyBox>
              ) : filteredAssignments.length === 0 ? (
                <EmptyBox>
                  <Search size={28} color="#94a3b8" />
                  <EmptyTitle>일치하는 마감 일정이 없습니다</EmptyTitle>
                  <EmptyDesc>검색어나 필터 조건을 변경해보세요.</EmptyDesc>
                </EmptyBox>
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
                          <SubActionBtn onClick={() => handleOpenUrl(item.url)}>
                            <ExternalLink size={13} />
                            <span>{item.actionName || "과제 바로가기"}</span>
                          </SubActionBtn>
                        )}
                        <PrimaryActionBtn onClick={() => handleRegisterAssignmentReminder(item)}>
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
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>수강 중인 강좌 ({isLinked ? filteredCourses.length : 0})</SectionTitle>
                <RefreshBtn onClick={loadData}>
                  <RefreshCw size={13} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {isLinked && (
                <FilterArea>
                  <SearchBox>
                    <Search size={16} color="#8b95a1" />
                    <SearchInput
                      type="text"
                      placeholder="강좌명 또는 학수번호 검색"
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                    />
                    {courseSearchQuery && (
                      <ClearBtn onClick={() => setCourseSearchQuery("")} type="button">
                        <X size={14} />
                      </ClearBtn>
                    )}
                  </SearchBox>
                </FilterArea>
              )}

              {!isMobileAppEnvironment() ? (
                <EmptyBox>
                  <Smartphone size={32} color="#0061ff" />
                  <EmptyTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyTitle>
                  <EmptyDesc>수강 강좌 및 주차별 강의 확인은 INTIP 모바일 앱에서 제공돼요.</EmptyDesc>
                  <CapsuleButton
                    variant="brand"
                    style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => openIntipAppOrStore("lms")}
                  >
                    앱에서 보기
                  </CapsuleButton>
                </EmptyBox>
              ) : !isLinked ? (
                <EmptyBox>
                  <KeyRound size={28} color="#0061ff" />
                  <EmptyTitle>포털 계정 연동 후 수강 강좌를 확인할 수 있어요</EmptyTitle>
                  <EmptyDesc>이번 학기 수강 중인 강좌 목록과 주차별 학습 현황을 확인해보세요.</EmptyDesc>
                  <CapsuleButton
                    variant="brand"
                    style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                  >
                    포털 계정 연동하기
                  </CapsuleButton>
                </EmptyBox>
              ) : courses.length === 0 ? (
                <EmptyBox>
                  <GraduationCap size={32} color="#94a3b8" />
                  <EmptyTitle>수강 중인 강좌가 없어요</EmptyTitle>
                </EmptyBox>
              ) : filteredCourses.length === 0 ? (
                <EmptyBox>
                  <Search size={28} color="#94a3b8" />
                  <EmptyTitle>일치하는 강좌가 없어요</EmptyTitle>
                  <EmptyDesc>검색어를 확인해보세요.</EmptyDesc>
                </EmptyBox>
              ) : (
                <ListContainer>
                  {filteredCourses.map((c) => (
                    <Box key={c.id} onClick={() => handleOpenCourseDetail(c)} style={{ padding: "16px", width: "100%", boxSizing: "border-box" }}>
                      <CourseHeader>
                        <div>
                          <CourseTitle>{c.fullname}</CourseTitle>
                          <CourseCode>{c.shortname}</CourseCode>
                        </div>
                        <ChevronRight size={18} color="#94a3b8" />
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
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>과목별 성적 현황 ({isLinked ? filteredGrades.length : 0})</SectionTitle>
                <RefreshBtn onClick={loadData}>
                  <RefreshCw size={13} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {isLinked && (
                <FilterArea>
                  <SearchBox>
                    <Search size={16} color="#8b95a1" />
                    <SearchInput
                      type="text"
                      placeholder="과목명 검색"
                      value={gradeSearchQuery}
                      onChange={(e) => setGradeSearchQuery(e.target.value)}
                    />
                    {gradeSearchQuery && (
                      <ClearBtn onClick={() => setGradeSearchQuery("")} type="button">
                        <X size={14} />
                      </ClearBtn>
                    )}
                  </SearchBox>
                </FilterArea>
              )}

              {!isMobileAppEnvironment() ? (
                <EmptyBox>
                  <Smartphone size={32} color="#0061ff" />
                  <EmptyTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyTitle>
                  <EmptyDesc>과목별 성적 조회는 INTIP 모바일 앱에서 제공돼요.</EmptyDesc>
                  <CapsuleButton
                    variant="brand"
                    style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => openIntipAppOrStore("lms")}
                  >
                    앱에서 보기
                  </CapsuleButton>
                </EmptyBox>
              ) : !isLinked ? (
                <EmptyBox>
                  <KeyRound size={28} color="#0061ff" />
                  <EmptyTitle>포털 계정 연동 후 성적을 확인할 수 있어요</EmptyTitle>
                  <EmptyDesc>계정을 연동하면 과목별 원점수 및 취득 성적을 확인할 수 있어요.</EmptyDesc>
                  <CapsuleButton
                    variant="brand"
                    style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
                  >
                    포털 계정 연동하기
                  </CapsuleButton>
                </EmptyBox>
              ) : grades.length === 0 ? (
                <EmptyBox>
                  <Award size={32} color="#94a3b8" />
                  <EmptyTitle>조회된 성적 정보가 없어요</EmptyTitle>
                  <EmptyDesc>학기 말 성적 입력 기간 또는 LMS에 공개된 성적이 표시돼요.</EmptyDesc>
                </EmptyBox>
              ) : filteredGrades.length === 0 ? (
                <EmptyBox>
                  <Search size={28} color="#94a3b8" />
                  <EmptyTitle>일치하는 과목 성적이 없어요</EmptyTitle>
                  <EmptyDesc>검색어를 확인해보세요.</EmptyDesc>
                </EmptyBox>
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
            <EmptyBox style={{ margin: "20px 0" }}>등록된 주차별 콘텐츠가 없습니다.</EmptyBox>
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

      <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
    </Container>
  );
}

// ================= STYLES =================

const Container = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER}px 80px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 80px;
  }
`;

const FootnoteText = styled.p`
  margin: 20px 0 0;
  font-size: 12.5px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  line-height: 1.4;
`;

const TabBar = styled.div`
  display: flex;
  background: var(--bg-muted, #f2f4f6);
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 16px;
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
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #6b7684)")};
  background: ${({ $active }) => ($active ? "var(--bg-base, #ffffff)" : "transparent")};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none")};
  transition: all 0.15s ease;
`;

const CountBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  padding: 1px 6px;
  border-radius: 999px;
`;

const BannerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.12s ease-in-out;

  &:active {
    transform: scale(0.98);
    background: var(--bg-muted, #f8fafc);
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
    font-size: 14px;
    color: var(--text-primary, #191f28);
  }
  span {
    font-size: 12px;
    color: var(--text-secondary, #6b7684);
    margin-top: 2px;
  }
`;

const ToastBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
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
  margin-bottom: 2px;
  width: 100%;
  box-sizing: border-box;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 9px 12px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--interactive-primary, #0061ff);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13.5px;
  color: var(--text-primary, #191f28);
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--text-placeholder, #8b95a1);
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled, #8b95a1);
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    color: var(--text-primary, #191f28);
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
  font-size: 12.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #4e5968)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-muted, #f2f4f6)")};
  border: 1px solid ${({ $active }) => ($active ? "var(--interactive-primary, #0061ff)" : "var(--border-default, #e5e8eb)")};
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:active {
    transform: scale(0.97);
  }
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  margin: 0;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  cursor: pointer;
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--bg-muted, #f8fafc);
  border: 1px dashed var(--border-default, #e5e8eb);
  border-radius: 16px;
  text-align: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333d4b);
  margin-top: 4px;
`;

const EmptyDesc = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #8b95a1);
  line-height: 1.5;
  max-width: 280px;
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
  font-size: 11px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
  background: var(--bg-brand-subtle, #eff6ff);
  padding: 3px 8px;
  border-radius: 6px;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DueBadge = styled.span<{ $isUrgent?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $isUrgent }) => ($isUrgent ? "var(--bg-error, #fef2f2)" : "var(--bg-muted, #f2f4f6)")};
  color: ${({ $isUrgent }) => ($isUrgent ? "var(--text-error, #ef4444)" : "var(--text-secondary, #4e5968)")};
`;

const AssignTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #8b95a1);
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
  border-top: 1px solid var(--border-default, #f1f5f9);
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
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
  background: var(--bg-muted, #f2f4f6);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 8px;
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
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: var(--interactive-primary, #0061ff);
  border: none;
  border-radius: 8px;
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
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const CourseCode = styled.div`
  font-size: 12px;
  color: var(--text-disabled, #8b95a1);
  margin-top: 2px;
`;

const CourseMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-default, #f1f5f9);
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  width: 100%;
  box-sizing: border-box;
`;

const OpenDetailText = styled.span`
  color: var(--text-brand, #0061ff);
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
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const GradeRaw = styled.div`
  font-size: 12px;
  color: var(--text-disabled, #8b95a1);
`;

const GradeBadge = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-brand, #0061ff);
  background: var(--bg-brand-subtle, #eff6ff);
  padding: 4px 12px;
  border-radius: 8px;
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
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const SheetSubtitle = styled.div`
  font-size: 13px;
  color: var(--text-secondary, #6b7684);
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
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #333d4b);
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
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #f1f5f9);
  border-radius: 10px;
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
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #191f28);
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
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${({ $done }) => ($done ? "#dcfce7" : "var(--bg-muted, #f2f4f6)")};
  color: ${({ $done }) => ($done ? "#15803d" : "var(--text-disabled, #8b95a1)")};
`;

const EmptySectionText = styled.div`
  font-size: 12px;
  color: var(--text-disabled, #8b95a1);
  padding: 6px 4px;
`;
