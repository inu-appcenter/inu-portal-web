import { useState } from "react";
import { useSelector } from "react-redux";
import { postReplies } from "old/utils/API/Replies";
import styled from "styled-components";
import checkedCheckbox from "../../../../resource/assets/checked-checkbox.svg";
import uncheckedCheckbox from "../../../../resource/assets/unchecked-checkbox.svg";
import enterImage from "../../../../resource/assets/enter-img.svg";

interface CommentInputProps {
  id: string;
  onCommentUpdate: () => void;
}

interface loginInfo {
  user: {
    token: string;
  };
}

export default function CommentInput({
  id,
  onCommentUpdate,
}: CommentInputProps) {
  const token = useSelector((state: loginInfo) => state.user.token);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleAnonymous = () => setIsAnonymous(!isAnonymous);

  const handleCommentSubmit = async () => {
    if (loading) return; // Prevent additional clicks during submission

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (id === undefined) {
      console.error("ID is undefined");
      return;
    }

    setLoading(true); // Start loading state
    try {
      const response = await postReplies(token, id, content, isAnonymous);
      if (response.status === 201) {
        onCommentUpdate();
        setContent("");
        setIsAnonymous(false);
      } else {
        alert(`등록 실패: ${response.body.msg}`);
      }
    } catch (error) {
      console.error("등록 에러", error);
      alert("등록 에러");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommentAreaContainer>
      <CommentInputContainer>
        <CheckboxImage
          src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
          alt="Anonymous"
          onClick={toggleAnonymous}
        />
        <AnonymousText>익명</AnonymousText>
        <VerticalLine />
        <CommentInputField
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요."
        />
        <EnterImage
          src={enterImage}
          alt="enter"
          onClick={handleCommentSubmit}
          disabled={loading}
          style={{ opacity: loading ? 0.5 : 1 }}
        />
      </CommentInputContainer>
    </CommentAreaContainer>
  );
}

// Styled Components
const CommentAreaContainer = styled.div`
  border-top: 1px solid #dadada;
  position: fixed;
  bottom: 0px;
  z-index: 100;
  height: 64px;
  width: calc(100% - 253px);
  background-color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    position: fixed;
    width: 100%;
    left: 0;
    right: 0;
    bottom: 0;
    transform: none;
    margin-right: 5px;
  }
`;

const CommentInputContainer = styled.div`
  flex-grow: 1;
  margin-left: 20px;
  margin-right: 120px;
  padding-left: 10px;
  padding-right: 10px;

  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background-color: #eff2f9;

  @media (max-width: 768px) {
    margin: 0;
    background-color: #fff;
    position: relative;
  }
`;

const CheckboxImage = styled.img`
  cursor: pointer;
`;

const AnonymousText = styled.span`
  font-size: 20px;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const VerticalLine = styled.div`
  width: 2px;
  height: 28px;
  background-color: #b3b3b3;

  @media (max-width: 768px) {
    background-color: #fff;
  }
`;

const CommentInputField = styled.input`
  flex-grow: 1;
  font-size: 20px;
  font-weight: 400;

  height: 48px;
  border: 0;
  background-color: transparent;

  @media (max-width: 768px) {
    font-size: 16px;
    background-color: #eff2f9;
    border-radius: 16.5px;
    padding: 0 0 0 15px;
  }
`;

const EnterImage = styled.img<{ disabled: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;
