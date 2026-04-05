import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";

export default function BookSearchForm() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim().length < 2) {
      alert("검색어는 두 글자 이상 입력해주세요.");
      return;
    }

    navigate(`/home/util?type=book&search=${query}`);
  };

  return (
    <MobilePillSearchBar
      value={query}
      onChange={setQuery}
      onSubmit={handleSearch}
      placeholder="검색어를 입력해주세요"
    />
  );
}
