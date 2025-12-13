import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BookSummary } from "@/types/books.ts";
import {
  getBoksListAvailable,
  getBooksList,
  getBooksSearch,
} from "@/apis/books.ts";
import styled from "styled-components";
import BookDetail from "./BookDetail.tsx";
import X_Vector from "../../../../resources/assets/mobile-mypage/X-Vector.svg";
import HowToBuy from "../../../../components/desktop/book/HowToBuy.tsx";

import 안내횃불이 from "@/resources/assets/book/안내횃불이.png";

import SerachForm from "./BookSearchForm.tsx";

export default function BookList({ reloadKey }: { reloadKey: number }) {
  const [available, setAvailable] = useState(true);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [show, setShow] = useState(false); //모달창 열림 여부

  const params = new URLSearchParams(location.search);
  let query = params.get("search") || "";
  const navigate = useNavigate();

  // 리스트를 가져오는 함수
  const fetchList = async (currentPage: number, reset = false) => {
    try {
      const response = query
        ? await getBooksSearch(query, currentPage)
        : available
          ? await getBoksListAvailable(currentPage)
          : await getBooksList(currentPage);
      const newBooks = response.data.contents;
      setBooks((prevBooks) => (reset ? newBooks : [...prevBooks, ...newBooks]));
      setHasMore(currentPage < response.data.pages);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  // 무한 스크롤에서 호출될 함수
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchList(nextPage);
  };

  // 필터 변경 시 동작
  const handleFilterChange = (isAvailable: boolean) => {
    setAvailable(isAvailable);
    setPage(1);
    setHasMore(true);
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchList(1, true);
  }, [available, reloadKey, query]);

  return (
    <>
      {selectedId && (
        <BookDetail bookId={selectedId} onClose={() => setSelectedId(null)} />
      )}
      <ListWrapper>
        <SerachForm />
        <FilterButtons>
          {query ? (
            <button
              className=""
              onClick={() => navigate(`/home/util?type=book`)}
            >
              검색 초기화
            </button>
          ) : (
            <>
              <button
                className={available ? "selected" : ""}
                onClick={() => handleFilterChange(true)}
              >
                판매 중
              </button>
              <button
                className={!available ? "selected" : ""}
                onClick={() => handleFilterChange(false)}
              >
                전체
              </button>
            </>
          )}
          <button className={"info selected"} onClick={() => setShow(true)}>
            <img src={안내횃불이} />
            구매 방법 알아보기
          </button>
        </FilterButtons>

        {show && (
          <ModalBackGround>
            <Modal>
              <div className="close" onClick={() => setShow(false)}>
                <span>닫기</span>
                <img src={X_Vector} alt="X" />
              </div>
              {/* <AiIntroText /> */}
              <HowToBuy />
            </Modal>
          </ModalBackGround>
        )}

        <InfiniteScroll
          dataLength={books.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          endMessage={<p>모든 책을 불러왔습니다.</p>}
        >
          {books.map((book) => (
            <BookCard key={book.id} onClick={() => setSelectedId(book.id)}>
              <div className="card-left">
                <h3>
                  {book.name} - {book.author}
                </h3>
                <p>판매 가격: {book.price}</p>
                <div className="isAvailable">
                  <span>
                    {book.transactionStatus == "AVAILABLE"
                      ? "판매중"
                      : "판매 중지"}
                  </span>
                </div>
              </div>
              {book.imageCount > 0 ? (
                <img
                  className="thumbnail"
                  src={`https://portal.inuappcenter.kr/images/book/thumbnail/${book.id}?v=${book.modifiedDate}`}
                  alt={book.name}
                />
              ) : (
                <span className="thumbnail" />
              )}
            </BookCard>
          ))}
        </InfiniteScroll>
      </ListWrapper>
    </>
  );
}

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  position: relative; /* 버튼의 absolute 배치를 위해 추가 */
  margin-top: 12px;

  button {
    font-size: 14px;
    font-weight: 400;
    background-color: transparent;
    border: none;
    margin-bottom: 8px;
    color: black;
  }

  .selected {
    color: rgba(14, 77, 157, 1);
    font-weight: 600;
  }

  .info {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    img {
      width: 30px;
    }
  }
`;

const ListWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  //padding: 0 12px;
`;

const BookCard = styled.div`
  display: flex;
  border: 1px solid rgba(122, 167, 229, 1);
  border-radius: 8px;
  background-color: white;
  margin-bottom: 12px;
  position: relative;
  height: 96px;

  .thumbnail {
    min-width: 96px;
    max-width: 96px;
    height: 96px;
    object-fit: cover;
    box-sizing: border-box;
    padding: 8px;
    border-radius: 16px;
  }

  .card-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 8px;
    justify-content: space-between;

    .isAvailable {
      span {
        font-size: 12px;
        font-weight: 500;
        color: #303030;
        padding: 2px 8px;
        background-color: #ecf4ff;
        border-radius: 8px;
      }
    }
  }

  h3 {
    font-weight: 500;
    font-size: 14px;
    margin: 0;
    color: rgba(34, 17, 18, 1);
    max-width: 240px;
    overflow-x: hidden;
  }

  p {
    font-size: 14px;
    color: #555;
    margin: 0;
  }

  .create-date {
    color: rgba(122, 167, 229, 1);
  }
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  padding: 32px 12px;
  border-radius: 16px;
  width: 95%;
  height: 80%;
  background: linear-gradient(90deg, #6084d7 0%, #c294eb 100%);

  .close {
    display: flex;
    gap: 8px;
    background-color: white;
    width: 64px;
    height: 32px;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
  }
`;
