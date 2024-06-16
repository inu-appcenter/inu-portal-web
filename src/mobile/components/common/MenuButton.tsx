import styled from 'styled-components';
import menuButtonImage from '../../../resource/assets/mobile/common/menu-button.svg'

export default function MenuButton() {
  return (
    <>
      <MenuButtonImg src={menuButtonImage} alt="MenuButtonImg" />
    </>
  );
}

const MenuButtonImg = styled.img`
  padding-top: 2px;
  height: 16px;
`