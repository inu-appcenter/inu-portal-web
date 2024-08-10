import styled from 'styled-components';
import menuButtonImage from '../../../resource/assets/mobile/common/menu-button.svg'
import { useEffect, useRef, useState } from 'react';
import { navBarList as originalNavBarList } from '../../../resource/string/navbar';

export default function MenuButton() {
  const [isVisible, setIsVisible]= useState(false);

  const handleSubItemClick = (url: string) => {
    window.open(url, '_blank');
  };
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const College = originalNavBarList.find(item => item.title === '학과 홈페이지');
  return (
    <>
      <MenuButtonImg src={menuButtonImage} alt="MenuButtonImg" onClick={() => setIsVisible(!isVisible)} />
      {isVisible && College&& College.child &&(
        <Sidebar ref={wrapperRef}>
          <CloseButton onClick={() => setIsVisible(false)}>×</CloseButton>
          <NavList>
            {College.child.map((childItem, childIndex) => (
              <NavSubSection className={childItem.title} key={childIndex}>
                {childItem.title === "법학부" ? (
                  <NavSubTitle>{childItem.title}</NavSubTitle>
                ) : childItem.url ? (
                  <NavItem onClick={() => handleSubItemClick(childItem.url)}>
                    {childItem.title}
                  </NavItem>
                ) : (
                  <>
                    <NavSubTitle>{childItem.title}</NavSubTitle>
                    {childItem.subItems &&
                      childItem.subItems.map((subItem, subIndex) => (
                        <NavItem
                          key={subIndex}
                          onClick={() => handleSubItemClick(subItem.url)}
                        >
                          {subItem.title}
                        </NavItem>
                      ))}
                  </>
                )}
                <br />
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
  bottom:0;
  left: 0;
  height: 70%;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

`;

const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 24px;
  color: #888888;
  cursor: pointer;
  margin: 10px;
`;

const NavList = styled.ul`
 display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 20px 0 0 0;
  margin: 0 10px;
`;

const NavSubSection = styled.div`
  flex: 1 1 100px; 
  margin-left: 10px;
  margin-bottom: 10px;
   box-sizing: border-box;
    min-width: 100px;
`;

const NavSubTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color:#0E4D9D;
;

`;

const NavItem = styled.div`
  color: #888888;
  font-size: 15px;
  cursor: pointer;
  &:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  width: fit-content;
  padding: 0 3px 0 3px;
  color: #000;


  }
`;