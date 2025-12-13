import React, { useState } from "react";

const SearchBar: React.FC<{ map: any }> = ({ map }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchQuery, (data: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds();
        data.forEach((item) =>
          bounds.extend(new window.kakao.maps.LatLng(item.y, item.x)),
        );
        map.setBounds(bounds);
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="주소를 입력하세요"
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
};

export default SearchBar;
