import styled from "styled-components";
import { ROUTES } from "@/constants/routes"; // ROUTES 상수 import
import NavItem from "@/components/mobile/common/NavItem";
import homeIcon from "@/resources/assets/mobile-common/home-gray.svg";
import homeIconActive from "@/resources/assets/mobile-common/home-blue.svg";
import busIcon from "@/resources/assets/mobile-common/bus-gray.svg";
import busIconActive from "@/resources/assets/mobile-common/bus-blue.svg";
import saveIcon from "@/resources/assets/mobile-common/save-gray.svg";
import saveIconActive from "@/resources/assets/mobile-common/save-blue.svg";
import mypageIcon from "@/resources/assets/mobile-common/mypage-gray.svg";
import mypageIconActive from "@/resources/assets/mobile-common/mypage-blue.svg";

export default function MobileNav() {
  return (
    <MobileNavWrapper>
      <NavItem
        to={ROUTES.HOME}
        icon={homeIcon}
        activeIcon={homeIconActive}
        label="홈"
      />
      <NavItem
        to={ROUTES.BUS.ROOT} // /bus -> ROUTES.BUS.ROOT
        icon={busIcon}
        activeIcon={busIconActive}
        label="인입런"
      />
      <NavItem
        to={ROUTES.SAVE}
        icon={saveIcon}
        activeIcon={saveIconActive}
        label="스크랩"
      />
      <NavItem
        to={ROUTES.MYPAGE.ROOT} // /mypage -> ROUTES.MYPAGE.ROOT
        icon={mypageIcon}
        activeIcon={mypageIconActive}
        label="마이페이지"
      />
    </MobileNavWrapper>
  );
}

const MobileNavWrapper = styled.nav`
  position: fixed;
  z-index: 2;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  padding-bottom: 8px;
  border-radius: 20px 20px 0px 0px;
  box-shadow: 0px -3px 6px 0px #3030301a;
`;
