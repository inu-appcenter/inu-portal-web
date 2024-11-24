import SearchBar from "components/posts/SearchBar";
import styled from "styled-components";
import useUserStore from "stores/useUserStore";

export default function MyPageTitle() {
  const { userInfo } = useUserStore();

  return (
    <TipsTitleWrapper>
      <TipsTitleText>
        <span>마이페이지</span>
        <span className="color">My Page</span>
      </TipsTitleText>
      <div>
        <SearchBar />
        <div className="userInfo">
          <span>{userInfo.nickname}</span>
          <img
            src={`https://portal.inuappcenter.kr/api/images/${userInfo.fireId}`}
            alt=""
          />
        </div>
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
