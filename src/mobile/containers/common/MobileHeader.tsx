import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import intipLogo from "resources/assets/intip-logo.svg";
import ProfileImage from "mobile/components/common/ProfileImage";
import MenuButton from "mobile/components/common/MenuButton";
import LoginNavigateButton from "mobile/components/common/LoginNavigateButton";
import useUserStore from "stores/useUserStore";
import useMobileNavigate from "hooks/useMobileNavigate";
import { useLocation } from "react-router-dom";
import { ReactSVG } from "react-svg";
import UpperBackgroundImg from "resources/assets/mobile-common/upperBackgroundImg.svg";
import MobileTitleHeader from "./MobileTitleHeader.tsx";

export default function MobileHeader() {
  const { userInfo } = useUserStore();
  const mobileNavigate = useMobileNavigate();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const handleLogoClick = () => {
    mobileNavigate(`/home`);
  };

  const handleProfileClick = () => {
    mobileNavigate("/mypage");
  };

  // 경로에 따른 타이틀 정의
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    console.log(path);
    const pathTitleMap: Record<string, string> = {
      "/m/home/tips": "TIPS",
      "/m/home/tips/write": "TIPS 글쓰기",
      "/m/home/notice": "학교 공지사항",
      "/m/home/menu": "식당메뉴",
      "/m/home/calendar": "학사일정",
      "/m/home/campus": "캠퍼스",
      "/m/home/util": "편의",
      "/m/home/council": "총학생회",
      "/m/home/club": "동아리",
      "/m/home/recruitdetail": "동아리 모집 상세",
      "/m/postdetail": "게시글 상세",
      "/m/councilnoticedetail": "공지사항 상세",
      "/m/petitiondetail": "청원 상세",
      "/m/mypage/profile": "프로필 편집",
      "/m/mypage/post": "내 게시글",
      "/m/mypage/like": "좋아요한 글",
      "/m/mypage/comment": "내 댓글",
      "/m/mypage/delete": "회원 탈퇴",
      "/m/login": "로그인",
      "/m/bus/info": "버스 정보",
      "/m/bus/detail": "버스 상세 정보",
      "/m/bus/stopinfo": "정류장 상세 정보",
    };

    return pathTitleMap[path] || "";
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <MobileHeaderWrapper $visible={showHeader}>
      <MainHeaderWrapper>
        <UpperBackground src={UpperBackgroundImg} alt="background" />
        <ReactSVG onClick={handleLogoClick} src={intipLogo} />
        <ProfileMenuWrapper>
          {userInfo.nickname ? (
            <PostInfo onClick={handleProfileClick}>
              <ProfileImage fireId={userInfo.fireId} />
              {userInfo.nickname}
            </PostInfo>
          ) : (
            <LoginNavigateButton />
          )}
          <MenuButton />
        </ProfileMenuWrapper>
      </MainHeaderWrapper>

      {/* title이 존재할 경우에만 헤더 렌더링 */}
      {pageTitle && <MobileTitleHeader title={pageTitle} />}
    </MobileHeaderWrapper>
  );
}

const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 1;
  //box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  transition: transform 0.3s ease;
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-72px)"};
`;
const MainHeaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;

  height: 72px;
`;

const UpperBackground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지가 부모 영역 꽉 채움 */
  z-index: -1;
`;

const ProfileMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  background: #ecf4ff;
  font-size: 14px;
  color: #666;
  border-radius: 100px;
  padding: 5px;
  font-weight: 400;
`;
