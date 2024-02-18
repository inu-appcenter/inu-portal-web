import  { useState } from 'react';
import TipDropDown from '../../component/home/tipdropdown'; // Adjust the path accordingly
import TipSearch from "../../component/home/tipsearch" // Adjust the path accordingly
import MainTip from '../../component/home/tiplist'; // Adjust the path accordingly
import TipTitle from '../../component/home/tiptitle';
import styled from 'styled-components';
import TipPostBtn from '../../component/home/tippostbtn';

export default function MainTips () {
  const [searchType, setSearchType] = useState('제목+내용');
  const [searchInput, setSearchInput] = useState('');
  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    console.log(searchInput);
  };

  const handleSearch = (input: string) => {
    setSearchInput(input);
    alert(`검색: ${input} (검색 타입: ${searchType})`);
  };

  return (
    <TipWrapper>
      <TipSearchTotalrapper>
        <TipTitle/>
        <TipSearchWrapper>
          <TipDropDown onSearchTypeChange={handleSearchTypeChange} />
          <TipSearch onSearch={handleSearch} />
        </TipSearchWrapper>
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
