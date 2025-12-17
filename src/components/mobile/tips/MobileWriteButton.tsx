import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import pencil from "@/resources/assets/posts/pencil-white.svg";
import LoginModal from "@/components/desktop/common/LoginModal";
import { useState } from "react";
import useUserStore from "@/stores/useUserStore";
import { createPortal } from "react-dom"; // 1. createPortal 불러오기

export default function FloatingWriteButton() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { tokenInfo } = useUserStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (tokenInfo.accessToken) {
      navigate(ROUTES.BOARD.TIPS_WRITE);
    } else {
      setIsOpenModal(true);
    }
  };

  // 2. 렌더링할 내용을 변수로 분리 (선택 사항이지만 가독성에 좋음)
  const buttonContent = (
    <>
      <WriteButtonWrapper onClick={handleClick}>
        <img src={pencil} alt="글쓰기" />
      </WriteButtonWrapper>
      {isOpenModal && (
        <LoginModal
          openModal={() => setIsOpenModal(true)}
          closeModal={() => setIsOpenModal(false)}
        />
      )}
    </>
  );

  // 3. createPortal을 사용하여 document.body에 렌더링
  return createPortal(buttonContent, document.body);
}

// 스타일은 그대로 유지
const WriteButtonWrapper = styled.button`
  position: fixed;
  bottom: 30px;
  right: 15px;
  width: 55px;
  height: 55px;
  border-radius: 100px;
  border: none;
  z-index: 9999; /* 포탈을 썼으므로 z-index가 중요해질 수 있음 */
  background: linear-gradient(
    90deg,
    rgba(111, 132, 226) 0%,
    rgba(123, 171, 229) 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer; /* 버튼이므로 커서 추가 추천 */
`;
