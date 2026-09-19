import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getNotices, getDepartmentNotices } from "@/apis/notices";
import { Notice, DepartmentNotice } from "@/types/notices";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import findTitleOrCode from "@/utils/findTitleOrCode";
import Icon from "@/components/common/Icon";
import { formatTimeAgo } from "@/utils/date";

export default function DailyBriefNoticeCard() {
  const navigate = useNavigate();
  const { userInfo, tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);

  const [activeTab, setActiveTab] = useState<"school" | "dept">("school");
  const [schoolNotices, setSchoolNotices] = useState<Notice[]>([]);
  const [deptNotices, setDeptNotices] = useState<DepartmentNotice[]>([]);
  const [isLoadingSchool, setIsLoadingSchool] = useState(false);
  const [isLoadingDept, setIsLoadingDept] = useState(false);

  // 학교 공지 가져오기
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSchool(true);
    getNotices("전체", "date", 1)
      .then((res) => {
        if (isMounted && res.data?.contents) {
          setSchoolNotices(res.data.contents);
        }
      })
      .catch((err) => {
        console.warn("학교 공지사항 조회 실패:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSchool(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 학과 공지 가져오기
  useEffect(() => {
    if (!isLoggedIn || !userInfo.department) {
      setDeptNotices([]);
      return;
    }

    let isMounted = true;
    setIsLoadingDept(true);
    const deptCode = findTitleOrCode(userInfo.department);

    if (deptCode) {
      getDepartmentNotices(deptCode, "date", 1)
        .then((res) => {
          if (isMounted && res.data?.contents) {
            setDeptNotices(res.data.contents);
          }
        })
        .catch((err) => {
          console.warn("학과 공지사항 조회 실패:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingDept(false);
        });
    } else {
      setIsLoadingDept(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, userInfo.department]);

  const displaySchoolNotices = schoolNotices.slice(0, 4);
  const displayDeptNotices = deptNotices.slice(0, 4);

  const handleDeptNoticeClick = (deptNotice: DepartmentNotice) => {
    if (deptNotice.url) {
      window.open(deptNotice.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(ROUTES.BOARD.DEPT_NOTICE);
    }
  };

  return (
    <SectionWrapper>
      <ContextIntro>
        {activeTab === "school"
          ? "학교 주요 공지사항을 확인해 보세요."
          : `${userInfo.department ? `${userInfo.department} 공지사항을 확인해 보세요.` : "학과 공지사항을 확인해 보세요."}`}
      </ContextIntro>
      <CardContainer>
        <CardHeader>
          <HeaderLeft>
            <CardTitle>공지사항</CardTitle>
            <TabSwitchGroup>
              <TabButton
                $active={activeTab === "school"}
                onClick={() => setActiveTab("school")}
              >
                학교 공지
              </TabButton>
              <TabButton
                $active={activeTab === "dept"}
                onClick={() => setActiveTab("dept")}
              >
                내 학과 공지
              </TabButton>
            </TabSwitchGroup>
          </HeaderLeft>
          <HeaderMoreButton
            onClick={() =>
              navigate(
                activeTab === "school"
                  ? ROUTES.BOARD.NOTICE
                  : ROUTES.BOARD.DEPT_NOTICE,
              )
            }
            aria-label="공지사항 더보기"
          >
            <Icon name="chevron-right" size={14} color="#6b7280" />
          </HeaderMoreButton>
        </CardHeader>

        {activeTab === "school" ? (
          /* 학교 공지사항 탭 */
          <NoticeList>
            {isLoadingSchool ? (
              <LoadingText>공지사항을 불러오는 중...</LoadingText>
            ) : displaySchoolNotices.length === 0 ? (
              <EmptyNoticeText>등록된 공지사항이 없습니다.</EmptyNoticeText>
            ) : (
              displaySchoolNotices.map((notice, idx) => (
                <ReactNoticeItem
                  key={notice.id || idx}
                  onClick={() => {
                    if (notice.id) {
                      navigate(ROUTES.BOARD.NOTICE_DETAIL(notice.id));
                    } else if (notice.url) {
                      window.open(notice.url, "_blank", "noopener,noreferrer");
                    }
                  }}
                >
                  {idx > 0 && <ItemDivider />}
                  <ItemContent>
                    <TopMetaRow>
                      <CategoryBadge>{notice.category || "일반"}</CategoryBadge>
                      <NoticeDate>{formatTimeAgo(notice.createDate)}</NoticeDate>
                    </TopMetaRow>
                    <NoticeTitleText>{notice.title}</NoticeTitleText>
                  </ItemContent>
                </ReactNoticeItem>
              ))
            )}
          </NoticeList>
        ) : /* 내 학과 공지사항 탭 */
        !isLoggedIn ? (
          <AuthPromptWrapper>
            <PromptText>로그인 후 내 학과의 공지사항을 확인해 보세요.</PromptText>
            <PromptButton onClick={() => navigate(ROUTES.MYPAGE.ROOT)}>
              로그인하기
            </PromptButton>
          </AuthPromptWrapper>
        ) : !userInfo.department ? (
          <AuthPromptWrapper>
            <PromptText>
              학과를 설정하면 학과 공지사항을 바로 확인할 수 있어요.
            </PromptText>
            <PromptButton onClick={() => navigate(ROUTES.MYPAGE.PROFILE)}>
              학과 설정하기
            </PromptButton>
          </AuthPromptWrapper>
        ) : (
          <NoticeList>
            {isLoadingDept ? (
              <LoadingText>학과 공지사항을 불러오는 중...</LoadingText>
            ) : displayDeptNotices.length === 0 ? (
              <EmptyNoticeText>등록된 학과 공지사항이 없습니다.</EmptyNoticeText>
            ) : (
              displayDeptNotices.map((deptNotice, idx) => (
                <ReactNoticeItem
                  key={deptNotice.id || idx}
                  onClick={() => handleDeptNoticeClick(deptNotice)}
                >
                  {idx > 0 && <ItemDivider />}
                  <ItemContent>
                    <TopMetaRow>
                      <DeptBadge>
                        {userInfo.department || "학과"}
                      </DeptBadge>
                      <NoticeDate>{formatTimeAgo(deptNotice.createDate)}</NoticeDate>
                    </TopMetaRow>
                    <NoticeTitleText>{deptNotice.title}</NoticeTitleText>
                  </ItemContent>
                </ReactNoticeItem>
              ))
            )}
          </NoticeList>
        )}

        <FooterRow>
          <ViewAllButton
            onClick={() =>
              navigate(
                activeTab === "school"
                  ? ROUTES.BOARD.NOTICE
                  : ROUTES.BOARD.DEPT_NOTICE,
              )
            }
          >
            {activeTab === "school"
              ? "학교 공지 전체보기"
              : "학과 공지 전체보기"}
          </ViewAllButton>
        </FooterRow>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px 18px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const TabSwitchGroup = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 12px;
  gap: 2px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#1e293b" : "#64748b")};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  padding: 4px 10px;
  border-radius: 9px;
  cursor: pointer;
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none"};
  transition: all 0.15s ease;
`;

const HeaderMoreButton = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReactNoticeItem = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 8px 0;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.7;
  }
`;

const ItemDivider = styled.div`
  height: 1px;
  background-color: #f3f4f6;
  margin-bottom: 10px;
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TopMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryBadge = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  color: #2563eb;
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 7px;
  border-radius: 6px;
  line-height: 1.2;
`;

const DeptBadge = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  color: #0d9488;
  background-color: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 2px 7px;
  border-radius: 6px;
  line-height: 1.2;
`;

const NoticeDate = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
`;

const NoticeTitleText = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.3px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LoadingText = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 20px 0;
`;

const EmptyNoticeText = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 20px 0;
`;

const AuthPromptWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  gap: 12px;
`;

const PromptText = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  margin: 0;
  line-height: 1.4;
`;

const PromptButton = styled.button`
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }
`;

const FooterRow = styled.div`
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
  margin-top: 4px;
`;

const ViewAllButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #edf2f7;
    transform: scale(0.99);
  }
`;
