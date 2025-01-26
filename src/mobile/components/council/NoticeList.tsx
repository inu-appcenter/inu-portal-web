import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { CouncilNotice } from "types/councilNotices";
import { getCouncilNoticesList } from "apis/councilNotices";
import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate";

export default function NoticeList({ reloadKey }: { reloadKey: number }) {
  const [notices, setNotices] = useState<CouncilNotice[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const mobileNavigate = useMobileNavigate();

  // 리스트를 가져오는 함수
  const fetchList = async (currentPage: number, reset = false) => {
    try {
      const response = await getCouncilNoticesList("", currentPage);
      const newCouncilNotices = response.data.contents;
      setNotices((prevNotices) =>
        reset ? newCouncilNotices : [...prevNotices, ...newCouncilNotices]
      );
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
      <ListWrapper>
        <InfiniteScroll
          dataLength={notices.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          endMessage={<p>모든 공지사항을 불러왔습니다.</p>}
        >
          {notices.map((notice) => (
            <BookCard
              key={notice.id}
              onClick={() =>
                mobileNavigate(`/councilnoticedetail?id=${notice.id}`)
              }
            >
              {notice.imageCount > 0 ? (
                <img
                  src={`https://portal.inuappcenter.kr/images/councilNotice/thumbnail/${notice.id}`}
                  alt={notice.title}
                />
              ) : (
                <span />
              )}
              <div>
                <h3>{notice.title}</h3>
                <div>{notice.createDate}</div>
                <div>조회수: {notice.view}</div>
              </div>
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

  div {
    overflow-x: hidden;
  }
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
