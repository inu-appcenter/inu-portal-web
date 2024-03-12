//TipContainer.tsx
import SearchBar from '../../component/Tips/SearachBar';
import MainTip from '../../component/home/tiplist'; // Adjust the path accordingly
import TipTitle from '../../component/home/tiptitle';
import TipPostBtn from '../../component/home/tippostbtn';
import styled from 'styled-components';


export default function MainTips () {


  return (
    <TipWrapper>
      <TipSearchTotalrapper>
        <TipTitle/>
        <SearchBar />
      </TipSearchTotalrapper>
      <MainTip />
      <TipPostBtn/>
    </TipWrapper>
  );

}

const TipWrapper = styled.div`
    padding-left: 10px;
    box-sizing: border-box;
    width: 50%;
`

const TipSearchTotalrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`


const TipSearchWrapper = styled.div`
  display: flex;
`