import styled from 'styled-components';
import menuButtonImage from '../../../resource/assets/mobile/common/menu-button.svg'
import { useState } from 'react';
import { navBarList as originalNavBarList } from '../../../resource/string/navbar';

export default function MenuButton() {
  const [isVisible, setIsVisible]= useState(false);

  const handleSubItemClick = (url: string) => {
    window.open(url, '_blank');
  };

  const College = originalNavBarList.find(item => item.title === '학과 홈페이지');
  return (
    <>
      <MenuButtonImg src={menuButtonImage} alt="MenuButtonImg" onClick={() => setIsVisible(!isVisible)} />
      {isVisible && College&& College.child &&(
        <Sidebar>
          <CloseButton onClick={() => setIsVisible(false)}>×</CloseButton>
          <NavList>
            {College.child.map((childItem, childIndex) => (
              <NavSubSection key={childIndex}>
                {childItem.url ? (
                  <NavItem onClick={() => handleSubItemClick(childItem.url)}>
                    {childItem.title}
                  </NavItem>
                ) : (
                  <>
                    <NavSubTitle>{childItem.title}</NavSubTitle>
                    {childItem.subItems && childItem.subItems.map((subItem, subIndex) => (
                      <NavItem key={subIndex} onClick={() => handleSubItemClick(subItem.url)}>
                        {subItem.title}
                      </NavItem>
                    ))}
                  </>
                )}
              </NavSubSection>
            ))}
          </NavList>
        </Sidebar>
      )}
    </>
  );
}

const MenuButtonImg = styled.img`
  padding-top: 2px;
  height: 16px;
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  border-radius: 20px 0 0 20px;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 24px;
  color: #888888;
  cursor: pointer;
`;

const NavList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 20px 0 0 0;
`;

const NavSection = styled.li`
  margin-bottom: 15px;
`;

const NavTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
`;

const NavSubSection = styled.div`
  margin-left: 10px;
  margin-bottom: 10px;
  padding-bottom:5px;
`;

const NavSubTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #888888;

`;

const NavItem = styled.div`
  margin-left: 10px;
  color: #888888;

  cursor: pointer;
  &:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  width: fit-content;
  padding: 0 3px 0 3px;
  color: #000;


  }
`;