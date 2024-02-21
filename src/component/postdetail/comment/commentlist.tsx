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
  comments: Replies[];
  onCommentUpdate: () => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onCommentUpdate }) => {
  const token = useSelector((state: any) => state.user.token);
  const [showReCommentInputId, setShowReCommentInputId] = useState<number | null>(null);

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id}>
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
        </div>
      ))}
    </div>
  );
};

export default CommentList;
