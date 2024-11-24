import { useState } from "react";
import styled from "styled-components";
import searchImg from "resources/assets/mobile-home/input.svg";
import { useNavigate } from "react-router-dom";

export default function SerachForm() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim().length < 2) {
      alert("검색어는 두 글자 이상이어야 합니다.");
      return;
    }
    navigate(`/m/home/tips?search=${query}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <SearchFormWrapper>
      <div>
        <input
          type="text"
          placeholder="검색어를 입력하세요."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <img src={searchImg} alt="" onClick={handleSearch} />
      </div>
    </SearchFormWrapper>
  );
}

const SearchFormWrapper = styled.div`
  width: 100%;
  div {
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 8px 0px #0000001a;
    width: 100%;
    background-color: white;
    display: flex;
    justify-content: space-between;
    padding: 8px 17px;
    input {
      border: none;
      font-size: 14px;
      color: #888888;
      font-weight: 500;
      flex-grow: 1;
    }
  }
`;
