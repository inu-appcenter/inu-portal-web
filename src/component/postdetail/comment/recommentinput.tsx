import React, { useState } from "react";
import { useSelector } from "react-redux";
import { postReReplies } from "../../../utils/API/Replies";
import './recommentinput.css';
import checkedCheckbox from '../../../resource/assets/checked-checkbox.svg';
import uncheckedCheckbox from '../../../resource/assets/unchecked-checkbox.svg';
import enterImage from '../../../resource/assets/enter-img.svg';

interface ReCommentInputProps {
  parentId: number;
  onCommentUpdate: () => void;
}

export default function ReCommentInput({ parentId, onCommentUpdate }: ReCommentInputProps) {
  const token = useSelector((state: any) => state.user.token);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const toggleAnonymous = () => setIsAnonymous(!isAnonymous);

  const handleReCommentSubmit = async () => {
    if (!content.trim()) {
      alert("대댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const response = await postReReplies(token, parentId, content, isAnonymous);
      if (response.status === 201) {
        alert("대댓글 등록 성공");
        setContent("");
        setIsAnonymous(false);
        onCommentUpdate();
      } else {
        alert('대댓글 등록 실패');
      }
    } catch (error) {
      console.error('대댓글 등록 에러', error);
      alert('대댓글 등록 에러');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleReCommentSubmit();
      e.preventDefault();
    }
  };

  return (
    <div className="recomment-input-container">
      <img
        src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
        alt="Anonymous"
        onClick={toggleAnonymous}
      />
      <span className='recomment-anonymous-text'>익명</span>
      <div className='recomment-vline'></div>
      <input
        className='recomment-input'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="대댓글을 입력하세요."
      />
      <img src={enterImage} alt='enter' onClick={handleReCommentSubmit} />
    </div>
  );
}
