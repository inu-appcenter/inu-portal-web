import React, { useState } from 'react';
import styled from 'styled-components';
import searchImg from '../../resource/assets/search.svg';

interface TipSearchProps {
  onSearch: (input: string) => void;
}
export default function TipSearch({ onSearch }: TipSearchProps)  {
  const [searchInput, setSearchInput] = useState('');

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchInput);
    }
  };

  return (
    <TipSearchWrapper>
      <TipSearchContent>
        <TipSearchInput
          type="text"
          id="searchInput"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <TipSearchImg src={searchImg} alt="search image" onClick={() => onSearch(searchInput)} />
      </TipSearchContent>
    </TipSearchWrapper>
  );
}

const TipSearchWrapper = styled.div`
  width: 245px;
  height: 30px;
  margin-left:10px;
`;

const TipSearchContent = styled.div`
  border:none;
  border-bottom: 1px solid black;
  height: 29px;
  box-sizing: border-box;
  display:flex;
  justify-content: space-between;
  align-items: center;
`;


const TipSearchInput = styled.input`
  border: none;
`;

const TipSearchImg = styled.img`
  width:16px;
  height:16px;
  margin-right: 16px;
`;
