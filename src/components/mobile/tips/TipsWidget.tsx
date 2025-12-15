import styled from "styled-components";
import 장학금 from "@/resources/assets/tips/장학금.svg";
import 도서관 from "@/resources/assets/tips/도서관.svg";
import 수강신청 from "@/resources/assets/tips/수강신청.svg";
import 기숙사 from "@/resources/assets/tips/기숙사.svg";
import CapsuleButton from "@/components/mobile/common/CapsuleButton";

const TipsWidget = () => {
  return (
    <TipsWidgetWrapper>
      <CapsuleButton
        title={"장학금"}
        description={"국가 장학금, 성적 장학금"}
        iconSrc={장학금}
      />
      <CapsuleButton
        title={"도서관"}
        description={"이용 방법, 출입 등록"}
        iconSrc={도서관}
      />
      <CapsuleButton
        title={"장학금"}
        description={"장바구니, 시간표 짜기"}
        iconSrc={수강신청}
      />
      <CapsuleButton
        title={"장학금"}
        description={"입퇴사, 유니돔"}
        iconSrc={기숙사}
      />
    </TipsWidgetWrapper>
  );
};
export default TipsWidget;

const TipsWidgetWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  align-self: stretch;
  flex-wrap: wrap;
`;
