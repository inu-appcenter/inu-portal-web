import { useState, useEffect } from "react";
import styled from "styled-components";
import { getPosts } from "../../utils/API/Posts";
import { getNotices } from "../../utils/API/Notices";
import { search } from "../../utils/API/Search";
import { useNavigate } from "react-router-dom";
import Heart from "../../resource/assets/heart.svg";
import Pagination from "./Pagination";
import SortDropBox from "../common/SortDropBox";

interface Document {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  createDate: string;
  modifiedDate: string;
  url: string;
}

interface TipsDocumentsProps {
  docState: DocState;
  setDocState: (docState: DocState) => void;
}

export default function TipsDocuments({
  docState,
  setDocState,
}: TipsDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState<number>(1);

  const setSort = (sort: string) => {
    setDocState({
      query: docState.query,
      docType: docState.docType,
      selectedCategory: docState.selectedCategory,
      sort,
      page: docState.page,
    });
  };

  const setPage = (page: string) => {
    setDocState({
      query: docState.query,
      docType: docState.docType,
      selectedCategory: docState.selectedCategory,
      sort: docState.sort,
      page,
    });
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (docState.docType === "NOTICE") {
        const docs = await getNotices(
          docState.selectedCategory,
          docState.sort,
          docState.page
        );
        if (docs.status === 200) {
          setTotalPages(docs.body.data.pages);
          setDocuments(docs.body.data.notices);
        }
      } else if (docState.docType === "TIPS") {
        if (docState.selectedCategory === "검색결과") {
          const docs = await search(
            docState.query,
            docState.sort,
            docState.page
          );
          setTotalPages(docs.body.data.pages);
          setDocuments(docs.body.data.posts);
        } else if (docState.selectedCategory) {
          const docs = await getPosts(
            docState.selectedCategory,
            docState.sort,
            docState.page
          );
          setTotalPages(docs.body.data.pages);
          setDocuments(docs.body.data.posts);
        }
      }
    };

    fetchDocuments();
  }, [docState]);

  const handleDocumentClick = (id: number, url: string) => {
    if (docState.docType === "NOTICE") {
      window.open("https://" + url, "_blank");
    } else {
      navigate(`/tips/${id}`);
    }
  };

  return (
    <TipsDocumentsWrapper>
      <div>
        {documents && (
          <GridContainer>
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                onClick={() => handleDocumentClick(document.id, document.url)}
              >
                <Card1>
                  <DocumentCategory>
                    <CategoryText>{document.category}</CategoryText>
                    <CategoryUnderbar />
                  </DocumentCategory>
                  {docState.docType === "TIPS" ? (
                    <DocumentLike>
                      <img src={Heart} alt="Heart" />
                      <LikeNum>{document.like}</LikeNum>
                    </DocumentLike>
                  ) : (
                    <></>
                  )}
                </Card1>
                {docState.docType === "TIPS" ? (
                  <Card2>
                    <DocumentTitle>{document.title}</DocumentTitle>
                    <DocumentContent>{document.content}</DocumentContent>
                  </Card2>
                ) : (
                  <Card2>
                    <DocumentContent>{document.writer}</DocumentContent>
                    <DocumentTitle>{document.title}</DocumentTitle>
                  </Card2>
                )}
                <DocumentDate>{document.createDate}</DocumentDate>
              </DocumentCard>
            ))}
          </GridContainer>
        )}
      </div>
      <Bottom>
        <div style={{ flexGrow: 1, alignSelf: "center" }}>
          <SortDropBox sort={docState.sort} setSort={setSort} />
        </div>
        <div style={{ flexGrow: 1, alignSelf: "center" }}>
          <Pagination
            totalPages={totalPages}
            currentPage={parseInt(docState.page)}
            setPage={setPage}
          />
        </div>
        <div style={{ flexGrow: 1 }} />
      </Bottom>
    </TipsDocumentsWrapper>
  );
}

// Styled Components
const TipsDocumentsWrapper = styled.div`
  flex-grow: 1;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  overflow-y: auto;
  gap: 20px;
  padding: 20px;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 0 10px;
    gap: 10px;
  }
`;

const DocumentCard = styled.div`
  padding: 20px;
  border: 2px solid #aac9ee;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  width: 226px;
  height: 271px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    height: 100%;
    gap: 10px;
    width: 80%;
  }
`;

const Card1 = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const DocumentCategory = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryText = styled.div`
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: #0e4d9d;
  margin-bottom: 4px;
`;

const CategoryUnderbar = styled.div`
  height: 1px;
  width: 100%;
  background-color: #7aa7e5;
`;

const DocumentLike = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LikeNum = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

const Card2 = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DocumentTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const DocumentContent = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #888888;
  overflow: hidden;
  margin-bottom: 6px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const DocumentDate = styled.div`
  font-size: 30px;
  font-weight: 700;
  color: #7aa7e5;
  text-align: center;
`;

const Bottom = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 10px;
`;
