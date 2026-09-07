import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import Icon from "@/components/common/Icon";
import type { FontelloIconName } from "@/components/common/fontelloIcons";
import Modal from "@/components/common/Modal";
import Ripple from "@/components/common/Ripple";
import ProfileImage from "@/components/mobile/common/ProfileImage";
import BlockedUsersModal from "@/components/mobile/chat/BlockedUsersModal";
import { MenuGroup, MenuItem } from "@/components/mobile/mypage/MenuGroup";
import {
  MyPageAccountMenu,
  MyPageAdminMenu,
  MyPageSupportMenu,
  MyPageSystemMenu,
  type MyPageMenuItem,
} from "@/resources/strings/m-mypage";
import { loginMascotFace } from "@/resources/assets/illustrations/login";
import { useHeader } from "@/context/HeaderContext.tsx";
import {
  deleteFcmToken,
  getMembersLikes,
  getMembersPosts,
  getMembersReplies,
  getMembersScraps,
} from "@/apis/members";
import { mixpanelTrack } from "@/utils/mixpanel";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { clearTermsAgreement } from "@/components/common/TermsAgreement";
import {
  APPCENTER_URL,
  SUPPORT_FORM_URL,
  SUPPORT_MAILTO,
} from "@/constants/support";

/** 프로필 카드 아래 줄에 놓이는 활동 요약. 값은 `useMyPageCounters`가 채운다. */
const COUNTERS: {
  key: "posts" | "likes" | "comments" | "scraps";
  title: string;
  icon: FontelloIconName;
  route: string;
}[] = [
  {
    key: "posts",
    title: "내 글",
    icon: "edit-pencil-01",
    route: ROUTES.MYPAGE.POSTS,
  },
  { key: "likes", title: "좋아요", icon: "heart", route: ROUTES.MYPAGE.LIKES },
  {
    key: "comments",
    title: "댓글",
    icon: "chat-circle",
    route: ROUTES.MYPAGE.COMMENTS,
  },
  { key: "scraps", title: "스크랩", icon: "bookmark", route: "/save" },
];

/**
 * 프로필 카드의 활동 수. 개수만 세는 API가 없어 목록 API를 그대로 쓴다 —
 * 마이페이지를 열 때마다 네 번 왕복하지 않도록 1분간 캐시한다. 실패하면 숫자
 * 없이 라벨만 보여주고 카드 자체는 그대로 뜬다.
 */
function useMyPageCounters(enabled: boolean, memberId: number) {
  return useQuery({
    queryKey: ["mypage", "counters", memberId],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const [posts, likes, replies, scraps] = await Promise.all([
        getMembersPosts("date"),
        getMembersLikes("date"),
        getMembersReplies("date"),
        getMembersScraps("date", 1),
      ]);
      return {
        posts: posts.data?.length ?? 0,
        likes: likes.data?.length ?? 0,
        comments: replies.data?.length ?? 0,
        scraps: scraps.data?.total ?? 0,
      };
    },
  });
}

