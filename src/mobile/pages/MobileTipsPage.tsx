import styled from "styled-components";
import { useState } from "react";
import TipsPageTitle from "mobile/components/tips/TipsPageTitle";
import CategorySelector from "mobile/components/common/CategorySelector";
import { useLocation } from "react-router-dom";
import ViewModeButtons from "mobile/components/tips/ViewModeButtons";
import TipsListContainer from "mobile/containers/tips/TipsListContainer";
import SerachForm from "mobile/containers/home/SerachForm";
import { useResetTipsStore } from "reducer/resetTipsStore";

export default function MobileTipsPage() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독
  const params = new URLSearchParams(location.search);
  const query = params.get("search") || "";
  let docType = "TIPS";
  if (query) {
    docType = "SEARCH";
  } else if (params.get("type") === "notice") {
    docType = "NOTICE";
  }
  const category = params.get("category") || "전체";

  return (
    <MobileTipsPageWrapper>
      {!(docType === "NOTICE") && <SerachForm />}
      <TitleCategorySelectorWrapper>
        <TipsPageTitle value={docType + (query ? ` - ${query}` : "")} />
        <ViewModeButtonCategorySelectorWrapper>
          {docType !== "SEARCH" && <CategorySelector />}
          <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
        </ViewModeButtonCategorySelectorWrapper>
      </TitleCategorySelectorWrapper>
      <Wrapper>
        <TipsListContainer
          key={resetKey}
          viewMode={viewMode}
          docType={docType}
          category={category}
          query={query}
        />
      </Wrapper>
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 16px 0 16px;
  width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewModeButtonCategorySelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;
