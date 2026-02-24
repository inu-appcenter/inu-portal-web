import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMembers, postApiLogs } from "apis/members";
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
  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();
  const [fcmToken, setFcmToken] = useState("");

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

  // 웹뷰 FCM 토큰 수신 설정
  useEffect(() => {
    // 전역 윈도우 객체에 토큰 수신 콜백 등록
    (window as any).onReceiveFcmToken = async function (token: string) {
      // 토큰 유효성 확인 및 저장
      if (token && token.trim() !== "") {
        localStorage.setItem("fcmToken", token);
        setFcmToken(token);
      }
    };

    return () => {
      // 컴포넌트 언마운트 시 콜백 초기화
      (window as any).onReceiveFcmToken = null;
    };
  }, []);

  // FCM 토큰 서버 등록 (로컬 스토리지 기반 전송)
  useEffect(() => {
    // 서버 등록 비동기 함수 정의
    const registerFcmToken = async () => {
      // 로컬 스토리지 토큰 조회
      const storedToken = localStorage.getItem("fcmToken");

      // 토큰 존재 및 로그인 상태 확인 시 전송 실행
      if (storedToken) {
        try {
          alert("토큰 전송 시도");
          await tokenInstance.post("/fcm/token", { token: storedToken });
          alert("토큰 전송 완료");
        } catch (error) {
          // 서버 등록 실패 예외 처리
        }
      } else {
        alert("토큰이 없습니다");
      }
    };

    registerFcmToken();
    // 토큰 상태, 로그인 여부, 토큰 정보 변경 시 재실행
  }, [fcmToken, tokenInfo]);

  //접속 유저수 중복없이 카운팅
  useEffect(() => {
    const apiCount = async () => {
      const STORAGE_KEY = "user_count_date";

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const lastCountDate = localStorage.getItem(STORAGE_KEY);

      if (lastCountDate !== today) {
        await postApiLogs("/api/members/no-dup");
        localStorage.setItem(STORAGE_KEY, today);
      }
    };
    apiCount();
  }, []);

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
