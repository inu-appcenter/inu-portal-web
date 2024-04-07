import { useState } from "react";
import searchImg from '../../../Resource/assets/search-img.png';
import { useNavigate } from "react-router-dom";
import styled from "styled-components";


export default function SearchFolderScrapBar() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchInput);
    }
  };

  const onSearch = (query: string) => {
    if (query.length < 2) {
      alert('두 글자 이상 입력해주세요.');
      return;
    }
    navigate(`/mypage/searchfolder?query=${query}`);
  };

  return (
    <SerachBar>
      <img src={searchImg} alt='search image' onClick={() => onSearch(searchInput)} />
       <SearchInput
        type='text'
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder='     search by title, keyword ' 
      />
      
    </SerachBar>
  )
}

const SerachBar = styled.div`
display: flex;
align-items: center;
gap: 5px;
width: 332px;
height: 36px;
background-color: #EFF2F9;
padding-left: 10px;
padding-right: 10px;
border-radius: 18px;
`;

const SearchInput = styled.input`
flex-grow: 1;
    font-size: 15px;
    font-weight: 500;
  
    height: 28px;
    border: 0;
    background-color: transparent;
    ::placeholder {
    color: #BEBEBE; /* 원하는 색상으로 변경 */
  }
    `