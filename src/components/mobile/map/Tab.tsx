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

const Tab = ({
  handleTabClick,
  selectedTab,
}: {
  handleTabClick: any;
  selectedTab: any;
}) => {
  return (
    <TabWrapper>
      <TabButton
        text={"학교"}
        isSelected={selectedTab === "학교"}
        onClick={() => handleTabClick("학교")}
      />
      <TabButton
        text={"휴게실"}
        isSelected={selectedTab === "휴게실"}
        onClick={() => handleTabClick("휴게실")}
      />
      <TabButton
        text={"카페"}
        isSelected={selectedTab === "카페"}
        onClick={() => handleTabClick("카페")}
      />
      <TabButton
        text={"식당/편의점"}
        isSelected={selectedTab === "식당"}
        onClick={() => handleTabClick("식당")}
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
  min-width: fit-content;
  height: fit-content;
  padding: 4px 15px;
  box-sizing: border-box;
  border-bottom: 2px solid
    ${({ isSelected }) => (isSelected ? "#0E4D9D" : "#B5B5B5")};
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 28px;
  /* identical to box height, or 184% */
  letter-spacing: 1.14801px;

  text-align: center;
  color: ${({ isSelected }) =>
    isSelected ? "#0E4D9D" : "#B5B5B5"}; /* 회색 계열로 변경 */
  cursor: pointer;
`;

export default Tab;
