import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getNotices, getDepartmentNotices } from "@/apis/notices";
import { Notice, DepartmentNotice } from "@/types/notices";
import Box from "@/components/common/Box";
import TabUpper from "@/components/common/TabUpper";
import Skeleton from "@/components/common/Skeleton";
import useUserStore from "@/stores/useUserStore";
import findTitleOrCode from "@/utils/findTitleOrCode";
import { mixpanelTrack } from "@/utils/mixpanel";
import { ROUTES } from "@/constants/routes";
import { formatTimeAgo } from "@/utils/date";

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

  const [schoolNotices, setSchoolNotices] = useState<Notice[]>([]);
  const [deptNotices, setDeptNotices] = useState<DepartmentNotice[]>([]);
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const [isLoadingDept, setIsLoadingDept] = useState(false);

  // 날짜 포맷팅에 공통 유틸 함수 formatTimeAgo 사용

  // 학교 공지사항 가져오기
  useEffect(() => {
    const fetchSchoolNotices = async () => {
      setIsLoadingSchool(true);
      try {
        const response = await getNotices("전체", "date", 1);
        setSchoolNotices(response.data.contents);
      } catch (error) {
        console.error("학교 공지사항 가져오기 실패", error);
      } finally {
        setIsLoadingSchool(false);
      }
    };
    fetchSchoolNotices();
  }, []);

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

  // 카테고리 뱃지 타입 맵핑
  const getCategoryType = (category?: string): "brand" | "warn" | "default" => {
    if (!category) return "default";
    if (category.includes("학사")) return "brand";
    if (
      category.includes("일반") ||
      category.includes("행사") ||
      category.includes("모집") ||
      category.includes("장학") ||
      category.includes("지원") ||
      category.includes("취업")
    ) {
      return "warn";
    }
    return "default";
  };

  const handleSchoolNoticeClick = (notice: Notice) => {
    mixpanelTrack.noticeViewed(notice.category, notice.title, false);
    if (notice.url) {
      window.open(notice.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDeptNoticeClick = (deptNotice: DepartmentNotice) => {
    const deptName =
      findTitleOrCode(deptNotice.department) ||
      deptNotice.department ||
      userInfo.department;
    mixpanelTrack.deptNoticeViewed(deptName, deptNotice.title);
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
              <div key={`school-skeleton-${index}`} style={{ width: "100%" }}>
                <SkeletonItem />
                {index !== 2 && <ItemDivider />}
              </div>
            ))
          ) : schoolNotices.length === 0 ? (
            <EmptyContainer>
              <EmptyText>공지사항이 없습니다.</EmptyText>
            </EmptyContainer>
          ) : (
            schoolNotices.slice(0, 3).map((notice, index) => (
              <div key={notice.id || index} style={{ width: "100%" }}>
                <NoticeItem onClick={() => handleSchoolNoticeClick(notice)}>
                  <Badge $type={getCategoryType(notice.category)}>
                    {notice.category}
                  </Badge>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  <NoticeMeta>
                    <span>{formatTimeAgo(notice.createDate)}</span>
                    <span className="pipe">|</span>
                    <span>{notice.writer}</span>
                  </NoticeMeta>
                </NoticeItem>
                {index !== 2 && <ItemDivider />}
              </div>
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
            <div key={`dept-skeleton-${index}`} style={{ width: "100%" }}>
              <SkeletonItem />
              {index !== 2 && <ItemDivider />}
            </div>
          ))
        ) : deptNotices.length === 0 ? (
          <EmptyContainer>
            <EmptyText>게시물이 없습니다.</EmptyText>
          </EmptyContainer>
        ) : (
          deptNotices.slice(0, 3).map((deptNotice, index) => {
            const deptName =
              findTitleOrCode(deptNotice.department) ||
              deptNotice.department ||
              userInfo.department;
            return (
              <div key={deptNotice.id || index} style={{ width: "100%" }}>
                <NoticeItem onClick={() => handleDeptNoticeClick(deptNotice)}>
                  <Badge $type="brand">학과</Badge>
                  <NoticeTitle>{deptNotice.title}</NoticeTitle>
                  <NoticeMeta>
                    <span>{formatTimeAgo(deptNotice.createDate)}</span>
                    <span className="pipe">|</span>
                    <span>{deptName}</span>
                  </NoticeMeta>
                </NoticeItem>
                {index !== 2 && <ItemDivider />}
              </div>
            );
          })
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
`;

const NoticeItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  gap: 8px;
  transition: background-color 0.15s ease-in-out;

  &:active {
    background-color: var(--bg-subtle, #f8f9fb);
  }
`;

const Badge = styled.span<{ $type: "brand" | "warn" | "default" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;

  ${({ $type }) => {
    if ($type === "warn") {
      return `
        background-color: #FFF5D6;
        color: #B45309;
      `;
    } else if ($type === "brand") {
      return `
        background-color: #DEEFFF;
        color: #0061FF;
      `;
    } else {
      return `
        background-color: var(--bg-muted, #f1f3f5);
        color: var(--text-secondary, #333d4b);
      `;
    }
  }}
`;

const NoticeTitle = styled.h4`
  color: var(--text-primary, #000000);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  margin: 0;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  align-self: stretch;
`;

const NoticeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;

  .pipe {
    color: #e5e8eb;
    font-size: 11px;
  }
`;

const ItemDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--border-default, #e5e8eb);
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

// --- Skeleton components ---

const SkeletonItem = () => {
  return (
    <SkeletonWrapper>
      <Skeleton width={60} height={18} />
      <Skeleton width="90%" height={20} />
      <Skeleton width="120px" height={14} />
    </SkeletonWrapper>
  );
};

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 20px;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
`;
