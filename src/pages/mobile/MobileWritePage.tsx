import styled from "styled-components";
import WriteForm from "@/containers/mobile/write/WriteForm";
import { useLocation, useParams } from "react-router-dom";
import loginImg from "@/resources/assets/login/login-modal-logo.webp";
import { useResetWriteStore } from "@/reducer/resetWriteStore";
import useUserStore from "@/stores/useUserStore";
import CategorySelect from "@/components/mobile/write/CategorySelect";
import { useEffect, useMemo, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

export default function MobileWritePage() {
  const { tokenInfo } = useUserStore();
  const { id: routeId } = useParams<{ id?: string }>();
  const id = routeId ? Number(routeId) : 0;
  const location = useLocation();
  const queryCategory = new URLSearchParams(location.search).get("category");
  const [category, setCategory] = useState<string>(queryCategory || "");
  const resetKey = useResetWriteStore((state) => state.resetKey);

  useEffect(() => {
    if (queryCategory) {
      setCategory(queryCategory);
    }
  }, [queryCategory]);

  const headerRightArea = useMemo(
    () => <CategorySelect category={category} setCategory={setCategory} />,
    [category],
  );

  // 헤더 설정 주입
  useHeader({
    title: id === 0 ? "글쓰기" : "글 수정하기",
    hasback: true,
    rightArea: headerRightArea,
    rightAreaNotCircle: true,
  });

  return (
    <>
      {tokenInfo.accessToken ? (
        <MobileWritePageWrapper>
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
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;
  min-height: calc(100svh - 72px - 72px - 24px);
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    padding-left: 0;
    padding-right: 0;
  }
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
