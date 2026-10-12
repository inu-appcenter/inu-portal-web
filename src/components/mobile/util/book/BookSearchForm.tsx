import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FloatingSearchBar from "@/components/mobile/common/FloatingSearchBar";

export default function BookSearchForm() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (q.length < 2) {
      alert("검색어는 두 글자 이상 입력해주세요.");
      return;
    }

    navigate(`/home/util?type=book&search=${encodeURIComponent(q)}`);
  };

  return (
    <FloatingSearchBar
      value={query}
      onChange={setQuery}
      onSubmit={() => handleSearch()}
      onSearch={(q) => handleSearch(q)}
      placeholder="검색어를 입력해주세요"
      isActive={true}
      disableCollapse={true}
      disableHistory={true}
    />
  );
}
