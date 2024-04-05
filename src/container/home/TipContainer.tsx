//TipContainer.tsx
import SearchBar from '../../component/Tips/SearchBar';
import MainTip from '../../component/home/tiplist'; // Adjust the path accordingly
import TipTitle from '../../component/home/tiptitle';
import styled from 'styled-components';


export default function MainTips () {


  return (
    <TipWrapper>
      <TipSearchTotalWrapper>
        <TipTitle/>
        <SearchBar />
      </TipSearchTotalWrapper>
      <MainTip />
    </TipWrapper>
  );

}

const TipWrapper = styled.div`
    padding-left: 10px;
    box-sizing: border-box;
    width: 50%;
`

const TipSearchTotalWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`