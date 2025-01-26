import { useState } from "react";
import useMobileNavigate from "hooks/useMobileNavigate";
import styled from "styled-components";
import { deletePost, putLike } from "apis/posts";
import X_Vector from "resources/assets/mobile-mypage/X-Vector.svg";
import { useResetTipsStore } from "../../../reducer/resetTipsStore";
import { Post } from "types/posts";
import heart from "resources/assets/posts/posts-heart.svg";

interface TipsCardContainerProps {
  post: Post[];
  onUpdate: () => void; // 콜백 함수
  type: "like" | "post";
}

export default function Card({ post, onUpdate, type }: TipsCardContainerProps) {
  const mobileNavigate = useMobileNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const triggerReset = useResetTipsStore((state) => state.triggerReset);

  const handleDocumentClick = (id: number) => {
    mobileNavigate(`/postdetail?id=${id}`);
  };

  const handleXButtonClick = (id: number) => {
    setActivePostId(id);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setActivePostId(null);
  };

  const handleConfirm = async () => {
    if (activePostId) {
      try {
        if (type === "post") {
          // 글 삭제
          await deletePost(activePostId);
          alert("게시글이 성공적으로 삭제되었습니다.");
          triggerReset();
          onUpdate(); // 콜백 함수 호출하여 목록 갱신
        } else if (type === "like") {
          // 좋아요 삭제
          await putLike(activePostId);
          alert("좋아요가 성공적으로 삭제되었습니다.");
          onUpdate(); // 콜백 함수 호출하여 목록 갱신
        }
      } catch (error) {
        console.error("작업 중 오류 발생:", error);
        alert("작업 중 오류가 발생했습니다.");
      } finally {
        handleCancel(); // 작업 후 모달 닫기
      }
    }
  };

  return (
    <CardWrapper>
      <p>
        <span>All</span> {post.length}
      </p>
      {post.map((p) => (
        <TipsCardListWrapper
          key={p.id}
          onClick={() => handleDocumentClick(p.id)}
        >
          <XButton
            src={X_Vector}
            alt="delete"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when X is clicked
              handleXButtonClick(p.id);
            }}
          />
          <ListLeftWrapper>
            <Category>{p.category}</Category>
            <Date>{p.createDate}</Date>
          </ListLeftWrapper>
          <ListLine />
          <ListRightWrapper>
            <Title>{p.title}</Title>
            <Content>{p.content}</Content>
            <LikeCommentWriterWrapper>
              <span className="like-comment">
                <img src={heart} alt="" />
                <span>{p.like}</span>
                <span></span>
                <span>댓글</span>
                <span>{p.replyCount}</span>
              </span>
              <span className="writer">{p.writer}</span>
            </LikeCommentWriterWrapper>
          </ListRightWrapper>
        </TipsCardListWrapper>
      ))}

      {/* Modal for Delete or Unlike Confirmation */}
      {showModal && (
        <ModalOverlay>
          <ModalWrapper>
            <ModalTop>
              <Description>
                {type === "post"
                  ? "작성하신 글은 목록과 게시글 상에서 삭제되어 복구할 수 없습니다"
                  : "좋아요 한 글은 목록에서 삭제되어 복구할 수 없습니다"}
              </Description>
              <span></span>
              <DeleteButton onClick={handleConfirm}>삭제</DeleteButton>
            </ModalTop>
            <ModalBottom onClick={handleCancel}>취소</ModalBottom>
          </ModalWrapper>
        </ModalOverlay>
      )}
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  padding: 0 8px 10px 28px;
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  color: #0e4d9d;
  span {
    color: #969696;
  }
`;

const XButton = styled.img`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 10px;
  height: 10px;
  cursor: pointer;
`;

const Category = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #0e4d9d;
  width: fit-content;
  border-bottom: 2px solid #7aa7e5;
  padding-bottom: 2px;
`;

const Date = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #7aa7e5;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #221112;
`;

const Content = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
`;

const LikeCommentWriterWrapper = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  .like-comment {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 500;
    img {
      height: 10px;
    }
  }
  .writer {
    font-size: 10px;
    font-weight: 500;
    color: #303030;
    padding: 2px 8px;
    background-color: #ecf4ff;
    border-radius: 8px;
  }
`;

const TipsCardListWrapper = styled.div`
  position: relative;
  height: 96px;
  width: 90%;
  border: 2px solid #7aa7e5;
  border-radius: 10px;
  display: flex;
  padding-right: 20px;
  margin-bottom: 12px;
`;

const ListLeftWrapper = styled.div`
  padding-left: 12px;
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ListLine = styled.div`
  height: 100%;
  border: 1px solid #7aa7e5;
`;

const ListRightWrapper = styled.div`
  position: relative;
  padding: 8px 8px 0 12px;
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  z-index: 1000;
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
