import styled from "styled-components";
import WritePageTitle from "mobile/components/write/WritePageTitle";
import WriteForm from "mobile/containers/write/WriteForm";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useMobileNavigate from "hooks/useMobileNavigate";
import loginImg from "resources/assets/login/login-modal-logo.svg";
import { useResetWriteStore } from "reducer/resetWriteStore";
import useUserStore from "stores/useUserStore";
import CategorySelect from "mobile/components/write/CategorySelect";

export default function MobileWritePage() {
  const { tokenInfo } = useUserStore();
  const [id, setId] = useState(0);
  const [category, setCategory] = useState<string>("");
  const location = useLocation();
  const mobileNavigate = useMobileNavigate();
  const resetKey = useResetWriteStore((state) => state.resetKey);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setId(Number(params.get("id")) || 0);
  }, [location]);

  const handleNewPost = () => {
    mobileNavigate(`/write`);
  };

  return (
    <>
      {tokenInfo.accessToken ? (
        <MobileWritePageWrapper>
          <TitleCategorySelectorWrapper>
            <WritePageTitle id={id} />
            {id != 0 && (
              <NewPostButton onClick={handleNewPost}>새 글 쓰기</NewPostButton>
            )}
            <CategorySelect category={category} setCategory={setCategory} />
          </TitleCategorySelectorWrapper>
          <WriteForm
            key={resetKey}
            category={category}
            setCategory={setCategory}
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
  padding: 0 16px;
  box-sizing: border-box;
  min-height: calc(100svh - 72px - 72px - 24px);
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
