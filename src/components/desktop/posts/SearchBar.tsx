import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import search from "@/resources/assets/posts/search.svg";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchInput(params.get("search") || "");
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
    params.delete("category");
    params.delete("id");
    params.delete("page");
    params.set("search", query);
    navigate(`/posts?${params.toString()}`);
  };

  return (
    <SearchBarWrapper>
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Quick search ..."
      />
      <img src={search} alt="" onClick={() => onSearch(searchInput)} />
    </SearchBarWrapper>
  );
}

const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 280px;
  height: 36px;
  background-color: #eff2f9;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 20px;

  input {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    height: 100%;
    border: none;
    background-color: transparent;
  }
`;
