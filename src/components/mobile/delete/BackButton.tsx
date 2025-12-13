import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backBtnImg from "@/resources/assets/mobile-mypage/oui_arrow-up.svg";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <>
      <Img
        src={backBtnImg}
        alt="뒤로가기 이미지"
        onClick={() => navigate(-1)}
      />
    </>
  );
}

const Img = styled.img`
  margin-top: 10px;
  margin-left: 35px;
  width: 18px;
  height: 18px;
`;
