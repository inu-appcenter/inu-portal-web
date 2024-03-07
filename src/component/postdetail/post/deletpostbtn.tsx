import React from 'react';
import deletePost from '../../../utils/deletePost';
import { useNavigate } from 'react-router-dom';

interface DeletePostBtnProps {
  token: string;
  id: number;
  onPostUpdate: () => void;
}

const DeletePostBtn: React.FC<DeletePostBtnProps> = ({ token, id, onPostUpdate }) => {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("게시글을 삭제하시겠습니까?");
    if(confirmDelete){
      try {
        const response = await deletePost(token, id);
        if (response === 200) {
          // 삭제 성공 시 부모 컴포넌트에게 업데이트를 알립니다.
          onPostUpdate();
          // 삭제 후 /tips로 navigate
          navigate('/tips');
        } else if (response === 403) {
          alert('이 글의 삭제에 대한 권한이 없습니다.');
        } else {
          // 삭제 에러 시 알림
          alert('삭제 에러');
        }
      } catch (error) {
        console.error("삭제 에러", error);
        alert('삭제 에러');
      }
    }
  };

  return <button onClick={handleDeleteClick}>게시글 삭제</button>;
};

export default DeletePostBtn;