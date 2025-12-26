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

  width: 42px;
  height: 42px;

  /* 배경 및 스타일 전이 */
  border-radius: 999px;
  transition: all 0.2s ease-in-out;

  /* 스크롤 상태 조건부 스타일 */
  background: ${({ $isScrolled }) =>
    $isScrolled ? "rgba(255, 255, 255, 0.7)" : "transparent"};

  box-shadow: ${({ $isScrolled }) =>
    $isScrolled
      ? "0 2px 4px 0 rgba(0, 0, 0, 0.2)"
      : "0 2px 4px 0 rgba(0, 0, 0, 0)"};

  -webkit-backdrop-filter: blur(
    ${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")}
  );
  backdrop-filter: blur(${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")});
`;
