import React from 'react';
import CommentLike from './commentlike';
import editComment from '../../../utils/editComment';
import { useSelector } from 'react-redux';
import deleteComment from '../../../utils/deleteComment';

interface Replies {
  id: number;
  writer: string;
  content: string;
  like: number;
  isLiked: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: any;
}

interface CommentListProps {
  comments: Replies[];
  onCommentUpdate: () => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onCommentUpdate }) => {
  const token = useSelector((state: any) => state.user.token);

  const handleEditClick = async (id: number, currentContent: string, isAnonymous: boolean) => {
    const newContent = prompt("수정:", currentContent);
    if (newContent !== null && newContent !== currentContent) {
      try {
        const response = await editComment(token, id, newContent, isAnonymous);
        if (response === 200) {
          alert("수정 성공");
          onCommentUpdate();
        }
        else if (response === 403) {
          alert('이 댓글의 수정에 대한 권한이 없습니다.');
        }
        else {
          alert('수정 에러');
        }
       }
       catch (error) {
        console.error("수정 에러", error);
        alert('수정 에러');
       }
      }
  };

  const handleDeleteClick = async (id: number) => {
    try {
      const response = await deleteComment(token, id);
      if (response === 200) {
        alert("삭제 성공");
        onCommentUpdate();
      }
      else if (response === 403) {
        alert('이 댓글의 삭제에 대한 권한이 없습니다.');
      }
      else {
        alert('삭제 에러');
      }
    }
    catch (error) {
     console.error("삭제 에러", error);
     alert('삭제 에러');
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>작성자</th>
          <th>내용</th>
          <th>좋아요</th>
          <th>작성일</th>
          <th>Actions</th> {/* 액션 열 추가 */}
        </tr>
      </thead>
      <tbody>
        {comments.map((comment) => (
          <tr key={comment.id}>
            <td>{comment.writer}</td>
            <td>{comment.content}</td>
            <td><CommentLike id={comment.id} like={comment.like} isLikedProp={comment.isLiked} /></td>
            <td>{comment.createDate}</td>
            <td>
              <button onClick={() => handleEditClick(comment.id, comment.content, true)}>수정</button>
              <button onClick={() => handleDeleteClick(comment.id)}>삭제</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CommentList;
