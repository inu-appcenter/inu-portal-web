import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getMembers } from "apis/members";
import useUserStore from "stores/useUserStore";
import ScrollBarStyles from "resources/styles/ScrollBarStyles";
import RootPage from "pages/RootPage";
import HomePage from "pages/HomePage";
import LoginPage from "pages/LoginPage";
import PostsPage from "pages/PostsPage";
import WritePage from "pages/WritePage";
import MyPage from "pages/MyPage";
import AiPage from "pages/AiPage";
import MapPage from "pages/MapPage";
import RentalPage from "pages/RentalPage";

import MobileRootPage from "mobile/pages/MobileRootPage";
import AppRootPage from "mobile/pages/AppRoutePage";

import InstallPage from "./mobile/pages/InstallPage";
import tokenInstance from "./apis/tokenInstance.ts";
// import axiosInstance from "./apis/axiosInstance.ts";

function App() {
  const location = useLocation();
  const { tokenInfo, setTokenInfo, setUserInfo, userInfo } = useUserStore();

  // URL 쿼리에서 토큰 값 추출 및 저장
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("token");

    if (accessToken) {
      // URL에서 받은 token으로 accessToken 설정
      setTokenInfo({
        accessToken: accessToken,
        accessTokenExpiredTime: "",
        refreshToken: "",
        refreshTokenExpiredTime: "",
      });
    }
  }, [location.search, setTokenInfo]);

  // 초기화 및 회원 정보 가져오기
  useEffect(() => {
    const storedTokenInfo = localStorage.getItem("tokenInfo"); // 로컬스토리지에서 tokenInfo 가져오기
    if (storedTokenInfo) {
      const parsedTokenInfo = JSON.parse(storedTokenInfo);
      setTokenInfo(parsedTokenInfo);
    }
  }, [setTokenInfo]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await getMembers();
        setUserInfo(response.data);
      } catch (error) {
        console.error("회원 가져오기 실패", error);
      }
    };

    if (tokenInfo.accessToken) {
      initializeUser();
    }
  }, [tokenInfo, setUserInfo]);

  // 웹뷰에서 FCM 토큰 전달 콜백 등록
  useEffect(() => {
    (window as any).onReceiveFcmToken = async function (token: string) {
      console.log("FCM 토큰 전달받음:", token);

      try {
        // 로컬스토리지에 토큰 저장
        localStorage.setItem("fcmToken", token);

        // 서버로 토큰 등록
        await tokenInstance.post("/api/tokens", { token });
        console.log("FCM 토큰 등록 완료");
      } catch (error) {
        console.error("FCM 토큰 등록 실패", error);
      }
    };

    // ✅ iOS에 "준비 완료" 신호 보내기
    if ((window as any).webkit?.messageHandlers?.fcmReady) {
      (window as any).webkit.messageHandlers.fcmReady.postMessage("ready");
      console.log("Native App에 FCM 핸들러 준비 완료 신호 전송");
    }

    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, [userInfo]);

  return (
    <>
      {location.pathname.startsWith("/m/") ||
      location.pathname.startsWith("/app/") ? null : (
        <ScrollBarStyles />
      )}
      <Routes>
        <Route path="/install" element={<InstallPage />} />
        <Route path="/app/*" element={<AppRootPage />} />
        <Route path="/m/*" element={<MobileRootPage />} />
        <Route path="/" element={<RootPage />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/rental" element={<RentalPage />} />
        </Route>
        <Route path="/ai" element={<AiPage />} />
      </Routes>
    </>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
