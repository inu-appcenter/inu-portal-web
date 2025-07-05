import styled from "styled-components";
import pencil from "resources/assets/posts/pencil-white.svg";
import LoginModal from "components/common/LoginModal";
import { useState } from "react";
import useUserStore from "stores/useUserStore";
import useMobileNavigate from "hooks/useMobileNavigate";

export default function FloatingWriteButton() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { tokenInfo } = useUserStore();
  const mobileNavigate = useMobileNavigate();

  const handleClick = () => {
    if (tokenInfo.accessToken) {
      mobileNavigate("/write");
    } else {
      setIsOpenModal(true);
    }
  };

  return (
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
}

const WriteButtonWrapper = styled.button`
  position: fixed;
  bottom: 30px;
  right: 15px;
  width: 55px;
  height: 55px;
  border-radius: 100px;
  border: none;
  z-index: 999;
  background: linear-gradient(
    90deg,
    rgba(111, 132, 226) 0%,
    rgba(123, 171, 229) 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
`;
