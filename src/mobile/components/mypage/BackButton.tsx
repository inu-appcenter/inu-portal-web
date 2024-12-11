import styled from "styled-components";
import backBtnImg from "resources/assets/mobile-mypage/oui_arrow-up.svg";
import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function BackButton() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();
  return (
    <>
      <Img
        src={backBtnImg}
        alt="뒤로가기 이미지"
        onClick={() => navigate(`${isAppUrl}/mypage`)}
      />
    </>
  );
}

const Img = styled.img`
  width: 18px;
  height: 18px;
`;
