import styled from "styled-components";
import SearchBar from "components/posts/SearchBar";
import { useEffect, useState } from "react";
import useUserStore from "stores/useUserStore";

export default function PostsTitle() {
  const { userInfo } = useUserStore();
  const [type, setType] = useState("Campus Map");
  const [category, setCategory] = useState("캠퍼스맵");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setType(params.get("type") ? "NOTICE" : "CampusMap");
    if (params.get("search")) {
      setCategory("검색결과");
    } else {
      setCategory(params.get("category") || "캠퍼스맵");
    }
  }, [location.search]);

  return (
    <TipsTitleWrapper>
      <TipsTitleText>
        <span>{category}</span>
        <span className="color">{type}</span>
      </TipsTitleText>
      <div>
        {type != "NOTICE" && <SearchBar />}
        {userInfo.id != 0 && (
          <div className="userInfo">
            <span>{userInfo.nickname}</span>
            <img
              src={`https://portal.inuappcenter.kr/api/images/${userInfo.fireId}`}
              alt=""
            />
          </div>
        )}
      </div>
    </TipsTitleWrapper>
  );
}

const TipsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  div {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .userInfo {
    font-size: 20px;
    img {
      height: 44px;
      border-radius: 100px;
    }
  }
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
