import React from 'react';
import styled from 'styled-components';

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;

  .page-item {
    margin: 0 5px;
    cursor: pointer;
    padding: 5px 10px;
    font-weight: 600;

    &:hover {
      background-color: #7AA7E5;
      color: #FFFFFF;
    }
  }

  .active {
    color: #FFFFFF;
    background-color: #7AA7E5;
  }
`;

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setPage: (page: string) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setPage }) => {
  const pageNumbers: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <PaginationWrapper>
      {pageNumbers.map(number => (
        <span key={number} 
              className={`page-item ${number === currentPage ? 'active' : ''}`} 
              onClick={() => setPage(number.toString())}>
          {number}
        </span>
      ))}
    </PaginationWrapper>
  );
};

export default Pagination;
