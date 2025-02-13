import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PetitionSummary } from "types/petitions";
import { getPetitionsList } from "apis/petitions";
import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate";
import Secret from "resources/assets/mobile-council/secret.svg";
import heartFilledImg from "resources/assets/posts/heart-filled.svg";

export default function PetitionList({ reloadKey }: { reloadKey: number }) {
  const [petitions, setPetitions] = useState<PetitionSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const mobileNavigate = useMobileNavigate();

  // 리스트를 가져오는 함수
  const fetchList = async (currentPage: number, reset = false) => {
    try {
      const response = await getPetitionsList(currentPage);
      const newPetitions = response.data.contents;
      console.log(response);
      setPetitions((prevPetitions) =>
        reset ? newPetitions : [...prevPetitions, ...newPetitions]
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
          dataLength={petitions.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<p>Loading...</p>}
          endMessage={<p>모든 청원을 불러왔습니다.</p>}
        >
          {petitions.map((petition) => (
            <BookCard
              key={petition.id}
              onClick={() => {
                petition.title !== "비밀청원입니다." &&
                  mobileNavigate(`/petitiondetail?id=${petition.id}`);
              }}
            >
              {petition.title === "비밀청원입니다." ? (
                <>
                  <img className="secretImg" src={Secret} alt="" />
                  <h3 className="secretText">[해당 글은 비밀글입니다]</h3>
                </>
              ) : (
                <>
                  {petition.imageCount > 0 ? (
                    <img
                      className="thumbnail"
                      src={`https://portal.inuappcenter.kr/images/petition/thumbnail/${petition.id}?v=${petition.modifiedDate}`}
                      alt={petition.title}
                    />
                  ) : (
                    <span className="thumbnail" />
                  )}
                  <div className="card-right">
                    <h3>{petition.title}</h3>
                    <div className="card-bottom">
                      <p className="create-date">{petition.createDate}</p>
                      <div className="view">
                        <img src={heartFilledImg} alt="좋아요" />
                        <p>{petition.like}</p>
                      </div>
                    </div>
                  </div>
                </>
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

  .secretText {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .secretImg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

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
