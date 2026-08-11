import styled from "styled-components";
import { MapPin, QrCode, UserRoundSearch } from "lucide-react";

/**
 * 친구 추가 FAB을 눌렀을 때 뜨는 카드형 드롭다운 메뉴.
 *
 * 채팅 목록(친구 탭)과 친구 목록(시간표 → 친구) 두 진입 경로가 서로 다른 UI를 쓰던 것을
 * 하나로 통일한 컴포넌트. `position: relative`(또는 `fixed`)인 부모 안에서 FAB 버튼과
 * 나란히 렌더링해야 카드가 버튼 우상단에 정렬된다.
 */
interface AddFriendMenuCardProps {
  open: boolean;
  onScrimClick: () => void;
  onSearchClick: () => void;
  onNearbyClick: () => void;
  onInviteClick: () => void;
}

export default function AddFriendMenuCard({
  open,
  onScrimClick,
  onSearchClick,
  onNearbyClick,
  onInviteClick,
}: AddFriendMenuCardProps) {
  return (
    <>
      {open && <Scrim onClick={onScrimClick} />}
      <MenuCard $open={open}>
        <MenuRow type="button" onClick={onSearchClick}>
          <UserRoundSearch size={20} />
          닉네임으로 찾기
        </MenuRow>
        <MenuRow type="button" onClick={onNearbyClick}>
          <MapPin size={20} />
          주변 친구 찾기
        </MenuRow>
        <MenuRow type="button" onClick={onInviteClick}>
          <QrCode size={20} />
          링크·QR로 초대
        </MenuRow>
      </MenuCard>
    </>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9;
`;

const MenuCard = styled.div<{ $open: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  display: flex;
  flex-direction: column;
  min-width: 190px;
  padding: 8px;
  background-color: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
  transform-origin: bottom right;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? "scale(1) translateY(0)" : "scale(0.92) translateY(8px)"};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.15s ease;
  z-index: 10;
`;

const MenuRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 10px;
  border: none;
  background: none;
  border-radius: 14px;
  color: #1c1c1e;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  outline: none;

  & > svg {
    flex-shrink: 0;
    color: #5e92f0;
  }

  &:active {
    background-color: #f1f3f5;
  }
`;
