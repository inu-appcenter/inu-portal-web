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
import {
  getTimetableNowBarSettings,
  setTimetableNowBarSettings,
  testTimetableNowBar,
  cancelTimetableNowBar,
  isMobileAppEnvironment,
} from "@/apis/timetableNowBarBridge";

export default function MobileNotificationSettingsPage() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [chatPushEnabled, setChatPushEnabled] = useState(!!userInfo.chatPushEnabled);
  const [nowBarEnabled, setNowBarEnabled] = useState(true);
  const [isNowBarUpdating, setIsNowBarUpdating] = useState(false);
  const [testNowBarActive, setTestNowBarActive] = useState(false);
  const [isTestingNowBar, setIsTestingNowBar] = useState(false);

  useEffect(() => {
    setChatPushEnabled(!!userInfo.chatPushEnabled);
  }, [userInfo.chatPushEnabled]);

  useEffect(() => {
    getTimetableNowBarSettings().then((settings) => {
      if (settings) {
        setNowBarEnabled(settings.enabled);
      }
    });
  }, []);

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

  const handleNowBarToggle = async () => {
    if (isNowBarUpdating) return;
    const targetStatus = !nowBarEnabled;
    setNowBarEnabled(targetStatus);
    setIsNowBarUpdating(true);

    try {
      const ok = await setTimetableNowBarSettings({ enabled: targetStatus });
      if (!ok && isMobileAppEnvironment()) {
        setNowBarEnabled(!targetStatus);
        alert("시간표 Now Bar 설정 변경에 실패했습니다.");
      }
    } catch {
      setNowBarEnabled(!targetStatus);
      alert("시간표 Now Bar 설정 변경에 실패했습니다.");
    } finally {
      setIsNowBarUpdating(false);
    }
  };

  const handleTriggerTestNowBar = async () => {
    if (isTestingNowBar) return;
    setIsTestingNowBar(true);
    try {
      const ok = await testTimetableNowBar({
        title: "컴퓨터네트워크 (모의 수업)",
        location: "정보기술대학 7호관 314호",
        minutes: 75,
      });
      if (ok) {
        setTestNowBarActive(true);
        alert(
          "테스트 Now Bar가 생성되었습니다!\n휴대폰 잠금화면, AOD 또는 상단 상태표시줄에서 실시간 수업 카드 및 남은 시간 카운트다운을 확인해 보세요."
        );
      } else {
        alert("모바일 앱(INTIP 앱) 환경에서만 실시간 Now Bar를 띄울 수 있습니다.");
      }
    } finally {
      setIsTestingNowBar(false);
    }
  };

  const handleDismissTestNowBar = async () => {
    try {
      await cancelTimetableNowBar();
      setTestNowBarActive(false);
      alert("테스트 Now Bar가 닫혔습니다.");
    } catch {
      alert("Now Bar 닫기에 실패했습니다.");
    }
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

            <Divider margin="0" />

            <SettingRow onClick={() => {
              mixpanelTrack.mypageMenuClicked("알림설정 - 스마트 감시 관리");
              navigate(ROUTES.MYPAGE.SMART_WATCH);
            }}>
              <RowContent>
                <RowTitle>스마트 감시 & 리마인더</RowTitle>
                <RowDescription>
                  힐링존/열람실 빈자리 감시 및 LMS 과제, 좌석 연장 알림을 확인해요.
                </RowDescription>
              </RowContent>
              <Icon name="chevron-right" size={20} color="#AEAEB2" />
            </SettingRow>
          </Box>
        </TitleContentArea>

        {/* 섹션 2: 실시간 수업 Now Bar (Ongoing Activity) */}
        <TitleContentArea
          title="실시간 수업 Now Bar (잠금화면 & AOD)"
          description="수업 시작 전 강의실 안내와 수업 중 남은 시간 및 진행률을 시스템 잠금화면, 나우 바, AOD에 실시간으로 표시해요."
        >
          <Box style={{ padding: 0 }}>
            <SettingRow
              onClick={handleNowBarToggle}
              style={{
                opacity: isNowBarUpdating ? 0.6 : 1,
                pointerEvents: isNowBarUpdating ? "none" : "auto",
              }}
            >
              <RowContent>
                <RowTitle>실시간 시간표 Now Bar 활성화</RowTitle>
                <RowDescription>
                  수업 시작 15분 전부터 강의실 위치를 안내하고, 수업 중 잔여 시간 카운트다운을 잠금화면에 고정해요.
                </RowDescription>
              </RowContent>
              <SwitchContainer onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={nowBarEnabled}
                  onCheckedChange={handleNowBarToggle}
                />
              </SwitchContainer>
            </SettingRow>

            <Divider margin="0" />

            <ActionBox>
              <ActionInfo>
                <ActionTitle>Now Bar 미리보기 테스트</ActionTitle>
                <ActionDescription>
                  현재 휴대폰의 잠금화면, 상태표시줄 칩, 나우 바에 모의 수업 알림이 어떻게 뜨는지 즉시 테스트해볼 수 있어요.
                </ActionDescription>
              </ActionInfo>
              <ButtonWrapper>
                <TestActionButton
                  onClick={handleTriggerTestNowBar}
                  disabled={isTestingNowBar}
                >
                  {isTestingNowBar ? "생성 중..." : "테스트 Now Bar 띄우기"}
                </TestActionButton>
                {testNowBarActive && (
                  <DismissActionButton onClick={handleDismissTestNowBar}>
                    Now Bar 닫기
                  </DismissActionButton>
                )}
              </ButtonWrapper>
            </ActionBox>
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

const ActionBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 24px 22px;
  background-color: #ffffff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const ActionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1c1c1e;
`;

const ActionDescription = styled.div`
  font-size: 13px;
  color: #8e8e93;
  line-height: 1.4;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const TestActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  border-radius: 8px;
  background: #007aff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }

  &:disabled {
    background: #c7c7cc;
    cursor: not-allowed;
  }
`;

const DismissActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  border-radius: 8px;
  background: #f2f2f7;
  color: #ff3b30;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e5e5ea;
  cursor: pointer;
  transition: background-color 0.2s;

  &:active {
    background-color: #e5e5ea;
  }
`;
