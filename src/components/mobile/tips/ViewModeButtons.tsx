import styled from "styled-components";

import { GridViewIcon, ListViewIcon } from "@/resources/assets/icons/mobile-tips";

interface ViewModeButtonsProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export default function ViewModeButtons({
  viewMode,
  setViewMode,
}: ViewModeButtonsProps) {
  return (
    <ViewModeButtonsWrapper>
      <ViewButton
        as={GridViewIcon}
        onClick={() => setViewMode("grid")}
        $active={viewMode === "grid"}
        aria-label="Grid View"
      />
      <ViewButton
        as={ListViewIcon}
        onClick={() => setViewMode("list")}
        $active={viewMode === "list"}
        aria-label="RestroomList View"
      />
    </ViewModeButtonsWrapper>
  );
}

const ViewModeButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

// 원래 활성/비활성 두 장(파랑 #9CAFE2 / 회색 #D6D1D5)이던 아이콘을
// currentColor 한 장으로 합쳤다. 활성 여부는 이제 color CSS로 재현한다.
const ViewButton = styled.svg<{ $active: boolean }>`
  width: 16px;
  height: 16px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? "#9CAFE2" : "#D6D1D5")};
`;
