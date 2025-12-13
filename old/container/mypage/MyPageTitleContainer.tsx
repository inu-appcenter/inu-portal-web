import styled from "styled-components";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { MypageTitle } from "old/component/mypage/common/MyPageTitle";
// import MyPageUserInfo from '../../component/mypage/common/MyPageUserInfo';
import SearchBar from "../../component/tips/SearchBar";
import MyInfo from "../../component/mypage/common/info";
interface loginInfo {
  user: {
    token: string;
  };
}

interface MyPageTitleContainerProps {
  selectedCategory: string;
}

export default function MyPageTitleContainer({
  selectedCategory,
}: MyPageTitleContainerProps) {
  const token = useSelector((state: loginInfo) => state.user.token);
  const user = useSelector((state: loginInfo) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <MyPageTitleWrapper>
      <MypageTitle />
      <SearchInfoWrapper>
        {(selectedCategory === "스크랩" || selectedCategory === "내 활동") && (
          <SearchBar />
        )}
        {user.token && <MyInfo />}
      </SearchInfoWrapper>
    </MyPageTitleWrapper>
  );
}

const MyPageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  padding-right: 30px;
  gap: 20px;
`;

const SearchInfoWrapper = styled.div`
  display: flex;
  gap: 20px;
`;
