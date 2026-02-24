import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const ComingSoonModal = ({ isOpen, onClose }: ComingSoonModalProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(ROUTES.HOME);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContainer
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <IconWrapper>
              <Construction size={48} color="#7a6dd0" />
            </IconWrapper>
            <Title>준비 중인 기능이에요!</Title>
            <Description>
              더 나은 서비스를 제공하기 위해<br />
              열심히 준비하고 있습니다.<br />
              조금만 더 기다려 주세요!
            </Description>
            <BackButton onClick={handleGoBack}>돌아가기</BackButton>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled(motion.div)`
  background-color: white;
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background-color: #f3f0ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 28px 0;
  word-break: keep-all;
`;

const BackButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #7a6dd0;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;

  &:active {
    filter: brightness(0.9);
  }
`;
