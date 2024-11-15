import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function PostsSort() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sort, setSort] = useState("date");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("sort") === "like") {
      setSort("like");
    } else {
      setSort("date");
    }
  }, [location.search]);

  const handleClickDate = () => {
    const params = new URLSearchParams(location.search);
    params.delete("page");
    params.delete("sort");
    navigate(`/posts?${params.toString()}`);
  };

  const handleClickLike = () => {
    const params = new URLSearchParams(location.search);
    params.delete("page");
    params.set("sort", "like");
    navigate(`/posts?${params.toString()}`);
  };

  return (
    <PostsSortWrapper>
      <button
        onClick={handleClickDate}
        className={sort === "date" ? "selected" : ""}
      >
        최신순
      </button>
      <button
        onClick={handleClickLike}
        className={sort === "like" ? "selected" : ""}
      >
        인기순
      </button>
    </PostsSortWrapper>
  );
}

const PostsSortWrapper = styled.div`
  margin: 16px 24px;
  display: flex;
  gap: 4px;

  button {
    font-size: 16px;
    font-weight: 600;
    color: rgba(136, 136, 136, 1);
    border: none;
    background-color: transparent;
  }

  button.selected {
    color: #0e4d9d;
    font-weight: 700;
  }
`;
