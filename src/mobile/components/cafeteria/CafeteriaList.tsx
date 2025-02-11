import styled from "styled-components";
import { cafeterias } from "resources/strings/cafeterias";
import { useState } from "react";
import arrowImg from "resources/assets/mobile-cafeteria/Vector.svg";

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

  return (
    <ToggleWrapper>
      <div className="title" onClick={handleToggle}>
        <h1>{title}</h1>
        <img src={arrowImg} alt="화살표 이미지" />
      </div>
      {isOpen && (
        <>
          <Backdrop onClick={handleToggle} />
          <div className="list">
            {cafeterias.map((item, index) => (
              <div
                key={index}
                className="list-item"
                onClick={() => handleItemClick(item.title)}
              >
                {item.title}
              </div>
            ))}
          </div>
        </>
      )}
    </ToggleWrapper>
  );
}

const ToggleWrapper = styled.div`
  .title {
    display: flex;
    cursor: pointer;
    gap: 20px;
    padding: 10px 0;
    h1 {
      font-size: 30px;
      font-weight: 700;
      line-height: 20px;
      color: #404040;
    }
  }

  .list {
    position: fixed;
    z-index: 1001;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    background-color: white;
    display: flex;
    flex-direction: column;
  }

  .list-item {
    padding-left: 32px;
    font-size: 14px;
    font-weight: 700;
    line-height: 16.94px;
    text-align: left;
    color: #9f9f9f;
    padding: 8px;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  backdrop-filter: blur(0.5px); /* Blur effect */
  z-index: 1000; /* Ensure backdrop is behind the modal but above the rest of the content */
`;
