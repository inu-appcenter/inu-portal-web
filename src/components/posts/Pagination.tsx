import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Pagination({ pages }: { pages: number }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPage(Number(params.get("page")) || 1);
  }, [location.search]);

  const handleClickPage = (page: number) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(page));
    navigate(`/posts?${params.toString()}`);
  };

  return (
    <PaginationWrapper>
      {Array.from({ length: pages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <PageButton
            key={pageNumber}
            $isSelected={pageNumber === page}
            onClick={() => handleClickPage(pageNumber)}
          >
            {pageNumber}
          </PageButton>
        )
      )}
    </PaginationWrapper>
  );
}

const PaginationWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
`;

const PageButton = styled.button<{ $isSelected: boolean }>`
  background-color: ${({ $isSelected }) =>
    $isSelected ? "rgba(122, 167, 229, 1)" : "#ffffff"};
  color: ${({ $isSelected }) =>
    $isSelected ? "#ffffff" : "rgba(101, 101, 101, 1)"};
  border: none;
  width: 32px;
  height: 32px;
  font-size: 20px;
  font-weight: 600;
`;
