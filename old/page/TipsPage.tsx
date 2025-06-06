// TipsPage.tsx
import styled from "styled-components";
import { Routes, Route, useLocation } from "react-router-dom";
import TipsCatContainer from "../container/tips/TipsCatContainer";
import TipsDocuments from "../component/tips/TipsDocuments";
import PostDetail from "./PostDetailPage";
import { useEffect, useState } from "react";
import PostBotton from "../component/tips/PostButton";
import TipsTitle from "../component/tips/TipsTitle";
import TipsTopPosts from "../component/tips/TipsTopPosts";
import NoticesTop from "../component/tips/NoticesTop";

export default function TipsPage() {
  const location = useLocation();
  const [docState, setDocState] = useState<DocState>({
    query: "",
    docType: "", // TIPS 또는 NOTICE
    selectedCategory: "전체",
    sort: "date",
    page: "1",
  });
  const combinedLocation = `${location.pathname}${location.search}`;

  useEffect(() => {
    const queryParam = new URLSearchParams(location.search).get("query");
    if (queryParam) {
      setDocState((prev) => ({
        ...prev,
        query: queryParam,
        docType: "TIPS",
        selectedCategory: "검색결과",
        page: "1",
      }));
    } else if (location.pathname.includes("/tips/notice")) {
      setDocState((prev) => ({ ...prev, docType: "NOTICE" }));
    } else {
      setDocState((prev) => ({ ...prev, docType: "TIPS" }));
    }
  }, [combinedLocation]);

  const isWriteOrUpdatePath =
    location.pathname.includes("/tips/write") ||
    location.pathname.includes("/tips/update");

  return (
    <TipsPageWrapper>
      <TipsCatWrapper>
        <TipsCatContainer docState={docState} setDocState={setDocState} />
      </TipsCatWrapper>
      <TipsContentWrapper>
        <TipsTitle docState={docState} />
        {!isWriteOrUpdatePath &&
          (docState.docType === "NOTICE" ? (
            <NoticesTop />
          ) : (
            <TipsTopPosts selectedCategory={docState.selectedCategory} />
          ))}
        <BorderWrapper>
          <Routes>
            <Route
              index
              element={
                <TipsDocuments docState={docState} setDocState={setDocState} />
              }
            />
            <Route
              path="search"
              element={
                <TipsDocuments docState={docState} setDocState={setDocState} />
              }
            />
            <Route
              path="notice"
              element={
                <TipsDocuments docState={docState} setDocState={setDocState} />
              }
            />
            <Route path=":id" element={<PostDetail />} />
          </Routes>
        </BorderWrapper>
      </TipsContentWrapper>
      <PostBotton />
    </TipsPageWrapper>
  );
}

const TipsPageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: space-around;
  margin: auto;
  @media (max-width: 768px) {
    /* 모바일 */
    flex-direction: column;
  }
`;
const TipsCatWrapper = styled.div`
  padding: 70px 30px;
  @media (max-width: 768px) {
    /* 모바일 */
    padding: 0 5px 0 5px;
  }
`;

const TipsContentWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
`;

const BorderWrapper = styled.div`
  margin-right: 25px;
  border-style: solid;
  border-width: 5px 0 0 5px;
  border-color: #eaeaea;
  flex-grow: 1;
  @media (max-width: 768px) {
    /* 모바일 */
    border: none;
    margin-right: 0px;
    width: 90%;
  }
`;
