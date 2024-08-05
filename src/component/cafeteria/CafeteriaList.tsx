import styled from "styled-components";
import { cafeteriasList } from "../../resource/string/cafeterias";
import { useState } from "react";
import arrowImg from "../../resource/assets/mobile/cafeteria/Vector.svg";

interface CafeteriaTitleContainerProps {
    title:string;
    setTitle:(title:string) => void;
}

export default function CafeteriaToggle({title,setTitle}:CafeteriaTitleContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (title:string) => {
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
      )}
    </ToggleWrapper>
  );
}

const ToggleWrapper = styled.div`
    position: relative;
    margin-bottom: 10px;
  .title {
    display: flex;
    cursor: pointer;
    gap: 10px;

    h1 {
      font-family: Inter, sans-serif;
      font-size: 30px;
      font-weight: 700;
      line-height: 20px;
    }
  }

  .list {
    position: absolute;
    top:60px;
    left: 27px;
    display: inline-block;
    border: 1px solid #DADADA;
    border-radius: 26px;
    padding:16px 30px;
    background-color: white;
  }


  .list-item {
    font-family: Inter;
font-size: 14px;
font-weight: 700;
line-height: 16.94px;
text-align: left;
color:#9F9F9F;
margin-bottom: 7px;
  }
`;
