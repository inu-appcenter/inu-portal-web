import { useState } from 'react';
import styled from 'styled-components';
import arrowImg from '../../resource/assets/arrow.svg';
import { SortList } from '../../resource/string/sort';

interface SortDropDownProps {
  onSearchTypeChange: (type: string) => void;
}

export default function SortDropDown({ onSearchTypeChange }: SortDropDownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchType, setSearchType] = useState('date');

  const handleSearchTypeClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionClick = (type: string) => {
    setSearchType(type);
    setShowDropdown(false);
    onSearchTypeChange(type); 
  };

  return (
    <>
      <TipDropDownWrapper onClick={handleSearchTypeClick}>
        <TipDropDownBox>{searchType}</TipDropDownBox>
        <Img src={arrowImg} alt="arrow image" />
        {showDropdown && (
          <TipDropDowns className="dropdown-menu">
            {SortList.map((type) => (
              <TipDropDownDetail key={type.id} onClick={() => handleOptionClick(type.sort)}>
                {type.sort}
              </TipDropDownDetail>
            ))}
          </TipDropDowns>
        )}
      </TipDropDownWrapper>
    </>
  );
}

const TipDropDownWrapper = styled.div`
  width: 81px;
  height: 30px;
  display: flex;
  padding: 10px;
  box-sizing: border-box;
  justify-content: space-between;
  position: relative;
  background: #F3F3F3;
`;

const TipDropDownBox = styled.div`
  font-size: 10px;
  font-weight: 800;
  line-height: 12px;
  letter-spacing: 0em;
  text-align: left;
`;

const Img = styled.img`
  width: 6px;
  height: 11px;
`;

const TipDropDowns = styled.div`
  z-index: 2000;
  position: absolute;
  left: 0;
  right: 0;
  top: 30px;
  background-color: black;
  border-radius: 10px;
  color: white;
`;

const TipDropDownDetail = styled.div`
  width: 81px;
  height: 30px;
  font-size: 10px;
  font-weight: 800;
  line-height: 12px;
  letter-spacing: 0em;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
`;
