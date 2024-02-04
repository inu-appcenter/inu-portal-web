import  { useState } from 'react';
import styled from 'styled-components';
import arrowImg from '../../resource/assets/arrow.svg';
import { tipSearchList } from '../../resource/string/tipsearch';

interface TipDropDownProps {
  onSearchTypeChange: (type: string) => void;
}

export default function TipDropDown({ onSearchTypeChange }: TipDropDownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchType, setSearchType] = useState('제목+내용');

  const handleSearchTypeClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionClick = (type: string) => {
    setSearchType(type);
    setShowDropdown(false);
    onSearchTypeChange(type); // Notify parent component about the change
  };

  return (
    <>
      <TipDropDownWrapper onClick={handleSearchTypeClick}>
        <TipDropDownBox>{searchType}</TipDropDownBox>
        <Img src={arrowImg} alt="arrow image" />
        {showDropdown && (
          <div className="dropdown-menu">
            {tipSearchList.map((type) => (
              <div key={type.id} onClick={() => handleOptionClick(type.title)}>
                {type.title}
              </div>
            ))}
          </div>
        )}
      </TipDropDownWrapper>
    </>
  );
}

const TipDropDownWrapper = styled.div``;

const TipDropDownBox = styled.div``;

const Img = styled.img``;
