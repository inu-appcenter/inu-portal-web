import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { getMembers, patchChatPushSetting } from "@/apis/members";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import Switch from "@/components/common/Switch";
import { ChevronRight } from "lucide-react";
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

  const handleDeptClick = () => {
    mixpanelTrack.mypageMenuClicked("알림설정 - 학과공지알리미");
    navigate(`${ROUTES.BOARD.DEPT_SETTING}?tab=dept`);
  };

  const handleSchoolClick = () => {
    mixpanelTrack.mypageMenuClicked("알림설정 - 학교공지알리미");
    navigate(`${ROUTES.BOARD.DEPT_SETTING}?tab=school`);
  };

  return (
    <PageWrapper>
      <ContentContainer>
        <Box style={{ padding: "0" }}>
          <SettingRow onClick={handleChatToggle} style={{ opacity: isUpdating ? 0.6 : 1, pointerEvents: isUpdating ? "none" : "auto" }}>
            <RowContent>
              <RowTitle>채팅 알림</RowTitle>
              <RowDescription>채팅방별 알림 설정은 각 방에서 설정할 수 있어요.</RowDescription>
            </RowContent>
            <SwitchContainer onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={chatPushEnabled}
                onCheckedChange={handleChatToggle}
              />
            </SwitchContainer>
          </SettingRow>

          <Divider margin="0" />

          <SettingRow onClick={handleDeptClick}>
            <RowContent>
              <RowTitle>학과 공지 알리미</RowTitle>
              <RowDescription>구독 중인 학과 및 키워드 새 글 알림 설정</RowDescription>
            </RowContent>
            <ChevronRight size={20} color="#AEAEB2" />
          </SettingRow>

          <Divider margin="0" />

          <SettingRow onClick={handleSchoolClick}>
            <RowContent>
              <RowTitle>학교 공지 알리미</RowTitle>
              <RowDescription>학교 공지 카테고리 및 키워드 새 글 알림 설정</RowDescription>
            </RowContent>
            <ChevronRight size={20} color="#AEAEB2" />
          </SettingRow>
        </Box>
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
  gap: 16px;

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
