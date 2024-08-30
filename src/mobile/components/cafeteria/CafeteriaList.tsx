import styled from "styled-components";
import { cafeteriasList } from "../../../resource/string/cafeterias";
import { useState } from "react";
import arrowImg from "../../../resource/assets/mobile/cafeteria/Vector.svg";

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
            {cafeteriasList.map((item, index) => (
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
  margin-bottom: 10px;
  .title {
    display: flex;
    cursor: pointer;
    gap: 20px;
    padding: 10px 0;
    h1 {
      font-family: Inter, sans-serif;
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
    width: 100vw;
    padding: 16px 0 16px 0;
    background-color: white;
    margin-top: 20px;
  }

  .list-item {
    padding-left: 30px;
    font-family: Inter;
    font-size: 14px;
    font-weight: 700;
    line-height: 16.94px;
    text-align: left;
    color: #9f9f9f;
    margin-bottom: 15px;
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
