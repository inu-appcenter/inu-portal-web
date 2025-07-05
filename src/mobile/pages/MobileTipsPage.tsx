import styled from "styled-components";
import { useState } from "react";
import CategorySelector from "mobile/components/common/CategorySelector";
import { useLocation } from "react-router-dom";
import ViewModeButtons from "mobile/components/tips/ViewModeButtons";
import TipsListContainer from "mobile/containers/tips/TipsListContainer";
import SerachForm from "mobile/containers/home/SerachForm";
import { useResetTipsStore } from "reducer/resetTipsStore";

export default function MobileTipsPage() {
  const location = useLocation();
  console.log(location.pathname);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독
  const params = new URLSearchParams(location.search);
  const query = params.get("search") || "";
  let docType = "TIPS";
  if (params.has("search")) {
    docType = "SEARCH";
    console.log("search모드입니다.");
  } else if (location.pathname === "/m/home/notice") {
    docType = "NOTICE";
  } else if (params.get("type") === "councilNotice") {
    docType = "COUNCILNOTICE";
  }
  const category = params.get("category") || "전체";

  return (
    <MobileTipsPageWrapper>
      <TitleCategorySelectorWrapper>
        <ViewModeButtonCategorySelectorWrapper>
          {(docType === "TIPS" || docType === "NOTICE") && <CategorySelector />}
          <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
        </ViewModeButtonCategorySelectorWrapper>
      </TitleCategorySelectorWrapper>
      <div
        style={{
          width: "100%",
          paddingLeft: "16px",
          paddingRight: "16px",
          boxSizing: "border-box",
        }}
      >
        {(docType === "TIPS" || docType === "SEARCH") && <SerachForm />}
      </div>

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
  flex: 1; // ← 이거 추가!
  width: 100%;
  gap: 16px;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewModeButtonCategorySelectorWrapper = styled.div`
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;
const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;
`;
