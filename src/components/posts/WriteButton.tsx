import styled from "styled-components";
import pencil from "resources/assets/posts/pencil-white.svg";
import LoginModal from "components/common/LoginModal";
import { useState } from "react";
import useUserStore from "stores/useUserStore";
import { useNavigate } from "react-router-dom";

export default function WriteButton() {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const { tokenInfo } = useUserStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (tokenInfo.accessToken) {
      navigate("/write");
    } else {
      setIsOpenModal(true);
    }
  };

  return (
    <>
      <WriteButtonWrapper onClick={handleClick}>
        <img src={pencil} alt="" />
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
  width: 60px;
  height: 60px;
  height: 60px;
  border-radius: 100px;
  border: none;
  background: linear-gradient(
    90deg,
    rgba(111, 132, 226, 0.6) 0%,
    rgba(123, 171, 229, 0.6) 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
`;
