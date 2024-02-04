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
  );
}

const TipSearchContent = styled.div``;

const TipSearchInput = styled.input``;

const TipSearchImg = styled.img``;
