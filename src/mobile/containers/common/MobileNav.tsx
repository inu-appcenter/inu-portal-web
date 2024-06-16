import styled from 'styled-components';
import NavItem from '../../components/common/NavItem';

import homeIcon from '../../../resource/assets/mobile/common/home-gray.svg';
import homeIconActive from '../../../resource/assets/mobile/common/home-blue.svg';
import saveIcon from '../../../resource/assets/mobile/common/save-gray.svg';
import saveIconActive from '../../../resource/assets/mobile/common/save-gray.svg';  // blue 아직
import writeIcon from '../../../resource/assets/mobile/common/write-gray.svg';
import writeIconActive from '../../../resource/assets/mobile/common/write-blue.svg';
import mypageIcon from '../../../resource/assets/mobile/common/mypage-gray.svg';
import mypageIconActive from '../../../resource/assets/mobile/common/mypage-gray.svg'; // blue 아직

export default function MobileNav() {
  return (
    <MobileNavWrapper>
      <NavItem to="/m" icon={homeIcon} activeIcon={homeIconActive} label="Home" />
      <NavItem to="/m/save" icon={saveIcon} activeIcon={saveIconActive} label="Save" />
      <NavItem to="/m/write" icon={writeIcon} activeIcon={writeIconActive} label="Write" />
      <NavItem to="/m/mypage" icon={mypageIcon} activeIcon={mypageIconActive} label="Mypage" />
    </MobileNavWrapper>
  );
}

const MobileNavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  border-radius: 20px 20px 0px 0px;
  box-shadow: 0px -3px 6px 0px #3030301A;
`;
