import styled from "styled-components";
import { cafeterias } from "@/resources/strings/cafeterias";
import { useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";

import arrowImg from "@/resources/assets/mobile-cafeteria/Vector.svg";

interface CafeteriaTitleContainerProps {
  title: string;
  setTitle: (title: string) => void;
}

export default function CafeteriaToggle({
  title,
  setTitle,
}: CafeteriaTitleContainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (title: string) => {
    setTitle(title);
    setIsOpen(false); // Optionally close the list after selecting an item
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <ToggleWrapper>
      <div className="title" onClick={handleToggle}>
        <div>{title}</div>
        <img src={arrowImg} alt="화살표 이미지" />
      </div>
      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        snapPoints={() => {
          // 임의의 값으로 스냅 포인트 설정
          const snapPoint1 = 400; // 최소 스냅 포인트

          return [snapPoint1]; // 임의의 값을 배열로 반환
        }}
      >
        {/*<Backdrop onClick={handleToggle} />*/}
        <List>
          {cafeterias.map((item: any, index: number) => (
            <ListItem key={index} onClick={() => handleItemClick(item.title)}>
              {item.title}
            </ListItem>
          ))}
        </List>
      </BottomSheet>
    </ToggleWrapper>
  );
}

const ToggleWrapper = styled.div`
  padding: 0 32px;
  height: fit-content;
  cursor: pointer;

  .title {
    display: flex;
    flex-direction: row;
    gap: 12px;
    font-size: 30px;
    font-weight: 500;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding-bottom: 80px;
`;

const ListItem = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;

  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
  }
`;

// const Backdrop = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
//   backdrop-filter: blur(0.5px); /* Blur effect */
//   z-index: 1000; /* Ensure backdrop is behind the modal but above the rest of the content */
// `;
