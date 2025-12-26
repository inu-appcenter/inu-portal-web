// SortDropBox.tsx
import styled from "styled-components";

interface SortDropBoxProps {
  sort: string;
  setSort: (sort: string) => void;
}

export default function SortDropBox({ sort, setSort }: SortDropBoxProps) {
  return (
    <DropBoxWrapper>
      <button
        className={sort === "date" ? "point" : ""}
        onClick={() => setSort("date")}
      >
        최신순
      </button>

      <button
        className={sort === "view" ? "point" : ""}
        onClick={() => setSort("view")}
      >
        인기순
      </button>
    </DropBoxWrapper>
  );
}

const DropBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  margin-bottom: 16px;
  gap: 12px;

  button {
    font-size: 14px;
    background-color: transparent;
    border: none;
    color: black;
    padding: 0;
  }
  .point {
    color: #20559e;
    font-weight: 800;
  }
`;
