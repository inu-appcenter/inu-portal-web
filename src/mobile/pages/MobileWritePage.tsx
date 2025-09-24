import styled from "styled-components";
import WritePageTitle from "mobile/components/write/WritePageTitle";
import WriteForm from "mobile/containers/write/WriteForm";
import { useParams } from "react-router-dom";
import loginImg from "resources/assets/login/login-modal-logo.svg";
import { useResetWriteStore } from "reducer/resetWriteStore";
import useUserStore from "stores/useUserStore";
import CategorySelect from "mobile/components/write/CategorySelect";
import { useState } from "react";
import MobileHeader from "../containers/common/MobileHeader.tsx";

export default function MobileWritePage() {
  const { tokenInfo } = useUserStore();
  const { id: routeId } = useParams<{ id?: string }>();
  const id = routeId ? Number(routeId) : 0;
  const [category, setCategory] = useState<string>("");
  const resetKey = useResetWriteStore((state) => state.resetKey);

  return (
    <>
      {tokenInfo.accessToken ? (
        <MobileWritePageWrapper>
          <MobileHeader title={id === 0 ? "TIP 글쓰기" : `TIP 수정하기`} />

          <TitleCategorySelectorWrapper>
            <WritePageTitle id={id} />
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

  padding-top: 65px;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
