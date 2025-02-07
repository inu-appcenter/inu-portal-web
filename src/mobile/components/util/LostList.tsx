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
              <div className="card-left">
                <h3>{lost.name}</h3>
                <p>{lost.content}</p>
                <p className="create-date">{lost.createDate}</p>
              </div>
              {lost.imageCount > 0 ? (
                <img
                  className="thumbnail"
                  src={`https://portal.inuappcenter.kr/images/lost/thumbnail/${lost.id}?v=${lost.modifiedDate}`}
                  alt={lost.name}
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
