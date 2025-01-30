import styled from "styled-components";
import {useEffect} from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import UpperBackgroundImg from "resources/assets/mobile-common/upperBackgroundImg.svg";
import MobileHeader from "mobile/containers/common/MobileHeader";
import MobileHomePage from "mobile/pages/MobileHomePage";
import MobileTipsPage from "mobile/pages/MobileTipsPage";
import MobileSavePage from "mobile/pages/MobileSavePage";
import MobileWritePage from "mobile/pages/MobileWritePage";
import MobileLoginPage from "mobile/pages/MobileLoginPage";
import MobilePostDetailPage from "mobile/pages/MobilePostDetailPage";
import MobileCouncilNoticeDetailPage from "mobile/pages/MobileCouncilNoticeDetailPage";
import MobilePetitionDetailPage from "mobile/pages/MobilePetitionDetailPage";
import MobileCampusPage from "mobile/pages/MobileCampusPage.tsx";
import MobileCouncilPage from "mobile/pages/MobileCouncilPage";
import MobileUtilPage from "mobile/pages/MobileUtilPage";
import MobileMyPage from "mobile/pages/MobileMyPage";
import MobileProfilePage from "mobile/pages/MobileProfilePage";
import MobileMenuPage from "mobile/pages/MobileMenuPage";
import MobileMyPagePost from "mobile/pages/MobileMyPagePost";
import MobileMyPageComment from "mobile/pages/MobileMyPageComment";
import MobileMyPageLike from "mobile/pages/MobileMyPageLike";
import MobileDeletePage from "mobile/pages/MobileDelete";
import MobileCalendarPage from "mobile/pages/MobileCalendarPage";
import useAppStateStore from "stores/useAppStateStore";
import MobileRentalPage from "mobile/pages/MobileRentalPage";
import MobileClubPage from "./MobileClubPage";

const Page = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
`;

export default function AppRoutePage() {
    const {setIsAppUrl} = useAppStateStore();

    useEffect(() => {
        setIsAppUrl("/app"); // MobileRootPage에 진입하면 isAppUrl 상태 설정
    }, [setIsAppUrl]);

    const location = useLocation();

    const isLoginPage = location.pathname === "/app/login";
    const isPostDetailPage =
        location.pathname.includes("/app/postdetail") ||
        location.pathname.includes("/app/councilnoticedetail");

    return (
        <MobileRootPageWrapper>
            <UpperBackground src={UpperBackgroundImg}/>
            {!isLoginPage && !isPostDetailPage && <MobileHeader/>}
            <main>
                <Page>
                    <Routes>
                        <Route path="/home" element={<MobileHomePage/>}/>
                        <Route path="/home/tips" element={<MobileTipsPage/>}/>
                        <Route path="/home/menu" element={<MobileMenuPage/>}/>
                        <Route path="/home/calendar" element={<MobileCalendarPage/>}/>
                        <Route path="/home/map" element={<MobileCampusPage/>}/>
                        <Route path="/home/util" element={<MobileUtilPage/>}/>
                        <Route path="/postdetail" element={<MobilePostDetailPage/>}/>
                        <Route
                            path="/councilnoticedetail"
                            element={<MobileCouncilNoticeDetailPage/>}
                        />
                        <Route
                            path="/petitiondetail"
                            element={<MobilePetitionDetailPage/>}
                        />
                        <Route path="/home/council" element={<MobileCouncilPage/>}/>
                        <Route path="/home/club" element={<MobileClubPage/>}/>
                        <Route path="/rental" element={<MobileRentalPage/>}/>
                        <Route path="/write" element={<MobileWritePage/>}/>
                        <Route path="/save" element={<MobileSavePage/>}/>
                        <Route path="/mypage" element={<MobileMyPage/>}/>
                        <Route path="/mypage/profile" element={<MobileProfilePage/>}/>
                        <Route path="/mypage/post" element={<MobileMyPagePost/>}/>
                        <Route path="/mypage/like" element={<MobileMyPageLike/>}/>
                        <Route path="/mypage/comment" element={<MobileMyPageComment/>}/>
                        <Route path="/mypage/delete" element={<MobileDeletePage/>}/>
                        <Route path="/login" element={<MobileLoginPage/>}/>
                    </Routes>
                </Page>
            </main>
        </MobileRootPageWrapper>
    );
}

const MobileRootPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  // padding-bottom: 72px; // Nav
  overflow-y: auto;
`;

const UpperBackground = styled.img`
  position: absolute;
  z-index: -1;
  width: 100%;
`;
