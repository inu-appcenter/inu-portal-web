import  { useState } from 'react';
import TipDropDown from '../../component/home/tipdropdown'; // Adjust the path accordingly
import TipSearch from "../../component/home/tipsearch" // Adjust the path accordingly
import MainTip from '../../component/home/tiplist'; // Adjust the path accordingly
import TipTitle from '../../component/home/tiptitle';
import { useNavigate } from 'react-router-dom';

export default function MainTips () {
  const [searchType, setSearchType] = useState('제목+내용');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    console.log(searchInput);
  };

  const handleSearch = (input: string) => {
    setSearchInput(input);
    alert(`검색: ${input} (검색 타입: ${searchType})`);
  };
  const handleClickPost =()=> {
    navigate('/write');
  }
  return (
    <div>
      <TipTitle/>
      <TipDropDown onSearchTypeChange={handleSearchTypeChange} />
      <TipSearch onSearch={handleSearch} />
      <MainTip />
      <button onClick={handleClickPost}>글쓰기</button>
    </div>
  );

}

