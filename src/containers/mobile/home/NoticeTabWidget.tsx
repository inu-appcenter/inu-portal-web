import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  ALL_NOTICE_CATEGORY,
  getDepartmentNotices,
  getDepartmentNoticeSchedules,
  getNoticeListQueryKey,
  getNotices,
  NOTICE_LIST_STALE_TIME,
} from "@/apis/notices";
import { Notice, DepartmentNotice } from "@/types/notices";
import { ScheduleEvent, toScheduleEvent } from "@/types/schedules";
import Box from "@/components/common/Box";
import TabUpper from "@/components/common/TabUpper";
import useUserStore from "@/stores/useUserStore";
import findTitleOrCode from "@/utils/findTitleOrCode";
import { mixpanelTrack } from "@/utils/mixpanel";
import { ROUTES } from "@/constants/routes";
import { markNoticesSeen } from "@/utils/noticeSeenStorage";
import SchoolNoticeItem from "@/components/mobile/notice/SchoolNoticeItem";
import DeptNoticeItem from "@/components/mobile/notice/DeptNoticeItem";
import ScheduleModal from "@/components/mobile/calendar/ScheduleModal";

interface NoticeTabWidgetProps {
  activeTab: "school" | "dept";
  setActiveTab: (tab: "school" | "dept") => void;
}

