import styled from "styled-components";
import NavItem from "@/components/mobile/common/NavItem";
import homeIcon from "@/resources/assets/mobile-common/home-gray.svg";
import homeIconActive from "@/resources/assets/mobile-common/home-blue.svg";
import busIcon from "@/resources/assets/mobile-common/bus-gray.svg";
import busIconActive from "@/resources/assets/mobile-common/bus-blue.svg";
import saveIcon from "@/resources/assets/mobile-common/save-gray.svg";
import saveIconActive from "@/resources/assets/mobile-common/save-blue.svg";
import mypageIcon from "@/resources/assets/mobile-common/mypage-gray.svg";
import mypageIconActive from "@/resources/assets/mobile-common/mypage-blue.svg";
import useAppStateStore from "@/stores/useAppStateStore";

export default function MobileNav() {
  const { isAppUrl } = useAppStateStore();

  return (
    <MobileNavWrapper>
      <NavItem
        to={`${isAppUrl}/home`}
        icon={homeIcon}
        activeIcon={homeIconActive}
        label="홈"
      />
      <NavItem
        to={`${isAppUrl}/bus`}
        icon={busIcon}
        activeIcon={busIconActive}
        label="인입런"
      />
      <NavItem
        to={`${isAppUrl}/save`}
        icon={saveIcon}
        activeIcon={saveIconActive}
        label="스크랩"
      />
      <NavItem
        to={`${isAppUrl}/mypage`}
        icon={mypageIcon}
        activeIcon={mypageIconActive}
        label="마이페이지"
      />
    </MobileNavWrapper>
  );
}

const MobileNavWrapper = styled.nav`
  position: fixed;
  z-index: 10;
  bottom: 0px;
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
