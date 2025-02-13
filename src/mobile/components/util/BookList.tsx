import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BookSummary } from "types/books";
import { getBooksList, getBoksListAvailable } from "apis/books";
import styled from "styled-components";
import BookDetail from "./BookDetail";

export default function BookList({ reloadKey }: { reloadKey: number }) {
  const [available, setAvailable] = useState(true);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 리스트를 가져오는 함수
  const fetchList = async (currentPage: number, reset = false) => {
    try {
      const response = available
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
  }, [available, reloadKey]);

  return (
    <>
      {selectedId && (
        <BookDetail bookId={selectedId} onClose={() => setSelectedId(null)} />
      )}
      <ListWrapper>
        <FilterButtons>
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
        </FilterButtons>

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
                <div>
                  {book.transactionStatus == "AVAILABLE"
                    ? "판매중"
                    : "판매 중지"}
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
`;

const ListWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 12px;
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
