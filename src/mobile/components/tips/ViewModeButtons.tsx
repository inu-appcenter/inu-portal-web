import styled from "styled-components";

import gridViewIcon from "resources/assets/mobile-tips/grid-view-icon-gray.svg";
import gridViewIconActive from "resources/assets/mobile-tips/grid-view-icon-blue.svg";
import listViewIcon from "resources/assets/mobile-tips/list-view-icon-gray.svg";
import listViewIconActive from "resources/assets/mobile-tips/list-view-icon-blue.svg";

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
                onClick={() => setViewMode("grid")}
                src={viewMode === "grid" ? gridViewIconActive : gridViewIcon}
                alt="Grid View"
            />
            <ViewButton
                onClick={() => setViewMode("list")}
                src={viewMode === "list" ? listViewIconActive : listViewIcon}
                alt="RestroomList View"
            />
        </ViewModeButtonsWrapper>
    );
}

const ViewModeButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const ViewButton = styled.img`
  width: 16px;
  height: 16px;
`;
