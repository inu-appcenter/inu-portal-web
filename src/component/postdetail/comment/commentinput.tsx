import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import postComment from "../../../utils/postComment";
import './commentinput.css';
import checkedCheckbox from '../../../resource/assets/checked-checkbox.svg';
import uncheckedCheckbox from '../../../resource/assets/unchecked-checkbox.svg';
import enterImage from '../../../resource/assets/enter-img.svg';

interface CommentInputProps {
  onCommentUpdate: () => void;
}

export default function CommentInput({ onCommentUpdate }: CommentInputProps) {
  const token = useSelector((state: any) => state.user.token);
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const toggleAnonymous = () => setIsAnonymous(!isAnonymous);

  const handleCommentSubmit = async () => {
    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (id === undefined) {
      console.error('ID is undefined');
      return;
    }
    try {
      const response = await postComment(token, id, content, isAnonymous);
      if (response === 201) {
        setContent("");
        setIsAnonymous(false);
        onCommentUpdate();
      }
      else {
        alert('등록 실패');
      }
    }
    catch (error) {
      console.error('등록 에러', error);
      alert('등록 에러');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleCommentSubmit();
    }
  };

  return (
    <div className='comment-input-container'>
      <img
        src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
        alt="Anonymous"
        onClick={toggleAnonymous}
      />
      <span className='anonymous-text'>익명</span>
      <div className='vline'></div>
      <input
        className='comment-input'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="댓글을 입력하세요."
      />
      <img
        src={enterImage}
        alt='enter'
        onClick={handleCommentSubmit}
      />
    </div>
  );
}
