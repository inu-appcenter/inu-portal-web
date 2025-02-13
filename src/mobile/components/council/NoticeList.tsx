import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { CouncilNotice } from "types/councilNotices";
import { getCouncilNoticesList } from "apis/councilNotices";
import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate";
import eyeImg from "resources/assets/posts/eye.svg";

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
                  className="thumbnail"
                  src={`https://portal.inuappcenter.kr/images/councilNotice/thumbnail/${notice.id}?v=${notice.modifiedDate}`}
                  alt={notice.title}
                />
              ) : (
                <span className="thumbnail" />
              )}
              <div className="card-right">
                <h3>{notice.title}</h3>
                <div className="card-bottom">
                  <p className="create-date">{notice.createDate}</p>
                  <div className="view">
                    <img src={eyeImg} alt="조회수" />
                    <p>{notice.view}</p>
                  </div>
                </div>
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
    border-right: 1px solid rgba(122, 167, 229, 1);
    border-radius: 7px 0 0 7px;
  }

  .card-right {
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

  .card-bottom {
    display: flex;
    justify-content: space-between;
  }

  .create-date {
    color: rgba(122, 167, 229, 1);
  }

  .view {
    display: flex;
    gap: 6px;
    align-items: center;
    img {
      width: 12px;
    }
    p {
      font-size: 12px;
    }
  }
`;
