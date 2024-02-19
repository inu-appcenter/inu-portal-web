import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import postComment from "../../../utils/postComment";

interface CommentInputProps {
  onCommentUpdate: () => void;
}

export default function CommentInput({ onCommentUpdate }: CommentInputProps) {
  const token = useSelector((state: any) => state.user.token);
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleCommentSubmit = async () => {
    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const response = await postComment(token, id, content, isAnonymous);
      if (response === 201) {
        alert("등록 성공");
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
        placeholder="댓글을 입력하세요."
      />
      <div>
      </div>
      <button onClick={handleCommentSubmit}>댓글 등록</button>
    </div>
  );
}