import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CommentLike from './commentlike';
import EditCommentButton from './editcommentbutton';
import DeleteCommentButton from './deletecommentbutton';
import ReCommentInput from './recommentinput';
import ReCommentList from './recommentlist';
import CommentsImg from '../../../resource/assets/comments-img.svg';
import './commentlist.css';
import getFireImage from '../../../utils/getFireImage';

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
  const token = useSelector((state: any) => state.user?.token);
  let fireId = useSelector((state: any) => state.user.fireId);
  console.log(fireId,"현재 횃불이 아이디");
  const [image, setImage] = useState<string | undefined>("");
  const fetchImage = async () => {
      if(!fireId) {fireId = 0;}
      const imageUrl = await getFireImage(token,fireId);
      setImage(imageUrl);
    };
  
    useEffect(() => {
      fetchImage();
    }, [token,fireId]);
    
  const [showReCommentInputId, setShowReCommentInputId] = useState<number | null>(null);
  const allComments =  bestComment ? [bestComment, ...comments.filter(comment => comment.id !== bestComment.id)] : comments;
  console.log(allComments);
  return (
    <div>
      <img src={CommentsImg} />
      <div className='commentlist-container'>
      {allComments.map((comment, index) => (
        <div key={comment.id} className='comment-container'>
          <div className='comment-main-container'>
            <div className='profile-image-background'>
              <img src={image} alt='프로필'/>
            </div>
            <div className='comment-container-mid'>
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
            </div>
            <div className='comment-container-right'>
              <div className='commentUtility'>{comment.createDate}</div>
              <CommentLike id={comment.id} like={comment.like} isLikedProp={comment.isLiked} />
            </div>
          </div>
            {showReCommentInputId === comment.id && (
              <ReCommentInput parentId={comment.id} onCommentUpdate={onCommentUpdate} />
            )}
          <div>
            {comment.reReplies && (<ReCommentList token={token} reReplies={comment.reReplies} onCommentUpdate={onCommentUpdate} />)}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default CommentList;
