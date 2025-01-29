import styled from "styled-components";
import backbtn from "resources/assets/mobile-common/backbtn.svg";
import { useEffect, useState } from "react";
import { deleteCouncilNotices, getCouncilNotices } from "apis/councilNotices";
import PostContentContainer from "mobile/containers/postdetail/PostContentContainer";
import { CouncilNotice } from "types/councilNotices";
import axios, { AxiosError } from "axios";
import { useLocation } from "react-router-dom";
import useMobileNavigate from "hooks/useMobileNavigate";
import useUserStore from "stores/useUserStore";
import UploadNotice from "mobile/components/council/UploadNotice";
import useReloadKeyStore from "stores/useReloadKeyStore";

export default function MobileCouncilDetailPage() {
  const { triggerReload } = useReloadKeyStore();
  const { userInfo } = useUserStore();
  const [councilNotice, setCouncilNotice] = useState<CouncilNotice>();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const mobileNavigate = useMobileNavigate();
  const location = useLocation();

  const fetchPost = async (id: number) => {
    try {
      const response = await getCouncilNotices(id);
      setCouncilNotice(response.data);
    } catch (error) {
      console.error("총학생회 공지사항 가져오기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 404:
            alert("존재하지 않는 게시글입니다.");
            mobileNavigate(-1);
            break;
          default:
            alert("게시글 가져오기 실패");
            mobileNavigate(-1);
            break;
        }
      }
    }
  };

  useEffect(() => {
    if (location.pathname.includes("/councilnoticedetail")) {
      const params = new URLSearchParams(location.search);
      fetchPost(Number(params.get("id")) || 0);
    }
  }, [location.pathname]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const params = new URLSearchParams(location.search);
      await deleteCouncilNotices(Number(params.get("id")));
      triggerReload();
      mobileNavigate(-1);
    } catch (error) {
      console.error("게시글 삭제 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 403:
            alert("이 게시글의 수정/삭제에 대한 권한이 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 게시글입니다.");
            break;
          default:
            alert("게시글 삭제 실패");
            break;
        }
      }
    }
  };

  const handleUploaded = () => {
    setIsEditOpen(false);
  };

  return (
    <>
      {councilNotice ? (
        <>
          <Wrapper>
            <PostTopWrapper>
              <PostUtilWrapper>
                <BackBtn onClick={() => mobileNavigate(-1)}>
                  <img src={backbtn} alt="뒤로가기 버튼" />
                </BackBtn>
                {userInfo.role == "admin" && (
                  <>
                    <Button
                      onClick={() => {
                        setIsEditOpen(true);
                      }}
                    >
                      수정
                    </Button>
                    <Button onClick={handleDelete}>삭제</Button>
                  </>
                )}
              </PostUtilWrapper>
            </PostTopWrapper>
            <PostWrapper>
              <PostContentContainer councilNotice={councilNotice} />
            </PostWrapper>
          </Wrapper>
          <UploadNotice
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onUploaded={handleUploaded}
            initialData={councilNotice}
          />
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
const Wrapper = styled.div`
  width: 100%;
  height: calc(100svh - 65px);
`;
const PostTopWrapper = styled.div`
  width: 100%;
  height: 70px;
  border-bottom: 1px solid #ccc;
`;

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100svh - 135px);
  overflow-y: auto;
  position: relative;
  z-index: 1;
`;

const PostUtilWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 20px 10px 20px;
  height: 30px;
  gap: 15px;
`;

const BackBtn = styled.div`
  color: #888888;
  margin-right: auto;
  display: flex;
  padding: 8px;
`;

const Button = styled.button``;
