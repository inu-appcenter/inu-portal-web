import { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import Ripple from "@/components/common/Ripple";
import Icon from "@/components/common/Icon";
import type {
  DailyBriefCardType,
  DailyBriefCardDetailConfig,
} from "@/types/dailyBrief";
import { cafeterias } from "@/resources/strings/cafeterias";

interface DailyBriefCardDetailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardType: DailyBriefCardType | null;
  currentDetails: DailyBriefCardDetailConfig;
  onSave: (updatedDetails: DailyBriefCardDetailConfig) => void;
}

const AVAILABLE_LIBRARY_ROOMS = [
  "제1열람실",
  "제2열람실",
  "제3열람실",
  "힐링존",
  "1노트북실",
  "3노트북실",
  "오픈라운지",
  "ICT라운지",
];

export default function DailyBriefCardDetailConfigModal({
  isOpen,
  onClose,
  cardType,
  currentDetails,
  onSave,
}: DailyBriefCardDetailConfigModalProps) {
  const [selectedRooms, setSelectedRooms] = useState<string[]>(
    currentDetails.library?.selectedRooms || ["제1열람실", "제2열람실", "제3열람실", "힐링존"],
  );
  const [preferredCafeteria, setPreferredCafeteria] = useState<string>(
    currentDetails.cafeteria?.preferredCafeteria || "학생식당",
  );
  const [busDefaultType, setBusDefaultType] = useState<"auto" | "go-school" | "go-home">(
    currentDetails.bus?.defaultType || "auto",
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedRooms(
        currentDetails.library?.selectedRooms || ["제1열람실", "제2열람실", "제3열람실", "힐링존"],
      );
      setPreferredCafeteria(
        currentDetails.cafeteria?.preferredCafeteria || "학생식당",
      );
      setBusDefaultType(currentDetails.bus?.defaultType || "auto");
    }
  }, [isOpen, currentDetails]);

  if (!isOpen || !cardType) return null;

  const handleToggleRoom = (roomName: string) => {
    if (selectedRooms.includes(roomName)) {
      // 최소 1개는 선택되어야 함
      if (selectedRooms.length <= 1) return;
      setSelectedRooms(selectedRooms.filter((r) => r !== roomName));
    } else {
      setSelectedRooms([...selectedRooms, roomName]);
    }
  };

  const handleConfirm = () => {
    const updated: DailyBriefCardDetailConfig = {
      ...currentDetails,
      library: {
        ...currentDetails.library,
        selectedRooms,
      },
      cafeteria: {
        ...currentDetails.cafeteria,
        preferredCafeteria,
      },
      bus: {
        ...currentDetails.bus,
        defaultType: busDefaultType,
      },
    };
    onSave(updated);
    onClose();
  };

  const getModalTitle = () => {
    switch (cardType) {
      case "library":
        return "학산도서관 세부 설정";
      case "cafeteria":
        return "학식 카드 세부 설정";
      case "bus":
        return "캠퍼스 버스 세부 설정";
      default:
        return "카드 세부 설정";
    }
  };

  const getModalDescription = () => {
    switch (cardType) {
      case "library":
        return "데일리 브리프 도서관 카드에 표시할 열람실을 선택해 주세요.";
      case "cafeteria":
        return "브리프 화면 진입 시 기본으로 먼저 보여줄 식당을 선택해 주세요.";
      case "bus":
        return "버스 카드의 기본 이동 방향(등교/하교) 기준을 설정해요.";
      default:
        return "";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      description={getModalDescription()}
      primaryButton={{
        text: "저장하기",
        onClick: handleConfirm,
        variant: "brand",
      }}
      secondaryButton={{
        text: "취소",
        onClick: onClose,
        variant: "secondary",
      }}
    >
      <ModalContentWrapper>
        {cardType === "library" && (
          <OptionList>
            <SubLabel>노출할 열람실/라운지 (최소 1개 선택)</SubLabel>
            {AVAILABLE_LIBRARY_ROOMS.map((room) => {
              const checked = selectedRooms.includes(room);
              return (
                <CheckItem
                  key={room}
                  onClick={() => handleToggleRoom(room)}
                  role="checkbox"
                  aria-checked={checked}
                >
                  <Ripple color="rgba(0, 0, 0, 0.06)" />
                  <ItemName>{room}</ItemName>
                  <CheckboxIcon $checked={checked}>
                    {checked && <Icon name="check" size={13} color="#FFFFFF" />}
                  </CheckboxIcon>
                </CheckItem>
              );
            })}
          </OptionList>
        )}

        {cardType === "cafeteria" && (
          <OptionList>
            <SubLabel>우선 추천 식당</SubLabel>
            {cafeterias.map((caf) => {
              const selected = preferredCafeteria === caf.title;
              return (
                <RadioItem
                  key={caf.id}
                  onClick={() => setPreferredCafeteria(caf.title)}
                  role="radio"
                  aria-checked={selected}
                >
                  <Ripple color="rgba(0, 0, 0, 0.06)" />
                  <ItemName>{caf.title}</ItemName>
                  <RadioCircle $selected={selected} />
                </RadioItem>
              );
            })}
          </OptionList>
        )}

        {cardType === "bus" && (
          <OptionList>
            <SubLabel>기본 노선 방향</SubLabel>
            <RadioItem
              onClick={() => setBusDefaultType("auto")}
              role="radio"
              aria-checked={busDefaultType === "auto"}
            >
              <Ripple color="rgba(0, 0, 0, 0.06)" />
              <ItemTextCol>
                <ItemName>✨ 시간표 연동 자동 추천</ItemName>
                <ItemDesc>
                  첫 수업 전에는 등교 방면, 수업 후에는 하교 방면을 알아서 열어줘요.
                </ItemDesc>
              </ItemTextCol>
              <RadioCircle $selected={busDefaultType === "auto"} />
            </RadioItem>

            <RadioItem
              onClick={() => setBusDefaultType("go-school")}
              role="radio"
              aria-checked={busDefaultType === "go-school"}
            >
              <Ripple color="rgba(0, 0, 0, 0.06)" />
              <ItemTextCol>
                <ItemName>등교 우선</ItemName>
                <ItemDesc>인천대입구역 ➡️ 학교 방면 정류장을 항상 먼저 보여줘요.</ItemDesc>
              </ItemTextCol>
              <RadioCircle $selected={busDefaultType === "go-school"} />
            </RadioItem>

            <RadioItem
              onClick={() => setBusDefaultType("go-home")}
              role="radio"
              aria-checked={busDefaultType === "go-home"}
            >
              <Ripple color="rgba(0, 0, 0, 0.06)" />
              <ItemTextCol>
                <ItemName>하교 우선</ItemName>
                <ItemDesc>학교 정문/자연대 ➡️ 역 방면 정류장을 항상 먼저 보여줘요.</ItemDesc>
              </ItemTextCol>
              <RadioCircle $selected={busDefaultType === "go-home"} />
            </RadioItem>
          </OptionList>
        )}
      </ModalContentWrapper>
    </Modal>
  );
}

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  max-height: 55vh;
  overflow-y: auto;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SubLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
`;

const CheckItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  user-select: none;
`;

const RadioItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  user-select: none;
`;

const ItemTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
`;

const ItemName = styled.span`
  font-size: 14.5px;
  font-weight: 600;
  color: #1e293b;
`;

const ItemDesc = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.35;
`;

const CheckboxIcon = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background-color: ${({ $checked }) => ($checked ? "#3b82f6" : "#ffffff")};
  border: 1.5px solid ${({ $checked }) => ($checked ? "#3b82f6" : "#cbd5e1")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#3b82f6" : "#cbd5e1")};
  background-color: ${({ $selected }) => ($selected ? "#3b82f6" : "#ffffff")};
  flex-shrink: 0;
  transition: all 0.15s ease;
  position: relative;

  ${({ $selected }) =>
    $selected &&
    `
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #ffffff;
      transform: translate(-50%, -50%);
    }
  `}
`;
