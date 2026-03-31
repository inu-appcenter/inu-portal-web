import { AnimatePresence, motion } from "framer-motion";
import { MapPinned, Route } from "lucide-react";
import styled from "styled-components";

interface BusUiWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusUiWelcomeModal({
  isOpen,
  onClose,
}: BusUiWelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalCard
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <Title>
              새로워진 인입런을
              <br />
              만나보세요!
            </Title>

            <Highlights>
              <HighlightItem>
                <HighlightIcon>
                  <MapPinned size={18} />
                </HighlightIcon>
                <HighlightText>
                  정류장 위치와 버스 노선을 지도에서 바로 확인할 수 있어요.
                </HighlightText>
              </HighlightItem>

              <HighlightItem>
                <HighlightIcon>
                  <Route size={18} />
                </HighlightIcon>
                <HighlightText>
                  이전 버전은 우측 상단 메뉴에서 되돌아갈 수 있어요.
                </HighlightText>
              </HighlightItem>
            </Highlights>

            <ConfirmButton type="button" onClick={onClose}>
              확인했어요
            </ConfirmButton>
          </ModalCard>
        </Overlay>
      ) : null}
    </AnimatePresence>
  );
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(1, 1, 1, 0.2);
  backdrop-filter: blur(1px);
`;

const ModalCard = styled(motion.div)`
  width: min(100%, 360px);
  padding: 28px 22px 22px;
  border-radius: 28px;
  background:
    radial-gradient(
      circle at top right,
      rgba(84, 163, 255, 0.16),
      transparent 34%
    ),
    linear-gradient(180deg, #ffffff, #f8fbff);
  box-shadow:
    0 20px 48px rgba(15, 23, 42, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin: 0;
  color: #102b52;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.03em;
  word-break: keep-all;
`;

const Highlights = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HighlightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 13px;
  border-radius: 18px;
  background: rgba(239, 246, 255, 0.92);
`;

const HighlightIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f5fbc;
  background: rgba(255, 255, 255, 0.88);
`;

const HighlightText = styled.p`
  margin: 0;
  color: #284567;
  font-size: 13px;
  line-height: 1.55;
  word-break: keep-all;
`;

const ConfirmButton = styled.button`
  width: 100%;
  margin-top: 4px;
  border: 0;
  border-radius: 16px;
  padding: 14px 16px;
  background: linear-gradient(180deg, #2d75da, #1558b7);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    transform: scale(0.99);
  }
`;
