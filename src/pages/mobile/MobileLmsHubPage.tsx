import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import {
  getUpcomingLmsAssignments,
  getMyLmsCourses,
  LmsAssignmentEvent,
  LmsCourse,
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
} from "lucide-react";

export default function MobileLmsHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"assignments" | "courses">("assignments");
  const [assignments, setAssignments] = useState<LmsAssignmentEvent[]>([]);
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
          const [assignList, courseList] = await Promise.all([
            getUpcomingLmsAssignments().catch(() => []),
            getMyLmsCourses().catch(() => []),
          ]);
          setAssignments(assignList);
          setCourses(courseList);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // 1. 특정 과제 마감 3시간 전 정시 알림 등록
  const handleRegisterAssignmentReminder = async (item: LmsAssignmentEvent) => {
    if (!isMobileAppEnvironment()) {
      alert("과제 리마인더 알림은 INTIP 모바일 앱에서 예약할 수 있습니다.");
      return;
    }

    try {
      const dueIso = new Date(item.timesort * 1000).toISOString();
      await registerLocalWatchJobInApp({
        watchType: "SEAT_EXPIRATION", // 정밀 One-Shot 알람 엔진 재사용
        seatName: `[과제 마감] ${item.course?.fullname || '과제'}: ${item.name}`,
        endTime: dueIso,
      });
      showToast(`🔔 '${item.name}' 마감 알림이 단말기에 예약되었습니다!`);
    } catch (e) {
      console.error(e);
      alert("알림 예약에 실패했습니다.");
    }
  };

  return (
    <Container>
      {/* 상단 탭 내비게이션 */}
      <TabBar>
        <TabButton $active={activeTab === "assignments"} onClick={() => setActiveTab("assignments")}>
          <Calendar size={16} />
          <span>과제 & 퀴즈 일정</span>
          {assignments.length > 0 && <CountBadge>{assignments.length}</CountBadge>}
        </TabButton>
        <TabButton $active={activeTab === "courses"} onClick={() => setActiveTab("courses")}>
          <GraduationCap size={16} />
          <span>수강 중인 강좌</span>
          {courses.length > 0 && <CountBadge>{courses.length}</CountBadge>}
        </TabButton>
      </TabBar>

      {/* 액션 안내 토스트 배너 */}
      {actionMessage && (
        <ToastBanner>
          <Sparkles size={16} />
          <span>{actionMessage}</span>
          <button onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}>관리 보기</button>
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
            포털 학번/비밀번호를 기기 내 1회 등록하면 과제 마감일정과 강좌를 한눈에 모아보고 알림을 받을 수 있어요.
          </EmptyDesc>
          <PrimaryBtn onClick={() => navigate(ROUTES.MYPAGE.ROOT)}>계정 연동하기</PrimaryBtn>
        </EmptyBox>
      ) : (
        <>
          {/* 탭 1: 과제 & 퀴즈 일정 */}
          {activeTab === "assignments" && (
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>다가오는 과제 & 일정 ({assignments.length})</SectionTitle>
                <RefreshBtn onClick={loadData} disabled={isLoading}>
                  <RefreshCw size={13} className={isLoading ? "spin" : ""} />
                  <span>새로고침</span>
                </RefreshBtn>
              </SectionTop>

              {assignments.length === 0 ? (
                <EmptyBox style={{ padding: "36px 16px" }}>
                  <CheckCircle2 size={32} color="#16a34a" />
                  <EmptyTitle>예정된 과제가 없습니다</EmptyTitle>
                  <EmptyDesc>모든 과제를 제출했거나 2주 이내 마감 일정이 없습니다. 멋져요! 👍</EmptyDesc>
                </EmptyBox>
              ) : (
                <ListContainer>
                  {assignments.map((item) => {
                    const dueDate = new Date(item.timesort * 1000);
                    const isUrgent = item.isUrgent;

                    return (
                      <CardItem key={item.id}>
                        <CardMain>
                          <AssignTop>
                            <CourseBadge>{item.course?.fullname || "강좌"}</CourseBadge>
                            <DueBadge $urgent={Boolean(isUrgent)}>
                              {item.daysRemaining !== undefined
                                ? item.daysRemaining <= 0
                                  ? "오늘 마감"
                                  : `D-${item.daysRemaining}`
                                : "기한 있음"}
                            </DueBadge>
                          </AssignTop>

                          <AssignTitle>{item.name}</AssignTitle>
                          <AssignTime>
                            <Clock size={12} />
                            <span>
                              {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} 마감
                            </span>
                          </AssignTime>
                        </CardMain>

                        {/* 맥락형 추천 스마트 액션 바 */}
                        <SmartActionRow>
                          <ActionChip $primary onClick={() => handleRegisterAssignmentReminder(item)}>
                            <Bell size={13} />
                            <span>마감 전 알림 예약</span>
                          </ActionChip>
                          <ActionChip onClick={() => window.open("https://lms.inu.ac.kr", "_blank")}>
                            <ExternalLink size={13} />
                            <span>LMS에서 제출</span>
                          </ActionChip>
                        </SmartActionRow>
                      </CardItem>
                    );
                  })}
                </ListContainer>
              )}
            </SectionWrapper>
          )}

          {/* 탭 2: 수강 강좌 */}
          {activeTab === "courses" && (
            <SectionWrapper>
              <SectionTop>
                <SectionTitle>이번 학기 수강 강좌 ({courses.length})</SectionTitle>
                <NoticeText>총 {courses.length}개 과목 수강 중</NoticeText>
              </SectionTop>

              <ListContainer>
                {courses.map((course) => (
                  <CardItem key={course.id}>
                    <CardMain>
                      <CourseItemHeader>
                        <CourseTitle>{course.fullname}</CourseTitle>
                        <CourseCode>{course.shortname}</CourseCode>
                      </CourseItemHeader>
                    </CardMain>

                    {/* 맥락형 스마트 액션 바 */}
                    <SmartActionRow>
                      <ActionChip onClick={() => window.open(`https://lms.inu.ac.kr/course/view.php?id=${course.id}`, "_blank")}>
                        <BookOpen size={13} />
                        <span>강의실 바로가기</span>
                      </ActionChip>
                    </SmartActionRow>
                  </CardItem>
                ))}
              </ListContainer>
            </SectionWrapper>
          )}
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 12px ${MOBILE_PAGE_GUTTER} 40px;
  display: flex;
  flex-direction: column;
`;

const TabBar = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border-radius: 9px;
  border: none;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? "#0f172a" : "#64748b")};
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  box-shadow: ${({ $active }) => ($active ? "0 2px 6px rgba(0,0,0,0.05)" : "none")};
  cursor: pointer;
  position: relative;
`;

const CountBadge = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 10px;
`;

const ToastBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 14px;
  animation: fadeIn 0.3s ease;
  button {
    margin-left: auto;
    background: #2563eb;
    color: #fff;
    border: none;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
  }
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  .spin {
    animation: spin 1s linear infinite;
  }
`;

const NoticeText = styled.span`
  font-size: 11.5px;
  color: #94a3b8;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardItem = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AssignTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CourseBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #0284c7;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
`;

const DueBadge = styled.span<{ $urgent: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  background: ${({ $urgent }) => ($urgent ? "#fee2e2" : "#f1f5f9")};
  color: ${({ $urgent }) => ($urgent ? "#ef4444" : "#64748b")};
`;

const AssignTitle = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
`;

const AssignTime = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #94a3b8;
`;

const CourseItemHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CourseTitle = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
`;

const CourseCode = styled.div`
  font-size: 11.5px;
  color: #64748b;
`;

const SmartActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f8fafc;
  overflow-x: auto;
`;

const ActionChip = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${({ $primary }) => ($primary ? "#bfdbfe" : "#e2e8f0")};
  background: ${({ $primary }) => ($primary ? "#eff6ff" : "#ffffff")};
  color: ${({ $primary }) => ($primary ? "#1d4ed8" : "#475569")};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${({ $primary }) => ($primary ? "#dbeafe" : "#f8fafc")};
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8fafc;
  border-radius: 16px;
  text-align: center;
  gap: 8px;
`;

const EmptyTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin-top: 6px;
`;

const EmptyDesc = styled.div`
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 260px;
`;

const PrimaryBtn = styled.button`
  margin-top: 10px;
  padding: 10px 18px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;
