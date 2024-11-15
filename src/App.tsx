import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import RootPage from "pages/RootPage";
import HomePage from "pages/HomePage";
import LoginPage from "pages/LoginPage";
import PostsPage from "pages/PostsPage";

import MyPage from "./page/MyPage";
import WritePost from "./page/WritePostPage";
import AiPage from "./page/AiPage";
import MobileMainPage from "./mobile/pages/MobileMainPage";
import InstallPage from "./mobile/pages/InstallPage";
import ScrollBarStyles from "resources/styles/ScrollBarStyles";
import MobileAiPage from "./mobile/pages/MobileAiPage";
import { useEffect } from "react";
import useUserStore from "stores/useUserStore";
import { getMembers } from "apis/members";

function App() {
  const location = useLocation();
  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();

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

  return (
    <>
      {location.pathname.startsWith("/m") ? null : <ScrollBarStyles />}
      <Routes>
        <Route path="/install" element={<InstallPage />} />
        <Route path="/m/*" element={<MobileMainPage />} />
        <Route path="/" element={<RootPage />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/posts" element={<PostsPage />} />

          <Route path="/mypage/*" element={<MyPage />} />
        </Route>
        <Route path="/ai/*" element={<AiPage />} />
        <Route path="/m/ai/*" element={<MobileAiPage />} />
        <Route path="update/:id" element={<WritePost />} />
        <Route path="/write" element={<WritePost />} />
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
