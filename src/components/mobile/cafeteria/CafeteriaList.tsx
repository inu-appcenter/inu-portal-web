import styled from "styled-components";
import { useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";

import { DESKTOP_MEDIA } from "@/styles/responsive";
import { cafeterias } from "@/resources/strings/cafeterias";
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

  const handleItemClick = (nextTitle: string) => {
    setTitle(nextTitle);
    setIsOpen(false);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <ToggleWrapper>
      <div className="mobile-title" onClick={handleToggle}>
        <div>{title}</div>
        <img src={arrowImg} alt="open cafeteria list" />
      </div>

      <div className="desktop-header">
        <p className="eyebrow">Cafeteria</p>
        <div className="selected-title">{title}</div>
      </div>

      <div className="desktop-selector">
        {cafeterias.map((item, index) => (
          <button
            key={index}
            type="button"
            className={`desktop-item ${item.title === title ? "selected" : ""}`}
            onClick={() => handleItemClick(item.title)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        snapPoints={() => {
          const snapPoint = 400;
          return [snapPoint];
        }}
      >
        <List>
          {cafeterias.map((item, index) => (
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

  .mobile-title {
    display: flex;
    flex-direction: row;
    gap: 12px;
    font-size: 30px;
    font-weight: 500;
  }

  .desktop-header,
  .desktop-selector {
    display: none;
  }

  @media ${DESKTOP_MEDIA} {
    padding: 0;
    cursor: default;

    .mobile-title {
      display: none;
    }

    .desktop-header {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .eyebrow {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6b86b6;
    }

    .selected-title {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
      color: #1a2540;
    }

    .desktop-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 2px;
    }

    .desktop-item {
      border: 1px solid #d9e4f5;
      border-radius: 999px;
      background: #fff;
      color: #4f648f;
      padding: 11px 16px;
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
    }

    .desktop-item:hover {
      transform: translateY(-1px);
      border-color: #b8caea;
      box-shadow: 0 6px 16px rgba(64, 113, 185, 0.12);
    }

    .desktop-item.selected {
      color: #fff;
      border-color: transparent;
      background: linear-gradient(90deg, #6ea9d8 0%, #5d87d7 100%);
      box-shadow: 0 10px 20px rgba(93, 135, 215, 0.24);
    }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  padding-bottom: 80px;
  background-color: #f9f9f9;
  border-radius: 12px;
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
