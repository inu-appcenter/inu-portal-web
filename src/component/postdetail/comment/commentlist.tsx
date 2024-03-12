import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CommentLike from './commentlike';
import EditCommentButton from './editcommentbutton';
import DeleteCommentButton from './deletecommentbutton';
import ReCommentInput from './recommentinput';
import ReCommentList from './recommentlist';

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

interface CommentListProps {
  bestComment: Replies;
  comments: Replies[];
  onCommentUpdate: () => void;
}

const CommentList: React.FC<CommentListProps> = ({ bestComment, comments, onCommentUpdate }) => {
  console.log(comments);
  
  const token = useSelector((state: any) => state.user?.token);
  const [showReCommentInputId, setShowReCommentInputId] = useState<number | null>(null);

  return (
    <div>
      <div>
        {bestComment && (<div>
          (베스트)
          <strong>{bestComment.writer}</strong>: {bestComment.content}
          <CommentLike id={bestComment.id} like={bestComment.like} isLikedProp={bestComment.isLiked} />
          {bestComment.hasAuthority && (
            <>
              <EditCommentButton token={token} id={bestComment.id} currentContent={bestComment.content} isAnonymous={bestComment.isAnonymous} onCommentUpdate={onCommentUpdate} />
              <DeleteCommentButton token={token} id={bestComment.id} onCommentUpdate={onCommentUpdate} />
            </>
          )}
          <button onClick={() => setShowReCommentInputId(bestComment.id)}>대댓글</button>
          {showReCommentInputId === bestComment.id && (
            <ReCommentInput parentId={bestComment.id} onCommentUpdate={onCommentUpdate} />
          )}
        </div>)}
      </div>
      {comments.map((comment) => (
        <div key={comment.id}>
          {(comment.id != bestComment.id) && 
          (<div>
          <strong>{comment.writer}</strong>: {comment.content}
          <CommentLike id={comment.id} like={comment.like} isLikedProp={comment.isLiked} />
          {comment.hasAuthority && (
            <>
              <EditCommentButton token={token} id={comment.id} currentContent={comment.content} isAnonymous={comment.isAnonymous} onCommentUpdate={onCommentUpdate} />
              <DeleteCommentButton token={token} id={comment.id} onCommentUpdate={onCommentUpdate} />
            </>
          )}
          <button onClick={() => setShowReCommentInputId(comment.id)}>대댓글</button>
          {showReCommentInputId === comment.id && (
            <ReCommentInput parentId={comment.id} onCommentUpdate={onCommentUpdate} />
          )}
          <ReCommentList token={token} reReplies={comment.reReplies} onCommentUpdate={onCommentUpdate} />
          </div>)}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
