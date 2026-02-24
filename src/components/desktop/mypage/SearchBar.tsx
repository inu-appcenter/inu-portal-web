import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import search from "@/resources/assets/posts/search.svg";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchInput(params.get("searchScrap") || "");
  }, [location.search]);

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
    const params = new URLSearchParams(location.search);
    params.set("searchScrap", query);
    navigate(`/mypage?${params.toString()}`);
  };

  const reset = () => {
    const params = new URLSearchParams(location.search);
    params.delete("searchScrap");
    navigate(`/mypage?${params.toString()}`);
  };

  return (
    <SearchBarWrapper>
      <img src={search} alt="" onClick={() => onSearch(searchInput)} />
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="search by title, keyword"
      />
      <button onClick={reset}>초기화</button>
    </SearchBarWrapper>
  );
}

const SearchBarWrapper = styled.div`
  margin-left: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 500px;
  height: 36px;
  background-color: white;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 12px;

  input {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    height: 100%;
    border: none;
    background-color: transparent;
  }

  button {
    background-color: #4071b9;
    color: white;
    border-radius: 8px;
    border: none;
    padding: 6px 12px;
  }
`;
