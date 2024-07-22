import React from 'react';
import CommentLike from './commentlike';
import EditCommentButton from './editcommentbutton';
import DeleteCommentButton from './deletecommentbutton';
import recommenticon from '../../../resource/assets/recommenticon.svg';
import './recommentlist.css';

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
