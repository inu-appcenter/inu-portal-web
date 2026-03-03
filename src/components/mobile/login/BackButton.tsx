import styled from "styled-components";
import backIcon from "@/resources/assets/mobile-common/backbtn.svg";
import { useNavigate } from "react-router-dom";
import { ButtonHTMLAttributes } from "react";

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  $isScrolled?: boolean; // 스크롤 상태 프롭
}

export default function BackButton({
  onClick,
  $isScrolled,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      $isScrolled={$isScrolled}
      onClick={
        onClick
          ? onClick
          : () => {
              navigate(-1);
            }
      }
      {...props}
    >
      <img src={backIcon} alt="backIcon" />
    </Button>
  );
}

const Button = styled.button<{ $isScrolled?: boolean }>`
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 999px;
  transition: all 0.2s ease-in-out;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;
