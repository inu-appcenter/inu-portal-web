import styled from "styled-components";
import backIcon from "@/resources/assets/mobile-common/backbtn.svg";
import { useNavigate } from "react-router-dom";

export default function BackButton({ onClick }: { onClick?: () => void }) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={
        onClick
          ? onClick
          : () => {
              navigate(-1);
            }
      }
    >
      <img src={backIcon} alt="backIcon" />
    </Button>
  );
}

const Button = styled.button`
  height: fit-content;
  background: transparent;
  border: none;
`;
