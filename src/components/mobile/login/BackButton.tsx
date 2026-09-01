import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { useNavigate } from "react-router-dom";
import { ButtonHTMLAttributes } from "react";
import Ripple from "@/components/common/Ripple";

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
      <Ripple />
      <Icon name="chevron-left" size={20} label="뒤로 가기" />
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
  position: relative;
  overflow: hidden;
  outline: none;
  transition: all 0.2s ease-in-out;

  color: black;
`;
