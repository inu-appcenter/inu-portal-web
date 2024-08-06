import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CommentImg from '../../../resource/assets/comment-img2.svg'
import ReCommentInput from '../../../component/postdetail/comment/recommentinput';
import DeleteCommentButton from '../../../component/postdetail/comment/deletecommentbutton';
import EditCommentButton from '../../../component/postdetail/comment/editcommentbutton';
import CommentLike from '../../../component/postdetail/comment/commentlike';
import styled from 'styled-components';
import ReCommentList from '../../components/postdetail/comment/m.recommentlist';

interface Replies {
  id: number;
  writer: string;
  fireId:number;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}

interface CommentListProps {
  bestComment: Replies;
  comments: Replies[];
  onCommentUpdate: () => void;
}

interface loginInfo {
  user: {
    token: string;
  };
}

const CommentListMobile: React.FC<CommentListProps> = ({ bestComment, comments, onCommentUpdate }) => {
  const token = useSelector((state: loginInfo) => state.user?.token);
  const [showReCommentInputId, setShowReCommentInputId] = useState<number | null>(null);
  const allComments = bestComment ? [bestComment, ...comments.filter(comment => comment.id !== bestComment.id)] : comments;
  const formatDate = (dateString: string): string => {
    // '2024.07.30' 형태를 Date 객체로 변환
    const [year, month, day] = dateString.split('.').map(Number);
    const commentDate = new Date(year, month - 1, day); // 시간은 기본적으로 00:00:00
    const now = new Date();

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
        <CommentWrapper>
        <Commentheader>
      <img className='commentImg'src={CommentImg} alt="Comments" style={{ width: '14px' }} />
      <span className='comment'>댓글</span>
      </Commentheader>
      <CommentListWrapper>
        {allComments.map((comment, index) => (
          <div key={comment.id} className='comment-container'>
            <Comments>
              <ProfileWrapper>
                <Profile src={`https://portal.inuappcenter.kr/api/images/${comment.fireId}`} alt='프로필' />
              </ProfileWrapper>
              <CommentDetail>
                <div>
                  <span className='writer-text'>{comment.writer} </span>
                  {index === 0 && bestComment && (<span className='best-text'>Best</span>)}
                </div>
                <span className='content-text'>{comment.content}</span>
                <div className='commentUtility-container'>
                  <span className='commentUtility' onClick={() => setShowReCommentInputId(comment.id)}>답장</span>
                  {comment.hasAuthority && (
                    <>
                      <EditCommentButton token={token} id={comment.id} currentContent={comment.content} isAnonymous={comment.isAnonymous} onCommentUpdate={onCommentUpdate} />
                      <DeleteCommentButton token={token} id={comment.id} onCommentUpdate={onCommentUpdate} />
                    </>
                  )}
                </div>
              </CommentDetail>
              <CommentUtil>
                <CommentLike id={comment.id} like={comment.like} isLikedProp={comment.isLiked} />
                <CommentDate>{formatDate(comment.createDate)}</CommentDate>
              </CommentUtil>
            </Comments>
            {showReCommentInputId === comment.id && (
              <ReCommentInput parentId={comment.id} onCommentUpdate={onCommentUpdate} />
            )}
            {comment.reReplies && (
              <ReCommentList token={token} reReplies={comment.reReplies} onCommentUpdate={onCommentUpdate} />
            )}
          </div>
        ))}
      </CommentListWrapper>
      
      </CommentWrapper>
    </div>
  );
};

export default CommentListMobile;

const CommentWrapper = styled.div`
`

const Commentheader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    height : 40px;
    font-size: 12px;
    background-color: #F6F9FF;
    padding-left: 30px;
`

const CommentListWrapper = styled.div`
    width: 100%;

`

const Comments = styled.div`
 display: flex;
  flex-direction: row;
position: relative; 
`

const ProfileWrapper = styled.div`
    border-radius: 50%;
    min-width: 53px;
    max-width: 60px;
    height: 53px;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    

`

const Profile = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    align-items:center;
`

const CommentDetail = styled.div`
  flex-direction: column;
  padding-left: 15px;
`
const CommentUtil = styled.div`
min-width: 70px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  top: 0;
  position: absolute; 
  align-items:center;
  margin-top:10px;
  right: 0; /* 부모 요소의 맨 오른쪽에 배치 */
  `

const CommentDate = styled.span`
    font-size: 10px;
    color:#888888;
`