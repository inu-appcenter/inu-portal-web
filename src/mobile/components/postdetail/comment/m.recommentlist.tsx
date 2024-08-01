import React from 'react';
import recommenticon from '../../../../resource/assets/recommenticon.svg';
import styled from 'styled-components';
import CommentLike from '../../../../component/postdetail/comment/commentlike';
import EditCommentButton from '../../../../component/postdetail/comment/editcommentbutton';
import DeleteCommentButton from '../../../../component/postdetail/comment/deletecommentbutton';

interface Replies {
  id: number;
  writer: string;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}

interface ReCommentListProps {
  token: string;
  reReplies: Replies[];
  onCommentUpdate: () => void;
}

const ReCommentList: React.FC<ReCommentListProps> = ({ reReplies, onCommentUpdate, token }) => {
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('.').map(Number);
    const commentDate = new Date(year, month - 1, day); // 시간은 기본적으로 00:00:00
    const now = new Date();
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return '잘못된 날짜';
      }      
    
    // 현재 날짜와 댓글 날짜 비교
    const diffInDays = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return '오늘';
    } else if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    } else if (diffInDays < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths}개월 전`;
    } else {
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears}년 전`;
    }
  };

  return (
    <div>
      {reReplies.map((reply) => (
        <div key={reply.id} className='recomment-main-container'>
          <div className='recomment-container-2'>
            <div className='recomment-container-3'>
              <img src={recommenticon} />
              <span className='recomment-writer-text'>{reply.isAnonymous ? "횃불이" : reply.writer}</span>
              <span className='recomment-content-text'>{reply.content}</span>
            </div>
            <CommentLike id={reply.id} like={reply.like} isLikedProp={reply.isLiked} />
            <CommentDate>{formatDate(reply.createDate)}</CommentDate>
          </div>
          {reply.hasAuthority && (
            <div className='recomment-utility'>
              <EditCommentButton token={token} id={reply.id} currentContent={reply.content} isAnonymous={reply.isAnonymous} onCommentUpdate={onCommentUpdate} />
              <DeleteCommentButton token={token} id={reply.id} onCommentUpdate={onCommentUpdate} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReCommentList;
const CommentDate = styled.span`
    font-size: 10px;
    color:#888888;
`