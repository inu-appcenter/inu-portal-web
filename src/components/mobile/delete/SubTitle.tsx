import styled from "styled-components";
import deleteImg from "@/resources/assets/mobile-mypage/deleteImg.png";

export default function SubTitle() {
  return (
    <SubTitleWrapper>
      <h3>잠깐 ! 탈퇴하기 전 아래정보를 확인해주세요 !</h3>
      <img src={deleteImg} alt="탈퇴 이미지" />
    </SubTitleWrapper>
  );
}

const SubTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  h3 {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
  }
`;
