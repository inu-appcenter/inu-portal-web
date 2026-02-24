// 공지 부분 컴포넌트
import { useState } from "react";
import styled from "styled-components";

import OpenBtn from "@/resources/assets/rental/OpenBtn.svg";
import CloseBtn from "@/resources/assets/rental/CloseBtn.svg";

const NoticeBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <NoticeBoxWrapper>
      <TitleWrapper onClick={handleClick}>
        <Title>※ 물품 대여 방법 꼭 ! 확인하세요</Title>
        {!isOpen && <img src={OpenBtn} style={{ width: "15px" }} />}
        {isOpen && <img src={CloseBtn} style={{ width: "15px" }} />}
      </TitleWrapper>
      {isOpen && (
        <Content>
          총학생회에서 제공하는 물품 대여 서비스입니다.
          <br />
          ※ 대여 신청 가능한 물품의 개수는 적혀있는 것과 다를 수 있습니다.
          <br />
          ※ 물품 파손 시 보증금 반환 불가 및 손망실 금액이 발생할 수 있습니다.
          <br />
          ※ 총학 행사 기간에는 대여 불가능합니다.
          <br />
          ※ 당일 예약이 불가합니다.
          <br />
          ※ 대여 및 반납은 오늘 기준 3일 후부터 14일 이내, 오전 10시부터 오후
          5시 사이에 가능하며, 토요일 및 일요일에는 불가능합니다.
          <br />
          물품 수량 확인 날짜 2025.01.02
        </Content>
      )}
    </NoticeBoxWrapper>
  );
};

const NoticeBoxWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  margin-bottom: 50px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-bottom: #dfdfdf 1px solid;
`;

const Title = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 15px;
  color: #000000;
`;

const Content = styled.div`
  font-weight: 400;
  font-size: 13px;
  color: #656565;
  width: 100%;
`;

export default NoticeBox;
