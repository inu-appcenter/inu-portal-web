import React from 'react';
import CommentLike from './commentlike';
import EditCommentButton from './editcommentbutton';
import DeleteCommentButton from './deletecommentbutton';

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

  return (
    <div style={{ marginLeft: '20px' }}>
      {reReplies.map((reply) => (
        <div key={reply.id}>
          <strong>{reply.writer}</strong>: {reply.content}
          <CommentLike id={reply.id} like={reply.like} isLikedProp={reply.isLiked} />
          {reply.hasAuthority && (
            <>
              <EditCommentButton token={token} id={reply.id} currentContent={reply.content} isAnonymous={reply.isAnonymous} onCommentUpdate={onCommentUpdate} />
              <DeleteCommentButton token={token} id={reply.id} onCommentUpdate={onCommentUpdate} />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReCommentList;
