import { useState } from "react";

import FloatingSearchBar from "@/components/mobile/common/FloatingSearchBar";

interface SaveSearchFormProps {
  onSearch: (query: string) => void;
}

export default function SaveSearchForm({ onSearch }: SaveSearchFormProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (q.length < 2) {
      alert("검색어는 두 글자 이상 입력해주세요.");
      return;
    }

    onSearch(q);
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
