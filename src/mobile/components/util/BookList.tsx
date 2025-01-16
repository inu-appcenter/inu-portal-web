import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BookSummary } from "types/books";
import { getBooksList, getBoksListAvailable } from "apis/books";
import styled from "styled-components";
import BookDetail from "./BookDetail";

function decodeBase64(base64String: string): string {
  return `data:image/jpeg;base64,${base64String}`;
}

export default function BookList({ reloadKey }: { reloadKey: number }) {
  const [available, setAvailable] = useState(true);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  // 책 리스트를 가져오는 함수
  const fetchBooks = async (currentPage: number, reset = false) => {
    try {
      const response = available
        ? await getBoksListAvailable(currentPage)
        : await getBooksList(currentPage);
      const newBooks = response.contents;
      console.log(response);
      setBooks((prevBooks) => (reset ? newBooks : [...prevBooks, ...newBooks]));
      setHasMore(currentPage < response.pages);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // 무한 스크롤에서 호출될 함수
  const loadMoreBooks = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBooks(nextPage);
  };

  // 필터 변경 시 동작
  const handleFilterChange = (isAvailable: boolean) => {
    setAvailable(isAvailable);
    setPage(1);
    setHasMore(true);
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchBooks(1, true);
  }, [available, reloadKey]);

  return (
    <>
      {selectedBookId && (
        <BookDetail
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
        />
      )}
      <BookListWrapper>
        <FilterButtons>
          <button
            className={available ? "selected" : ""}
            onClick={() => handleFilterChange(!available)}
          >
            판매 중
          </button>
        </FilterButtons>

        <InfiniteScroll
          dataLength={books.length}
          next={loadMoreBooks}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          endMessage={<p>모든 책을 불러왔습니다.</p>}
        >
          {books.map((book) => (
            <BookCard key={book.id} onClick={() => setSelectedBookId(book.id)}>
              <img src={decodeBase64(book.thumbnail)} alt={book.name} />
              <div>
                <h3>{book.name}</h3>
                <p>{book.author}</p>
              </div>
              <div>{book.transactionStatus}</div>
            </BookCard>
          ))}
        </InfiniteScroll>
      </BookListWrapper>
    </>
  );
}

const BookListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;

  button {
    padding: 8px 16px;
    font-size: 14px;
    border: 1px solid #ccc;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  .selected {
    background-color: #007bff;
    color: white;
    border: none;
  }
`;

const BookCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;

  img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }

  h3 {
    font-size: 16px;
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #555;
    margin: 4px 0 0;
  }
`;
