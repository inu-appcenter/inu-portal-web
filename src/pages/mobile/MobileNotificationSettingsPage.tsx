import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { getMembers, patchChatPushSetting } from "@/apis/members";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import Switch from "@/components/common/Switch";
import Icon from "@/components/common/Icon";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA, DESKTOP_READING_WIDTH } from "@/styles/responsive";

export default function MobileNotificationSettingsPage() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [chatPushEnabled, setChatPushEnabled] = useState(!!userInfo.chatPushEnabled);

  useEffect(() => {
    setChatPushEnabled(!!userInfo.chatPushEnabled);
  }, [userInfo.chatPushEnabled]);

  useHeader({
    title: "알림 설정",
    subHeader: null,
    hasback: true,
  });

  useEffect(() => {
    trackPageView("알림 설정");

    // 최신 알림 설정 상태를 가져와 동기화
    const fetchUserInfo = async () => {
      try {
        const res = await getMembers();
        setUserInfo(res.data);
      } catch (err) {
        console.error("사용자 정보 로드 실패:", err);
      }
    };
    fetchUserInfo();
  }, [setUserInfo]);

  const handleChatToggle = async () => {
    if (isUpdating) return;

    // UI 선반영
    const targetStatus = !chatPushEnabled;
    setChatPushEnabled(targetStatus);
    setIsUpdating(true);

    try {
      // 알림 설정 변경 API 호출
      await patchChatPushSetting();

      // 최신 사용자 정보 조회
      const userRes = await getMembers();
      const finalStatus = !!userRes.data.chatPushEnabled;

      // 로컬 및 전역 상태 갱신
      setChatPushEnabled(finalStatus);
      setUserInfo(userRes.data);

      mixpanelTrack.chatPushToggled(finalStatus, "Notification Settings Page");
    } catch (error) {
      console.error("채팅 알림 설정 변경 실패:", error);
      alert("알림 설정 변경에 실패했습니다.");

      // 에러 발생 시 기존 상태 롤백
      setChatPushEnabled(!targetStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTabClick = (tab: string, label: string) => {
    mixpanelTrack.mypageMenuClicked(`알림설정 - ${label}`);
    navigate(`${ROUTES.MYPAGE.DAILY_BRIEF}?tab=${tab}`);
  };

  return (
    <PageWrapper>
      <ContentContainer>
        {/* 섹션 1: Daily Brief & 공지 알리미 */}
        <TitleContentArea
          title="Daily Brief & 공지 알리미"
          description="수업 시작 전 알림부터 학사일정, 공지사항 새 글까지 맞춤 알림을 설정할 수 있어요."
        >
          <Box style={{ padding: 0 }}>
            <SettingRow onClick={() => handleTabClick("timetable", "시간표 알림")}>
              <RowContent>
                <RowTitle>시간표 알림</RowTitle>
                <RowDescription>
                  수업 시작 전 알림 및 당일 강의 목록 브리핑을 설정할 수 있어요.
                </RowDescription>
              </RowContent>
              <Icon name="chevron-right" size={20} color="#AEAEB2" />
            </SettingRow>

            <Divider margin="0" />

            <SettingRow onClick={() => handleTabClick("schedule", "학사일정 알림")}>
              <RowContent>
                <RowTitle>학사일정 알림</RowTitle>
                <RowDescription>
                  오늘의 학교 및 학과 일정 브리핑을 설정할 수 있어요.
                </RowDescription>
              </RowContent>
              <Icon name="chevron-right" size={20} color="#AEAEB2" />
            </SettingRow>

            <Divider margin="0" />

            <SettingRow onClick={() => handleTabClick("school", "학교 공지 알리미")}>
              <RowContent>
                <RowTitle>학교 공지 알리미</RowTitle>
                <RowDescription>
                  학교 공지 카테고리 및 키워드 새 글 알림을 설정할 수 있어요.
                </RowDescription>
              </RowContent>
              <Icon name="chevron-right" size={20} color="#AEAEB2" />
            </SettingRow>

            <Divider margin="0" />

            <SettingRow onClick={() => handleTabClick("dept", "학과 공지 알리미")}>
              <RowContent>
                <RowTitle>학과 공지 알리미</RowTitle>
                <RowDescription>
                  구독 중인 학과 및 키워드 새 글 알림을 설정할 수 있어요.
                </RowDescription>
              </RowContent>
              <Icon name="chevron-right" size={20} color="#AEAEB2" />
            </SettingRow>
          </Box>
        </TitleContentArea>

        {/* 섹션 2: 기타 알림 */}
        <TitleContentArea
          title="일반 알림"
          description="채팅 등 서비스 기본 푸시 알림을 설정할 수 있어요."
        >
          <Box style={{ padding: 0 }}>
            <SettingRow
              onClick={handleChatToggle}
              style={{
                opacity: isUpdating ? 0.6 : 1,
                pointerEvents: isUpdating ? "none" : "auto",
              }}
            >
              <RowContent>
                <RowTitle>채팅 알림</RowTitle>
                <RowDescription>
                  채팅방별 알림 설정은 각 채팅방 안에서 개별 설정할 수 있어요.
                </RowDescription>
              </RowContent>
              <SwitchContainer onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={chatPushEnabled}
                  onCheckedChange={handleChatToggle}
                />
              </SwitchContainer>
            </SettingRow>
          </Box>
        </TitleContentArea>
      </ContentContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  // min-height: calc(100svh - 56px);
  background-color: transparent;
  padding: 16px ${MOBILE_PAGE_GUTTER} 40px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_READING_WIDTH});
    margin: 0 auto;
  }
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  background-color: #ffffff;
  transition: background-color 0.2s ease;

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  &:active {
    background-color: #f8f9fa;
  }
`;

const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding-right: 16px;
`;

const RowTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1e;
`;

const RowDescription = styled.div`
  font-size: 13px;
  color: #8e8e93;
  line-height: 1.4;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
`;
