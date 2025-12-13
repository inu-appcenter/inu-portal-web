import useMobileNavigate from "@/hooks/useMobileNavigate";
import { deletePost } from "@/apis/posts";
import deletebtn from "@/resources/assets/mypage/minus.svg";
import styled from "styled-components";
import { useResetTipsStore } from "@/reducer/resetTipsStore";
import axios, { AxiosError } from "axios";

interface DeletePostBtnProps {
  id: number;
  onPostUpdate: () => void;
}

export default function DeletePostBtn({
  id,
  onPostUpdate,
}: DeletePostBtnProps) {
  const mobileNavigate = useMobileNavigate();
  const triggerReset = useResetTipsStore((state) => state.triggerReset);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await deletePost(id);
      onPostUpdate();
      triggerReset();
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

  return (
    <DeleteBtn onClick={handleDelete}>
      <img src={deletebtn} alt="삭제 아이콘" style={{ padding: "3px" }} />
      삭제
    </DeleteBtn>
  );
}

// Styled Component
const DeleteBtn = styled.div`
  align-items: center;
  width: 84px;
  height: 30px;
  border-radius: 10px;
  background: #eff2f9;
  font-size: 15px;
  font-weight: 500;
  color: #757575;
  display: flex;
  justify-content: center;
`;
