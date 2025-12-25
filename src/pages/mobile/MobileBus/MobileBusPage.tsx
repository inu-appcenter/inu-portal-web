import styled from "styled-components";
import BusCardSection from "@/components/mobile/bus/goHomeSchool/BusCardSection.tsx";

export default function MobileBusPage() {
  return (
    <MobileBusPageWrapper>
      <BusCardSection />
    </MobileBusPageWrapper>
  );
}

// MobileBusPage.tsx 내부 스타일 수정

const MobileBusPageWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
  width: 100%;

  /* 상위 ContentWrapper의 중앙 정렬을 따르기 위해 flex 설정 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
