import { useState } from "react";
import { useSelector } from "react-redux";
import { postReReplies } from "old/utils/API/Replies";
import styled from "styled-components";
import checkedCheckbox from "../../../resource/assets/checked-checkbox.svg";
import uncheckedCheckbox from "../../../resource/assets/unchecked-checkbox.svg";
import enterImage from "../../../resource/assets/enter-img.svg";

interface ReCommentInputProps {
  parentId: number;
  onCommentUpdate: () => void;
}

export default function ReCommentInput({
  parentId,
  onCommentUpdate,
}: ReCommentInputProps) {
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
      const response = await postReReplies(
        token,
        parentId,
        content,
        isAnonymous,
      );
      if (response.status === 201) {
        alert("대댓글 등록 성공");
        setContent("");
        setIsAnonymous(false);
        onCommentUpdate();
      } else {
        alert("대댓글 등록 실패");
      }
    } catch (error) {
      console.error("대댓글 등록 에러", error);
      alert("대댓글 등록 에러");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleReCommentSubmit();
      e.preventDefault();
    }
  };

  return (
    <ReCommentInputContainer>
      <img
        src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
        alt="Anonymous"
        onClick={toggleAnonymous}
      />
      <ReCommentAnonymousText>익명</ReCommentAnonymousText>
      <ReCommentVLine />
      <ReCommentInputField
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="대댓글을 입력하세요."
      />
      <img src={enterImage} alt="enter" onClick={handleReCommentSubmit} />
    </ReCommentInputContainer>
  );
}

// Styled Components
const ReCommentInputContainer = styled.div`
  border-top: 2px solid #dedede;
  height: 42px;
  border-radius: 8px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: 60px;
  margin-right: 140px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  top: 0;
  background-color: white;

  @media (max-width: 768px) {
    flex-direction: row;
    border-top: none;
    margin: 0;
    margin-left: 50px;
    margin-right: 20px;
    padding: 0;
  }

  img {
    width: 15px;
    height: 15px;
  }
`;

const ReCommentAnonymousText = styled.span`
  font-size: 15px;
  font-weight: 400;
`;

const ReCommentVLine = styled.div`
  width: 2px;
  height: 21px;
  background-color: #b3b3b3;
`;

const ReCommentInputField = styled.input`
  flex-grow: 1;
  font-size: 15px;
  font-weight: 400;
  height: 40px;
  border: 0;
  background-color: transparent;
`;
