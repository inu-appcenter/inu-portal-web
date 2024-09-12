import { useNavigate } from "react-router-dom";
import { deletePost } from "../../../utils/API/Posts";
import deletebtn from "../../../resource/assets/deletebtn.svg";
import styled from "styled-components";
import { useResetTipsStore } from "../../../reducer/resetTipsStore";

interface DeletePostBtnProps {
  token: string;
  id: string;
  onPostUpdate: () => void;
}

export default function DeletePostBtn({
  token,
  id,
  onPostUpdate,
}: DeletePostBtnProps) {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const triggerReset = useResetTipsStore((state) => state.triggerReset);

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("게시글을 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        const response = await deletePost(token, id);
        if (response.status === 200) {
          onPostUpdate();
          triggerReset();
          navigate(
            currentPath.includes("/m/postdetail") ? "/m/home/tips" : "/tips"
          );
        } else if (response.status === 403) {
          alert("이 글의 삭제에 대한 권한이 없습니다.");
        } else {
          alert("삭제 에러");
        }
      } catch (error) {
        console.error("삭제 에러", error);
        alert("삭제 에러");
      }
    }
  };

  return (
    <DeleteBtn onClick={handleDeleteClick}>
      <img src={deletebtn} alt="삭제 아이콘" style={{ padding: "3px" }} />
      삭제
    </DeleteBtn>
  );
}

// Styled Component
const DeleteBtn = styled.div`
  align-items: center;
  width: 76px;
  height: 30px;
  border-radius: 10px;
  background: #eff2f9;
  font-size: 15px;
  font-weight: 500;
  color: #757575;
  display: flex;
  justify-content: center;
`;
