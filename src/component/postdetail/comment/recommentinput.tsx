import React, { useState } from "react";
import { useSelector } from "react-redux";
import postReComment from "../../../utils/postReComment";

interface ReCommentInputProps {
  parentId: number;
  onCommentUpdate: () => void;
}

export default function ReCommentInput({ parentId, onCommentUpdate }: ReCommentInputProps) {
  const token = useSelector((state: any) => state.user.token);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleReCommentSubmit = async () => {
    if (!content.trim()) {
      alert("대댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const response = await postReComment(token, parentId, content, isAnonymous);
      if (response === 201) {
        alert("대댓글 등록 성공");
        setContent("");
        setIsAnonymous(false);
        onCommentUpdate();
      }
      else {
        alert('대댓글 등록 실패');
      }
    }
    catch (error) {
      console.error('대댓글 등록 에러', error);
      alert('대댓글 등록 에러');
    }
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        익명
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="대댓글을 입력하세요."
      />
      <button onClick={handleReCommentSubmit}>대댓글 등록</button>
    </div>
  );
}
