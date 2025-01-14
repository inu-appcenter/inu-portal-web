import styled from "styled-components";
import WritePageTitle from "mobile/components/write/WritePageTitle";
import WriteForm from "mobile/containers/write/WriteForm";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import loginImg from "resources/assets/login/login-modal-logo.svg";
import { useResetWriteStore } from "reducer/resetWriteStore";
import useUserStore from "stores/useUserStore";
import CategorySelect from "mobile/components/write/CategorySelect";
import useAppStateStore from "stores/useAppStateStore";

export default function MobileWritePage() {
  const { tokenInfo, userInfo } = useUserStore();
  const [type, setType] = useState(""); // "" | "councilNotice"
  const [id, setId] = useState(0);
  const [councilNoticeId, setCouncilNoticeId] = useState(-1);
  const [category, setCategory] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();
  const resetKey = useResetWriteStore((state) => state.resetKey);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setId(Number(params.get("id")) || 0);
    setCouncilNoticeId(Number(params.get("councilNoticeId")) || 0);
    setType(params.get("type") || "");
  }, [location]);

  const handleNewPost = () => {
    navigate(`${isAppUrl}/write`);
  };

  const handleNewCouncilNotice = () => {
    navigate(`${isAppUrl}/write?type=councilNotice`);
  };

  return (
    <>
      {tokenInfo.accessToken ? (
        <MobileWritePageWrapper>
          <TitleCategorySelectorWrapper>
            <WritePageTitle
              type={type}
              id={id}
              councilNoticeId={councilNoticeId}
            />
            {(id != 0 || type != "") && (
              <NewPostButton onClick={handleNewPost}>새 글 쓰기</NewPostButton>
            )}
            {userInfo.role == "admin" &&
              (type != "councilNotice" || councilNoticeId != 0) && (
                <>
                  <NewPostButton onClick={handleNewCouncilNotice}>
                    새 총학생회 공지 작성
                  </NewPostButton>
                </>
              )}
            {type != "councilNotice" && (
              <CategorySelect category={category} setCategory={setCategory} />
            )}
          </TitleCategorySelectorWrapper>
          <WriteForm
            key={resetKey}
            category={category}
            setCategory={setCategory}
            type={type}
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
