import Activity from "@/components/desktop/mypage/Activity";
import Categories from "@/components/desktop/mypage/Categories";
import Delete from "@/components/desktop/mypage/Delete";
import Modify from "@/components/desktop/mypage/Modify";
import MyPageTitle from "@/components/desktop/mypage/MyPageTitle";
import Scrap from "@/components/desktop/mypage/Scrap";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

export default function MyPage() {
  const location = useLocation();
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCategory(params.get("category") || "스크랩");
  }, [location.search]);

  return (
    <MyPageWrapper>
      <Categories />
      <ContentsWrapper>
        <MyPageTitle />
        {category === "스크랩" && <Scrap />}
        {category === "내 활동" && <Activity />}
        {category === "개인정보 수정" && <Modify />}
        {category === "회원 탈퇴" && <Delete />}
      </ContentsWrapper>
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
  padding: 0 32px;
  display: flex;
  gap: 16px;
`;

const ContentsWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
`;
