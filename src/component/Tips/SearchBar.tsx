import { useState } from "react";
import styled from "styled-components";
import searchImg from "../../resource/assets/search.svg";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch(searchInput);
    }
  };

  const onSearch = (query: string) => {
    if (query.length < 2) {
      alert("두 글자 이상 입력해주세요.");
      return;
    }
    navigate(`/tips/search?query=${query}`);
  };

  return (
    <SearchBarWrapper>
      <SearchInput
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="     Quick search ..."
      />
      <SearchIcon
        src={searchImg}
        alt="search image"
        onClick={() => onSearch(searchInput)}
      />
    </SearchBarWrapper>
  );
}

// Styled Components
const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 332px;
  height: 36px;
  background-color: #eff2f9;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 18px;

  @media (max-width: 768px) {
    padding-left: 0px;
    width: 90%;
  }
`;

const SearchInput = styled.input`
  flex-grow: 1;
  font-size: 15px;
  font-weight: 500;
  height: 28px;
  border: 0;
  background-color: transparent;
`;

const SearchIcon = styled.img`
  cursor: pointer;
`;
