import styled from "styled-components";
import { useSelector } from "react-redux";
import WritePageTitle from "../components/write/WritePageTitle";
import CategorySelector from "../components/common/CategorySelector";
import WriteForm from "../containers/write/WriteForm";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import loginImg from "../../resource/assets/login-logo.svg";
import { useResetWriteStore } from "../../reducer/resetWriteStore";

interface loginInfo {
  user: {
    token: string;
  };
}

export default function MobileWritePage() {
  const token = useSelector((state: loginInfo) => state.user.token);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [id, setId] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const resetKey = useResetWriteStore((state) => state.resetKey);

  useEffect(() => {
    if (location.pathname.includes("update")) {
      const params = new URLSearchParams(location.search);
      setId(params.get("id") || "");
      setType("update");
    } else {
      setType("create");
      setCategory("");
    }
  }, [location.pathname]);

  const handleNewPost = () => {
    navigate("/m/write");
    setType("create");
    setId("");
    setCategory("");
  };

  return (
    <>
      {token ? (
        <MobileWritePageWrapper>
          <TitleCategorySelectorWrapper>
            <WritePageTitle idProps={id} value={type} />
            {type == "update" && (
              <NewPostButton onClick={handleNewPost}>새 글 쓰기</NewPostButton>
            )}
            <CategorySelector
              write={true}
              value={category}
              onChange={setCategory}
              docType={"TIPS"}
            />
          </TitleCategorySelectorWrapper>
          <WriteForm
            key={resetKey}
            idProps={id}
            category={category}
            setCategory={setCategory}
            typeProps={type}
          />
        </MobileWritePageWrapper>
      ) : (
        <ErrorWrapper>
          <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
          <div className="error">로그인이 필요합니다!</div>
        </ErrorWrapper>
      )}
    </>
  );
}

const MobileWritePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 16px 0 16px;
  height: 96%;
  width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NewPostButton = styled.div`
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  background-color: #007bff;
  border-radius: 4px;
`;
const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  margin-top: 100px;
  div {
    font-size: 20px;
  }
`;

const LoginImg = styled.img`
  width: 150px;
`;
