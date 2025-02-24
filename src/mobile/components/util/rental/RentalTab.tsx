import styled from "styled-components";

// TabButton을 함수형 컴포넌트로 정의
const TabButton = ({
                       text,
                       isSelected,
                       onClick,
                   }: {
    text: string;
    isSelected: boolean;
    onClick: () => void;
}) => {
    return (
        <TabButtonWrapper isSelected={isSelected} onClick={onClick}>
            {text}
        </TabButtonWrapper>
    );
};

const RentalTab = ({
                       handleTabClick,
                       selectedTab,
                   }: {
    handleTabClick: any;
    selectedTab: any;
}) => {
    return (
        <TabWrapper>
            <TabButton
                text={"방송장비"}
                isSelected={selectedTab === "broadcast_equipment"}
                onClick={() => handleTabClick("broadcast_equipment")}
            />
            <TabButton
                text={"천막"}
                isSelected={selectedTab === "tent"}
                onClick={() => handleTabClick("tent")}
            />
            <TabButton
                text={"체육물품"}
                isSelected={selectedTab === "sports_equipment"}
                onClick={() => handleTabClick("sports_equipment")}
            />
            <TabButton
                text={"기타"}
                isSelected={selectedTab === "other"}
                onClick={() => handleTabClick("other")}
            />
        </TabWrapper>
    );
};

const TabWrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
`;

const TabButtonWrapper = styled.div<{ isSelected: boolean }>`
    width: fit-content;
    height: fit-content;
    padding: 4px 20px;
    box-sizing: border-box;
    border-bottom: 2px solid ${({isSelected}) => (isSelected ? "#0E4D9D" : "#B5B5B5")};
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 28px;
    /* identical to box height, or 184% */
    letter-spacing: 1.14801px;

    text-align: center;
    color: ${({isSelected}) =>
            isSelected ? "#0E4D9D" : "#B5B5B5"}; /* 회색 계열로 변경 */
    cursor: pointer;
`;

export default RentalTab;
