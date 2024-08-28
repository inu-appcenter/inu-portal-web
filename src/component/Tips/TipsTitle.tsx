import styled from "styled-components";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MyInfo from "../mypage/common/info";

interface TipsTitleProps {
  docState: DocState;
}

interface loginInfo {
  user: {
    token: string;
  };
}

export default function TipsTitle({ docState }: TipsTitleProps) {
  const navigate = useNavigate();
  const user = useSelector((state: loginInfo) => state.user);

  return (
    <TipsTitleWrapper>
      <TipsTitleText onClick={() => navigate("/tips")}>
        <TipsTitleText1>{docState.selectedCategory}</TipsTitleText1>
        <TipsTitleText2> {docState.docType}</TipsTitleText2>
      </TipsTitleText>
      <SearchBarUserInfoWrapper>
        <SearchBar />
        {user.token && <MyInfo />}
      </SearchBarUserInfoWrapper>
    </TipsTitleWrapper>
  );
}

// Styled Components
const TipsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  padding-right: 30px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
`;

const SearchBarUserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 5px;
  }
`;

const TipsTitleText = styled.span`
  flex-grow: 0;
  flex-shrink: 0;
  cursor: pointer;
`;

const TipsTitleText1 = styled.span`
  font-size: 24px;
  font-weight: 700;
  margin: 5px;
`;

const TipsTitleText2 = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #aac9ee;
`;