export default function NoticeTabWidget({
  activeTab,
  setActiveTab,
}: NoticeTabWidgetProps) {
  const navigate = useNavigate();
  const { userInfo, tokenInfo } = useUserStore();

  const [deptNotices, setDeptNotices] = useState<DepartmentNotice[]>([]);
  const [isLoadingDept, setIsLoadingDept] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDepartmentNoticeId, setSelectedDepartmentNoticeId] = useState<
    number | null
  >(null);
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleEvent[]>(
    [],
  );
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  // 학교 공지사항 가져오기(홈 인사말과 같은 캐시를 공유한다)
  const { data: schoolNotices = [], isLoading: isLoadingSchool } = useQuery({
    queryKey: getNoticeListQueryKey(ALL_NOTICE_CATEGORY, "date", 1),
    queryFn: () => getNotices(ALL_NOTICE_CATEGORY, "date", 1),
    select: (response) => response.data.contents,
    staleTime: NOTICE_LIST_STALE_TIME,
  });

  // 학과 공지사항 가져오기
  useEffect(() => {
    const fetchDeptNotices = async () => {
      if (!tokenInfo.accessToken || !userInfo.department) {
        setDeptNotices([]);
        setIsLoadingDept(false);
        return;
      }
      setIsLoadingDept(true);
      try {
        const deptCode = findTitleOrCode(userInfo.department);
        if (deptCode) {
          const response = await getDepartmentNotices(deptCode, "date", 1);
          setDeptNotices(response.data.contents);
        } else {
          setDeptNotices([]);
        }
      } catch (error) {
        console.error("학과 공지사항 가져오기 실패", error);
        setDeptNotices([]);
      } finally {
        setIsLoadingDept(false);
      }
    };
    fetchDeptNotices();
  }, [tokenInfo.accessToken, userInfo.department]);

  // 학과 공지 일정 상세 조회
  useEffect(() => {
    if (!isScheduleModalOpen || selectedDepartmentNoticeId == null) {
      return;
    }

    let isIgnored = false;

    const fetchSchedules = async () => {
      setIsScheduleLoading(true);
      try {
        const response = await getDepartmentNoticeSchedules(
          selectedDepartmentNoticeId,
        );
        if (!isIgnored) {
          setSelectedSchedules(
            response.data.map((schedule) => toScheduleEvent(schedule, "dept")),
          );
        }
      } catch (error) {
        console.error("학과 공지 연결 일정을 불러오지 못했습니다.", error);
        if (!isIgnored) {
          setSelectedSchedules([]);
        }
      } finally {
        if (!isIgnored) {
          setIsScheduleLoading(false);
        }
      }
    };

    fetchSchedules();

    return () => {
      isIgnored = true;
    };
  }, [isScheduleModalOpen, selectedDepartmentNoticeId]);

  const handleCalendarClick = (
    e: React.MouseEvent,
    departmentNoticeId: number,
  ) => {
    e.stopPropagation();
    setSelectedDepartmentNoticeId(departmentNoticeId);
    setIsScheduleModalOpen(true);
    mixpanelTrack.featureClicked("Dept AI Calendar", "Home Notice Widget");
    mixpanelTrack.scheduleModalViewed("Dept Notice", 1);
  };

  const handleScheduleModalOpenChange = (open: boolean) => {
    setIsScheduleModalOpen(open);
    if (!open) {
      setSelectedDepartmentNoticeId(null);
      setSelectedSchedules([]);
      setIsScheduleLoading(false);
    }
  };

  const handleSchoolNoticeClick = (notice: Notice) => {
    // 읽음 상태 API가 없어 목록을 열람한 시점을 로컬에 기록한다.
    markNoticesSeen();
    mixpanelTrack.noticeViewed(
      notice.category,
      notice.title,
      false,
      "Home Notice Widget",
    );
    if (notice.id) {
      navigate(ROUTES.BOARD.NOTICE_DETAIL(notice.id));
    } else if (notice.url) {
      window.open(notice.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDeptNoticeClick = (deptNotice: DepartmentNotice) => {
    const deptName =
      findTitleOrCode(deptNotice.department) ||
      deptNotice.department ||
      userInfo.department;
    mixpanelTrack.deptNoticeViewed(
      deptName,
      deptNotice.title,
      false,
      "Home Notice Widget",
    );
    if (deptNotice.url) {
      window.open(deptNotice.url, "_blank", "noopener,noreferrer");
    }
  };

  const tabs = [
    { id: "school", label: "학교" },
    { id: "dept", label: "학과" },
  ];

  return (
    <Box style={{ padding: 0 }}>
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onOpenChange={handleScheduleModalOpenChange}
        events={selectedSchedules}
        isLoading={isScheduleLoading}
      />

      {/* 탭 헤더 영역 */}
      <TabArea>
        <TabInner>
          <TabUpper
            tabs={tabs}
            activeTabId={activeTab}
            onChange={(id) => setActiveTab(id as "school" | "dept")}
          />
        </TabInner>
      </TabArea>

      {/* 공지사항 리스트 영역 */}
      <ListContainer>
        {activeTab === "school" ? (
          isLoadingSchool ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SchoolNoticeItem
                key={`school-skeleton-${index}`}
                isLoading
              />
            ))
          ) : schoolNotices.length === 0 ? (
            <EmptyContainer>
              <EmptyText>공지사항이 없습니다.</EmptyText>
            </EmptyContainer>
          ) : (
            schoolNotices.slice(0, 3).map((notice, index) => (
              <SchoolNoticeItem
                key={notice.id || index}
                category={
                  "subCategory" in notice && notice.subCategory
                    ? `${notice.category} - ${notice.subCategory}`
                    : notice.category
                }
                title={notice.title}
                writer={notice.writer}
                date={notice.createDate}
                onClick={() => handleSchoolNoticeClick(notice)}
              />
            ))
          )
        ) : /* 학과 공지사항 탭 */
        !tokenInfo.accessToken ? (
          <MessageContainer>
            <MessageText>로그인 후 학과 공지사항을 확인해보세요.</MessageText>
            <ActionButton onClick={() => navigate(ROUTES.MYPAGE.ROOT)}>
              로그인하기
            </ActionButton>
          </MessageContainer>
        ) : !userInfo.department ? (
          <MessageContainer>
            <MessageText>학과를 설정하고 공지사항을 확인해보세요.</MessageText>
            <ActionButton onClick={() => navigate(ROUTES.MYPAGE.ROOT)}>
              학과 설정하기
            </ActionButton>
          </MessageContainer>
        ) : isLoadingDept ? (
          Array.from({ length: 3 }).map((_, index) => (
            <DeptNoticeItem
              key={`dept-skeleton-${index}`}
              isLoading
            />
          ))
        ) : deptNotices.length === 0 ? (
          <EmptyContainer>
            <EmptyText>게시물이 없습니다.</EmptyText>
          </EmptyContainer>
        ) : (
          deptNotices.slice(0, 3).map((deptNotice, index) => (
            <DeptNoticeItem
              key={deptNotice.id || index}
              title={deptNotice.title}
              date={deptNotice.createDate}
              views={deptNotice.view}
              hasSchedules={deptNotice.hasSchedules}
              onCalendarClick={(e) => handleCalendarClick(e, deptNotice.id)}
              onClick={() => handleDeptNoticeClick(deptNotice)}
            />
          ))
        )}
      </ListContainer>
    </Box>
  );
}

// --- Styled Components ---

const TabArea = styled.div`
  width: 100%;
  padding: 16px 16px 0;
`;

const TabInner = styled.div`
  max-width: 200px;
  margin: 0 auto;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  > :last-child {
    border-bottom: none;
  }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const MessageText = styled.span`
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  line-height: 20px;
`;

const ActionButton = styled.button`
  background-color: var(--text-brand, #0061ff);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease-in-out;

  &:active {
    opacity: 0.85;
  }
`;

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  width: 100%;
  box-sizing: border-box;
`;

const EmptyText = styled.span`
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
`;