export default function MobileMyPage() {
  const { userInfo, setUserInfo, setTokenInfo } = useUserStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isBlockedUsersOpen, setIsBlockedUsersOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = userInfo.id !== 0;
  const isAdmin = userInfo.role === "admin";

  // const { data: counters } = useMyPageCounters(isLoggedIn, userInfo.id);

  useHeader({
    title: "마이페이지",
    subHeader: null,
    hasback: false,
  });

  const handleLogout = async () => {
    const fcmToken = localStorage.getItem("fcmToken");

    if (fcmToken) {
      try {
        await deleteFcmToken(fcmToken);
      } catch (error) {
        console.error("FCM 토큰 삭제 실패:", error);
      }
    }

    mixpanelTrack.userLoggedOut();
    setUserInfo({ id: 0, nickname: "", role: "", fireId: 0, department: "" });
    setTokenInfo({
      accessToken: "",
      accessTokenExpiredTime: "",
      refreshToken: "",
      refreshTokenExpiredTime: "",
    });
    localStorage.removeItem("tokenInfo");
    // 다른 계정으로 로그인할 수 있으므로 약관 동의 이력도 초기화한다.
    clearTermsAgreement();

    navigate(ROUTES.HOME, { replace: true, state: { isTabNavigation: true } });
  };

  const handleClick = (title: string) => {
    mixpanelTrack.mypageMenuClicked(title);
    switch (title) {
      case "프로필 수정":
        navigate(ROUTES.MYPAGE.PROFILE);
        break;
      case "알림 설정":
        navigate(ROUTES.MYPAGE.NOTIFICATION);
        break;
      case "차단 사용자 관리":
        setIsBlockedUsersOpen(true);
        break;
      case "문의하기":
        window.open(SUPPORT_FORM_URL);
        break;
      case "개발자에게 메일 보내기":
        // 부적절한 콘텐츠·악성 사용자 신고를 위한 개발자 직통 연락처
        window.location.href = SUPPORT_MAILTO;
        break;
      case "인천대학교 IT Innovation LAB":
        window.open(APPCENTER_URL);
        break;
      case "알림 설정 확인":
        navigate(ROUTES.MYPAGE.FCM);
        break;
      case "관리자 페이지":
        navigate("/admin");
        break;
      case "로그아웃":
        setIsLogoutModalOpen(true);
        break;
      case "회원탈퇴":
        navigate(ROUTES.MYPAGE.DELETE);
        break;
      default:
        break;
    }
  };

  const renderGroup = (items: MyPageMenuItem[]) => (
    <MenuGroup>
      {items.map((item) => (
        <MenuItem
          key={item.title}
          {...item}
          onClick={() => handleClick(item.title)}
        />
      ))}
    </MenuGroup>
  );

  const systemMenu = isAdmin
    ? [...MyPageSystemMenu, MyPageAdminMenu]
    : MyPageSystemMenu;

  return (
    <Page>
      <Body>
        {isLoggedIn ? (
          <ProfileCard>
            <ProfileHeader onClick={() => handleClick("프로필 수정")}>
              <Ripple />
              <Avatar>
                <ProfileImage fireId={userInfo.fireId} clickable={false} />
              </Avatar>
              <ProfileText>
                <Nickname>{userInfo.nickname}</Nickname>
                <Department>
                  {userInfo.department || "학과 정보 없음"}
                </Department>
              </ProfileText>
              <Icon
                name="chevron-right"
                size={24}
                color="var(--text-tertiary, #8b95a1)"
              />
            </ProfileHeader>
            <Counters>
              {COUNTERS.map(({ key, title, icon, route }) => {
                // const value = counters?.[key];
                return (
                  <Counter
                    key={key}
                    onClick={() => {
                      mixpanelTrack.mypageMenuClicked(title);
                      navigate(route);
                    }}
                  >
                    <Icon
                      name={icon}
                      size={24}
                      color="var(--text-brand, #0061ff)"
                    />
                    <CounterLabel>
                      <span>{title}</span>
                      {/* {value !== undefined && (
                        <CounterValue $empty={value === 0}>{value}</CounterValue>
                      )} */}
                    </CounterLabel>
                  </Counter>
                );
              })}
            </Counters>
          </ProfileCard>
        ) : (
          <LoginCard>
            <LoginCopy>
              <LoginTitle>
                로그인 하시면
                <br />
                다양한 꿀기능을 사용할 수 있어요.
              </LoginTitle>
              <LoginSubtitle>
                인천대학교 포털 시스템 계정으로 시작하세요.
              </LoginSubtitle>
            </LoginCopy>
            {/* 버튼 뒤에서 얼굴만 빼꼼 내미는 횃불이. 버튼이 아랫부분을 가리는
                게 의도라 절대배치로 겹쳐 둔다. */}
            <MascotFace src={loginMascotFace} alt="" aria-hidden="true" />
            <LoginButton type="button" onClick={() => navigate(ROUTES.LOGIN)}>
              로그인
            </LoginButton>
          </LoginCard>
        )}

        {isLoggedIn && renderGroup(MyPageAccountMenu)}
        {renderGroup(MyPageSupportMenu)}
        {renderGroup(systemMenu)}

        {isLoggedIn && (
          <FooterActions>
            <TextAction type="button" onClick={() => handleClick("로그아웃")}>
              로그아웃
            </TextAction>
            {/* 앱 내 계정 삭제 진입점 (App Store 가이드라인 5.1.1(v)) */}
            <TextAction
              type="button"
              $muted
              onClick={() => handleClick("회원탈퇴")}
            >
              회원탈퇴
            </TextAction>
          </FooterActions>
        )}
      </Body>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="INTIP에서 로그아웃 하시겠어요?"
        primaryButton={{
          text: "로그아웃",
          variant: "danger",
          onClick: () => {
            setIsLogoutModalOpen(false);
            void handleLogout();
          },
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsLogoutModalOpen(false),
        }}
      />
      <BlockedUsersModal
        isOpen={isBlockedUsersOpen}
        onOpenChange={setIsBlockedUsersOpen}
        title="차단 사용자 관리"
      />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-subtle, #f8f9fb);
  padding-top: var(--header-height, 56px);
  padding-bottom: var(--nav-height, 100px);

  @media ${DESKTOP_MEDIA} {
    min-height: auto;
    padding-bottom: 56px;
  }
`;

const Body = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 16px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
`;

const ProfileCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: clip;
`;

const ProfileHeader = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  border: none;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;

  &.active-touch {
    background: var(--bg-muted, #f1f3f5);
  }
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: var(--radius-full, 999px);
  overflow: hidden;
  background: var(--border-brand-subtle, #d3e5ff);

  img {
    width: 100%;
    height: 100%;
    border: none;
    object-fit: cover;
  }
`;

const ProfileText = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Nickname = styled.span`
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-secondary, #333d4b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Department = styled.span`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-tertiary, #8b95a1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Counters = styled.div`
  display: flex;
  align-items: stretch;
`;

const Counter = styled.button`
  position: relative;
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0 16px;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const CounterLabel = styled.span`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
`;

const CounterValue = styled.span<{ $empty: boolean }>`
  font-weight: 500;
  line-height: 1.4;
  color: ${({ $empty }) =>
    $empty ? "var(--text-disabled, #b0b8c1)" : "var(--text-brand, #0061ff)"};
`;

const LoginCard = styled(Card)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 100px;
  padding: 40px 20px 20px;
  overflow: clip;
`;

const LoginCopy = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 8px;
  box-sizing: border-box;
  color: var(--text-secondary, #333d4b);
  word-break: keep-all;
`;

const LoginTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.2px;
`;

const LoginSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
`;

const MascotFace = styled.img`
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 66px;
  transform: translateX(-50%);
  width: 100px;
  height: 50px;
  object-fit: contain;
  pointer-events: none;
`;

const LoginButton = styled.button`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  box-sizing: border-box;
  border: none;
  border-radius: var(--radius-full, 999px);
  background: var(--blue-800, #003a99);
  color: var(--text-inverse, #ffffff);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: var(--blue-700, #004fcc);
  }
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const TextAction = styled.button<{ $muted?: boolean }>`
  border: none;
  background: transparent;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: ${({ $muted }) =>
    $muted ? "var(--text-disabled, #b0b8c1)" : "var(--text-tertiary, #8b95a1)"};
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;
