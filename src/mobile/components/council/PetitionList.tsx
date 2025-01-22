import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PetitionSummary } from "types/petitions";
import { getPetitionsList } from "apis/petitions";
import styled from "styled-components";
import PetitionDetail from "./PetitionDetail";

export default function PetitionList({ reloadKey }: { reloadKey: number }) {
  const [petitions, setPetitions] = useState<PetitionSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
      {selectedId && (
        <PetitionDetail
          petitionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
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
              onClick={() => setSelectedId(petition.id)}
            >
              <img
                src={`https://portal.inuappcenter.kr/images/petition/thumbnail/${petition.id}`}
                alt={petition.title}
              />
              <div>
                <h3>{petition.title}</h3>
                <p>{petition.writer}</p>
              </div>
              <div>{petition.createDate}</div>
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
`;
