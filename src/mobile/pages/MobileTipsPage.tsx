import styled from "styled-components";
import { useEffect, useState } from "react";
import TipsPageTitle from "../components/tips/TipsPageTitle";
import CategorySelector from "../components/common/CategorySelector";
import { useLocation } from "react-router-dom";
import ViewModeButtons from "../components/tips/ViewModeButtons";
import TipsListContainer from "../containers/tips/TipsListContainer";
import SerachForm from "../containers/home/SerachForm";
import { useResetTipsStore } from "../../reducer/resetTipsStore";

export default function MobileTipsPage() {
  const location = useLocation();
  const [category, setCategory] = useState("전체");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [docType, setDocType] = useState(""); // TIPS 또는 NOTICE
  const [query, setQuery] = useState("");
  const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독

  useEffect(() => {
    if (location.pathname.includes("/tips")) {
      if (location.pathname.includes("/tips/notice")) {
        setDocType("NOTICE");
        setQuery("");
      } else if (location.pathname.includes("/tips/search")) {
        setDocType("SEARCH");
        const params = new URLSearchParams(location.search);
        setQuery(params.get("query") || "");
      } else {
        setDocType("TIPS");
        setQuery("");
      }
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    setCategory("전체");
  }, [docType]);

  return (
    <MobileTipsPageWrapper>
      {docType !== "NOTICE" && <SerachForm />}
      <TitleCategorySelectorWrapper>
        <TipsPageTitle value={docType + (query ? ` - ${query}` : "")} />
        <ViewModeButtonCategorySelectorWrapper>
          {docType !== "SEARCH" && (
            <CategorySelector
              value={category}
              onChange={setCategory}
              docType={docType}
            />
          )}
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
  height: 100%;
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
