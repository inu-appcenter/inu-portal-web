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

  useEffect(() => {
    (window as any).onReceiveFcmToken = (token: string) => {
      if (!token || token.trim() === "") return;

      localStorage.setItem("fcmToken", token);
      setFcmToken(token);
    };

    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("fcmToken");
    if (savedToken) {
      setFcmToken(savedToken);
    }
  }, []);

  const LAST_SENT_TOKEN_KEY = "lastSentFcmToken";

  useEffect(() => {
    const syncToken = async () => {
      if (!fcmToken) return;

      const lastSent = localStorage.getItem(LAST_SENT_TOKEN_KEY);
      if (lastSent === fcmToken) return;

      try {
        await tokenInstance.post("/api/tokens", { token: fcmToken });
        localStorage.setItem(LAST_SENT_TOKEN_KEY, fcmToken);
      } catch (error) {
        /* empty */
      }
    };

    syncToken();
  }, [fcmToken]);

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
