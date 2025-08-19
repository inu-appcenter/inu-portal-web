import styled from "styled-components";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import ViewModeButtons from "mobile/components/tips/ViewModeButtons";
import TipsListContainer from "mobile/containers/tips/TipsListContainer";
import SerachForm from "mobile/containers/home/SerachForm";
import { useResetTipsStore } from "reducer/resetTipsStore";
import MobileWriteButton from "mobile/components/tips/MobileWriteButton";
import CategorySelectorNew from "../components/common/CategorySelectorNew.tsx";
import MobileHeader from "../containers/common/MobileHeader.tsx";

export default function MobileBoardPage() {
  const location = useLocation();
  console.log(location.pathname);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독
  const params = new URLSearchParams(location.search);
  const query = params.get("search") || "";
  let docType = "TIPS";
  if (params.has("search")) {
    docType = "SEARCH";
  } else if (location.pathname === "/m/home/notice") {
    docType = "NOTICE";
  } else if (params.get("type") === "councilNotice") {
    docType = "COUNCILNOTICE";
  }
  const category = params.get("category") || "전체";

  return (
    <MobileTipsPageWrapper>
      <MobileHeader
        title={
          docType === "TIPS"
            ? "TIPS"
            : docType === "NOTICE"
              ? "학교 공지사항"
              : ""
        }
      />
      <TitleCategorySelectorWrapper>
        {(docType === "TIPS" || docType === "NOTICE") && (
          <CategorySelectorNew />
        )}

        <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      </TitleCategorySelectorWrapper>
      {(docType === "TIPS" || docType === "SEARCH") && <SerachForm />}

      <TipsListContainer
        key={resetKey}
        viewMode={viewMode}
        docType={docType}
        category={category}
        query={query}
      />
      {(docType === "TIPS" || docType === "SEARCH") && <MobileWriteButton />}
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  gap: 8px;
  padding: 16px;
  padding-top: 72px;

  box-sizing: border-box;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: fit-content;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;
