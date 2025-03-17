import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LostSummary } from "types/lost.ts";
import { getLostList } from "apis/lost.ts";
import styled from "styled-components";
import LostDetail from "./LostDetail.tsx";
import 안내횃불이 from "resources/assets/book/안내횃불이.png";
import X_Vector from "../../../../resources/assets/mobile-mypage/X-Vector.svg";
import HowToFind from "../../../../components/lost/HowToFind.tsx";

export default function LostList({ reloadKey }: { reloadKey: number }) {
  const [losts, setLosts] = useState<LostSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [show, setShow] = useState(false); //모달창 열림 여부

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
        <button className={"info selected"} onClick={() => setShow(true)}>
          <img src={안내횃불이} />
          분실물은 어디에서 찾나요?
        </button>
        {show && (
          <ModalBackGround>
            <Modal>
              <div className="close" onClick={() => setShow(false)}>
                <span>닫기</span>
                <img src={X_Vector} alt="X" />
              </div>
              <HowToFind />
            </Modal>
          </ModalBackGround>
        )}
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
  padding: 20px 12px;

  button {
    font-size: 14px;
    font-weight: 400;
    background-color: transparent;
    border: none;
    margin-bottom: 8px;
    color: black;
  }

  .selected {
    color: rgba(14, 77, 157, 1);
    font-weight: 600;
  }

  .info {
    position: absolute;
    right: 0;
    top: 210px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    //z-index: 1;

    img {
      width: 30px;
    }
  }
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

  .create-date {
    color: rgba(122, 167, 229, 1);
  }
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  padding: 32px 12px;
  border-radius: 16px;
  width: 95%;
  height: 80%;
  background: linear-gradient(90deg, #6084d7 0%, #c294eb 100%);

  .close {
    display: flex;
    gap: 8px;
    background-color: white;
    width: 64px;
    height: 32px;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
  }
`;
