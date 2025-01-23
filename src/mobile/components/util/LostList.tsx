import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LostSummary } from "types/lost";
import { getLostList } from "apis/lost";
import styled from "styled-components";
import LostDetail from "./LostDetail";

export default function LostList({ reloadKey }: { reloadKey: number }) {
  const [losts, setLosts] = useState<LostSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 리스트를 가져오는 함수
  const fetchList = async (currentPage: number, reset = false) => {
    try {
      const response = await getLostList(currentPage);
      const newLosts = response.data.contents;
      setLosts((prevLosts) => (reset ? newLosts : [...prevLosts, ...newLosts]));
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

  // 초기 데이터 로드
  useEffect(() => {
    fetchList(1, true);
  }, [reloadKey]);

  return (
    <>
      {selectedId && (
        <LostDetail lostId={selectedId} onClose={() => setSelectedId(null)} />
      )}
      <ListWrapper>
        <InfiniteScroll
          dataLength={losts.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          endMessage={<p>모든 분실물을 불러왔습니다.</p>}
        >
          {losts.map((lost) => (
            <BookCard key={lost.id} onClick={() => setSelectedId(lost.id)}>
              {lost.imageCount > 0 ? (
                <img
                  src={`https://portal.inuappcenter.kr/images/lost/thumbnail/${lost.id}`}
                  alt={lost.name}
                />
              ) : (
                <span />
              )}
              <div>
                <h3>{lost.name}</h3>
              </div>
              <div>{lost.createDate}</div>
            </BookCard>
          ))}
        </InfiniteScroll>
      </ListWrapper>
    </>
  );
}

const ListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

  span {
    width: 50px;
    height: 50px;
  }
`;
