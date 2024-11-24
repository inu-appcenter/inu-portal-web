import styled from "styled-components";
import NavItem from "mobile/components/common/NavItem";
import homeIcon from "resources/assets/mobile-common/home-gray.svg";
import homeIconActive from "resources/assets/mobile-common/home-blue.svg";
import saveIcon from "resources/assets/mobile-common/save-gray.svg";
import saveIconActive from "resources/assets/mobile-common/save-blue.svg";
import writeIcon from "resources/assets/mobile-common/write-gray.svg";
import writeIconActive from "resources/assets/mobile-common/write-blue.svg";
import mypageIcon from "resources/assets/mobile-common/mypage-gray.svg";
import mypageIconActive from "resources/assets/mobile-common/mypage-blue.svg";

interface MobileNavProps {
  previousPages: Record<string, string>;
}

export default function MobileNav({ previousPages }: MobileNavProps) {
  return (
    <MobileNavWrapper>
      <NavItem
        to={previousPages.home}
        icon={homeIcon}
        activeIcon={homeIconActive}
        label="Home"
      />
      <NavItem
        to={previousPages.save}
        icon={saveIcon}
        activeIcon={saveIconActive}
        label="Save"
      />
      <NavItem
        to={previousPages.write}
        icon={writeIcon}
        activeIcon={writeIconActive}
        label="Write"
      />
      <NavItem
        to={previousPages.mypage}
        icon={mypageIcon}
        activeIcon={mypageIconActive}
        label="Mypage"
      />
    </MobileNavWrapper>
  );
}

const MobileNavWrapper = styled.nav`
  position: fixed;
  z-index: 1;
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
