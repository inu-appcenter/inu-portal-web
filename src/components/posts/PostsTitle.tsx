import styled from "styled-components";
import SearchBar from "components/posts/SearchBar";
import { useEffect, useState } from "react";

export default function PostsTitle() {
  const [type, setType] = useState("tips");
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setType(params.get("type") ? "NOTICE" : "TIPS");
    if (params.get("search")) {
      setCategory("검색결과");
    } else {
      setCategory(params.get("category") || "전체");
    }
  }, [location.search]);

  return (
    <TipsTitleWrapper>
      <TipsTitleText>
        <span>{category}</span>
        <span className="color">{type}</span>
      </TipsTitleText>
      {type != "NOTICE" && <SearchBar />}
    </TipsTitleWrapper>
  );
}

const TipsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TipsTitleText = styled.div`
  font-size: 24px;
  font-weight: 700;

  display: flex;
  align-items: center;
  gap: 8px;

  .color {
    color: #aac9ee;
  }
`;
