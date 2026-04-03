import { useState } from "react";

import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";

interface SaveSearchFormProps {
  onSearch: (query: string) => void;
}

export default function SaveSearchForm({ onSearch }: SaveSearchFormProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim().length < 2) {
      alert("검색어는 두 글자 이상 입력해주세요.");
      return;
    }

    onSearch(query);
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
