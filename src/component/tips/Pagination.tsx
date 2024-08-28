import styled from "styled-components";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setPage: (page: string) => void;
}

export default function Pagination({
  totalPages,
  currentPage,
  setPage,
}: PaginationProps) {
  const pageNumbers: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <PaginationWrapper>
      {pageNumbers.map((number) => (
        <span
          key={number}
          className={`page-item ${number === currentPage ? "active" : ""}`}
          onClick={() => setPage(number.toString())}
        >
          {number}
        </span>
      ))}
    </PaginationWrapper>
  );
}

// Styled Components
const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;

  .page-item {
    cursor: url("/pointers/cursor-pointer.svg"), pointer;
    padding: 5px 10px;
    font-weight: 600;

    &:hover {
      background-color: #7aa7e5;
      color: #ffffff;
    }
  }

  .active {
    color: #ffffff;
    background-color: #7aa7e5;
  }
`;
