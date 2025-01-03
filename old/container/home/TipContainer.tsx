//TipContainer.tsx
import SearchBar from "../../component/tips/SearchBar";
import MainTip from "../../component/home/TipList";
import TipTitle from "../../component/home/TipTitle";
import styled from "styled-components";

export default function MainTips() {
  return (
    <TipWrapper>
      <TipSearchTotalWrapper>
        <TipTitle />
        <SearchBar />
      </TipSearchTotalWrapper>
      <MainTip />
    </TipWrapper>
  );
}

const TipWrapper = styled.div`
  padding-left: 10px;
  box-sizing: border-box;
  width: 36%;
  @media (max-width: 768px) {
    // 모바일
    width: 100%;
  }
`;

const TipSearchTotalWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;
