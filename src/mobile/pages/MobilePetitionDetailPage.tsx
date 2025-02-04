import styled from "styled-components";
import backbtn from "resources/assets/mobile-common/backbtn.svg";
import { useEffect, useState } from "react";
import { deletePetitions, getPetitionsDetail, putLike } from "apis/petitions";
import PostContentContainer from "mobile/containers/postdetail/PostContentContainer";
import { Petition } from "types/petitions";
import axios, { AxiosError } from "axios";
import { useLocation } from "react-router-dom";
import useMobileNavigate from "hooks/useMobileNavigate";
import UploadPetition from "mobile/components/council/UploadPetition";
import useReloadKeyStore from "stores/useReloadKeyStore";
import heartEmptyImg from "resources/assets/posts/heart-empty.svg";
import heartFilledImg from "resources/assets/posts/heart-filled.svg";

export default function MobilePetitionDetailPage() {
  const { triggerReload } = useReloadKeyStore();
  const [petition, setPetition] = useState<Petition>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [likeState, setLikeState] = useState(0);
  const [isLikedState, setIsLikedState] = useState(false);

  const mobileNavigate = useMobileNavigate();
  const location = useLocation();

  const fetchPost = async (id: number) => {
    try {
      const response = await getPetitionsDetail(id);
      setPetition(response.data);
      setLikeState(response.data.like);
      setIsLikedState(response.data.isLiked);
    } catch (error) {
      console.error("청원 가져오기 실패", error);
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
          case 403:
            alert("비밀글입니다.");
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
    if (location.pathname.includes("/petitiondetail")) {
      const params = new URLSearchParams(location.search);
      fetchPost(Number(params.get("id")) || 0);
    }
  }, [location.pathname]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const params = new URLSearchParams(location.search);
      await deletePetitions(Number(params.get("id")));
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

  const handleLike = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const response = await putLike(Number(params.get("id")) || 0);
      if (response.data === 1) {
        setLikeState(likeState + 1);
        setIsLikedState(!isLikedState);
      } else {
        setLikeState(likeState - 1);
        setIsLikedState(!isLikedState);
      }
    } catch (error) {
      console.error("게시글 좋아요 여부 변경 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 400:
            alert("자신의 게시글에는 추천을 할 수 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다.");
            break;
          default:
            alert("게시글 좋아요 여부 변경 실패");
            break;
        }
      }
    }
  };

  return (
    <>
      {petition ? (
        <>
          <Wrapper>
            <PostTopWrapper>
              <PostUtilWrapper>
                <BackBtn onClick={() => mobileNavigate(-1)}>
                  <img src={backbtn} alt="뒤로가기 버튼" />
                </BackBtn>
                {petition.hasAuthority && (
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
                <LikeContainer>
                  <img
                    className="UtilityImg"
                    src={isLikedState ? heartFilledImg : heartEmptyImg}
                    alt="heartImg"
                    onClick={handleLike}
                  />
                  <span>{likeState}</span>
                </LikeContainer>
              </PostUtilWrapper>
            </PostTopWrapper>
            <PostWrapper>
              <PostContentContainer petition={petition} />
            </PostWrapper>
          </Wrapper>
          <UploadPetition
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onUploaded={handleUploaded}
            initialData={petition}
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

const LikeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  img.UtilityImg {
    width: 23px;
  }
`;
