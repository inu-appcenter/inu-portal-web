import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import HeartFilledImg from "../../../resource/assets/heart-filled-img.svg";
import X_Vector from "../../../resource/assets/X-Vector.svg";
import { deleteReplies } from "../../../utils/API/Replies";

interface loginInfo {
  user: {
    token: string;
  };
}

interface Comment {
  id: number;
  title: string;
  replyCount: number;
  content: string;
  like: number;
  postId: number;
  createDate: string;
  modifiedDate: string;
}

interface TipsCardContainerProps {
  posts: Comment[];
  onCommentsUpdate: () => void; // 댓글 업데이트 콜백 함수
}

export default function CardComment({
  posts,
  onCommentsUpdate,
}: TipsCardContainerProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [activeCardId, setActiveCardId] = useState<number | null>(null); // Active card state

  // Redux에서 token 가져오기
  const token = useSelector((state: loginInfo) => state.user?.token);

  const handleDocumentClick = (id: number) => {
    navigate(`/m/postdetail?id=${id}`);
  };

  const handleXButtonClick = (id: number) => {
    setActiveCardId(id);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setActiveCardId(null);
  };

  const handleDelete = async () => {
    if (!token || activeCardId === null) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await deleteReplies(token, activeCardId);
      if (response.status === 200) {
        alert("댓글이 성공적으로 삭제되었습니다.");
        // 삭제 후 상태 업데이트가 필요하다면 여기서 수행
        // 예: 상태를 필터링하여 삭제된 댓글을 제거
        onCommentsUpdate(); // 댓글 목록을 업데이트하도록 콜백 함수 호출
        setActiveCardId(null);
        setShowModal(false);
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    console.log("comment", posts);
  }, [posts]); // Add posts as a dependency

  return (
    <CardWrapper>
      <p>
        <span>All</span> {posts.length}
      </p>
      <TipsCardListWrapper>
        {posts.map((p) => (
          <TipsCardWrapper
            key={p.id}
            onClick={() => handleDocumentClick(p.postId)}
          >
            <XButton
              src={X_Vector}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when X is clicked
                handleXButtonClick(p.id);
              }}
            />
            <Date>{p.createDate}</Date>
            <Content>{p.content}</Content>
            <LikeWrapper>
              <img src={HeartFilledImg} alt="like" />
              <Like>{p.like}</Like>
              <Like>·</Like>
              <Like>댓글 {p.replyCount}</Like>
            </LikeWrapper>
            <Title>{p.title}</Title>
          </TipsCardWrapper>
        ))}
      </TipsCardListWrapper>

      {/* Modal for Delete Confirmation */}
      {showModal && (
        <ModalOverlay>
          <ModalWrapper>
            <ModalTop>
              <Description>
                작성한 댓글은 목록과 게시물에서 삭제되어 복구할 수 없습니다
              </Description>
              <span></span>
              <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
            </ModalTop>
            <ModalBottom onClick={handleCancel}>취소</ModalBottom>
          </ModalWrapper>
        </ModalOverlay>
      )}
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  color: #0e4d9d;
  span {
    color: #969696;
  }
  p {
    padding-left: 28px;
  }
`;

const TipsCardListWrapper = styled.div`
  background-color: #f6f9ff;
  min-height: calc(100svh - 72px - 49px - 18px - 64px - 78px);
  height: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TipsCardWrapper = styled.div`
  position: relative;
  height: 126px;
  width: calc(100% - 28px);
  padding: 14px 0 14px 28px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
`;

const XButton = styled.img`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 10px;
  height: 10px;
  cursor: pointer;
`;

const Date = styled.div`
  font-size: 7px;
  font-weight: 400;
  color: #757575;
`;

const Content = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: #000000;
  height: 40px;
`;

const LikeWrapper = styled.div`
  display: flex;
  gap: 6px;
  font-size: 8px;
  font-weight: 400;
  color: #757575;
  height: 10px;
  align-items: center;
  img {
    height: 10px;
  }
`;

const Like = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.div`
  padding-left: 8px;
  width: 228px;
  max-width: 90%;
  height: 18px;
  font-size: 8px;
  font-weight: 600;
  color: #000000;
  background-color: #f3f3f3;
  display: flex;
  align-items: center;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: end;
  justify-content: center;
  z-index: 1000; /* Ensure it overlays above everything else */
`;

const ModalWrapper = styled.div`
  margin-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 90%;
`;

const ModalTop = styled.div`
  background-color: white;
  border-radius: 10px;
  width: 100%;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  span {
    height: 1px;
    width: 100%;
    background-color: #d9d9d9;
  }
`;

const Description = styled.div`
  color: #757575;
  font-size: 12px;
  font-weight: 600;
`;

const DeleteButton = styled.div`
  color: #df5532;
  font-size: 16px;
  font-weight: 500;
  width: 100%;
  text-align: center;
`;

const ModalBottom = styled.div`
  background-color: white;
  border-radius: 10px;
  width: 100%;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #0e4d9d;
  font-size: 16px;
  font-weight: 500;
`;
