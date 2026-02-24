import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import { deletePost, putLike } from "@/apis/posts";
import { ROUTES } from "@/constants/routes";
import X_Vector from "@/resources/assets/mobile-mypage/X-Vector.svg";
import { useResetTipsStore } from "@/reducer/resetTipsStore";
import { Post } from "@/types/posts";
import PostItem from "@/components/mobile/notice/PostItem";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import { Fragment } from "react";

interface TipsCardContainerProps {
  post: Post[];
  onUpdate: () => void; // 콜백 함수
  type: "like" | "post";
}

export default function Card({ post, onUpdate, type }: TipsCardContainerProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const triggerReset = useResetTipsStore((state) => state.triggerReset);

  const handleDocumentClick = (id: number) => {
    navigate(ROUTES.BOARD.TIPS_DETAIL(id));
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
      <Box>
        {post.map((p, index) => (
          <Fragment key={p.id}>
            <RelativeWrapper>
              <XButton
                src={X_Vector}
                alt="delete"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when X is clicked
                  handleXButtonClick(p.id);
                }}
              />
              <div
                onClick={() => handleDocumentClick(p.id)}
                style={{ cursor: "pointer" }}
              >
                <PostItem
                  title={p.title}
                  category={p.category}
                  date={p.createDate}
                  writer={p.writer}
                />
              </div>
            </RelativeWrapper>
            {index < post.length - 1 && <Divider margin={"16px 0"} />}
          </Fragment>
        ))}
      </Box>

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
  //padding: 0 8px 10px 28px;
  padding: 0 16px;
  box-sizing: border-box;
  font-size: 15px;
  font-weight: 600;
  color: #0e4d9d;
  span {
    color: #969696;
  }
`;

const XButton = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 10px;
  cursor: pointer;
  z-index: 10;
  padding: 5px; // Click area
  object-fit: contain;
  width: fit-content;
`;

const RelativeWrapper = styled.div`
  position: relative;
  width: 100%;
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
