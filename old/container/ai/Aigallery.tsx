import { useEffect, useState } from "react";
import styled from "styled-components";
import { result } from "old/utils/API/GenTorchy";
import { getFiresV2 } from "old/utils/API/Fires";
import { useSelector } from "react-redux";

interface loginInfo {
  user: {
    token: string;
  };
}

interface ImageRequest {
  id: string;
  status: string;
  b64_img?: string;
  request_ahead?: number;
  eta: number;
  prompt: string;
  isLoading: boolean;
  canRefresh: boolean; // 수동 새로고침 버튼 표시 여부
}

export default function AiGallery() {
  const [imageRequests, setImageRequests] = useState<ImageRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const user = useSelector((state: loginInfo) => state.user);

  useEffect(() => {
    if (user.token) {
      fetchImageRequests();
    }
  }, [page, user]);

  // ETA 감소를 위한 useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setImageRequests((prevRequests) =>
        prevRequests.map((req) => {
          if (
            (req.status === "generating" || req.status === "queued") &&
            req.eta > 0
          ) {
            const newEta = req.eta - 1;
            if (newEta <= 0) {
              // ETA가 0 이하가 되면 canRefresh를 true로 설정
              return { ...req, eta: 0, canRefresh: true };
            }
            return { ...req, eta: newEta };
          }
          return req;
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []); // 빈 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  const fetchImageRequests = async () => {
    try {
      const response = await getFiresV2(user.token, page);
      if (response.status === 200) {
        const { fires, pages } = response.body.data;
        setTotalPages(pages);

        const initialRequests = fires.map(
          (fire: { request_id: string; prompt: string }) => ({
            id: fire.request_id,
            status: "loading",
            prompt: fire.prompt,
            eta: 0,
            isLoading: true,
            canRefresh: false,
          }),
        );
        setImageRequests(initialRequests);

        // 각 요청별로 result 함수 호출
        initialRequests.forEach((req: any) => fetchResultForRequest(req));
      } else {
        console.error("이미지 정보 요청 실패:", response.status);
      }
    } catch (error) {
      console.error("Error fetching image requests:", error);
    }
  };

  const fetchResultForRequest = async (req: ImageRequest) => {
    try {
      // 새로고침 시 canRefresh를 false로 설정하고 로딩 상태로 전환
      setImageRequests((prevRequests) =>
        prevRequests.map((r) =>
          r.id === req.id ? { ...r, isLoading: true, canRefresh: false } : r,
        ),
      );

      const response = await result(req.id);
      if (response.status === 201) {
        setImageRequests((prevRequests) =>
          prevRequests.map((r) =>
            r.id === req.id
              ? {
                  ...r,
                  status: "success",
                  b64_img: response.body.b64_img,
                  isLoading: false,
                  canRefresh: false,
                }
              : r,
          ),
        );
      } else if (response.status === 202 || response.status === 203) {
        setImageRequests((prevRequests) =>
          prevRequests.map((r) =>
            r.id === req.id
              ? {
                  ...r,
                  status: response.body.status,
                  request_ahead: response.body.requests_ahead,
                  eta: response.body.eta ?? 0,
                  isLoading: false,
                  canRefresh: false,
                }
              : r,
          ),
        );
      } else {
        setImageRequests((prevRequests) =>
          prevRequests.map((r) =>
            r.id === req.id
              ? {
                  ...r,
                  status: "not_found",
                  isLoading: false,
                  canRefresh: false,
                }
              : r,
          ),
        );
      }
    } catch (error) {
      console.error(`Error fetching result for request ${req.id}:`, error);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  return (
    <div>
      <GalleryWrapper>
        {imageRequests.map((req) =>
          req.isLoading ? (
            <ImageContainer key={req.id}>
              <PromptText>{req.prompt}</PromptText>
              <Skeleton />
            </ImageContainer>
          ) : req.status === "success" && req.b64_img ? (
            <ImageContainer key={req.id}>
              <PromptText>{req.prompt}</PromptText>
              <GalleryImage
                src={`data:image/png;base64,${req.b64_img}`}
                alt="AI 생성 이미지"
              />
            </ImageContainer>
          ) : (
            <GalleryStatus key={req.id}>
              <PromptText>{req.prompt}</PromptText>
              {req.status === "queued" ? (
                <>
                  <p>대기 중</p>
                  <p>대기열: {req.request_ahead}</p>
                  {req.eta > 0 ? (
                    <p>예상 완료 시간: {req.eta}초</p>
                  ) : (
                    req.canRefresh && (
                      <SmallRefreshButton
                        onClick={() => fetchResultForRequest(req)}
                      >
                        확인 !
                      </SmallRefreshButton>
                    )
                  )}
                </>
              ) : req.status === "generating" ? (
                <>
                  <p>생성 중</p>
                  <p>대기열: {req.request_ahead}</p>
                  {req.eta > 0 ? (
                    <p>예상 완료 시간: {req.eta}초</p>
                  ) : (
                    req.canRefresh && (
                      <SmallRefreshButton
                        onClick={() => fetchResultForRequest(req)}
                      >
                        확인 !
                      </SmallRefreshButton>
                    )
                  )}
                </>
              ) : (
                <p>이미지를 찾을 수 없습니다</p>
              )}
            </GalleryStatus>
          ),
        )}
      </GalleryWrapper>
      <PaginationWrapper>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <PageNumber
              key={pageNumber}
              active={pageNumber === page}
              onClick={() => handlePageClick(pageNumber)}
            >
              {pageNumber}
            </PageNumber>
          ),
        )}
      </PaginationWrapper>
    </div>
  );
}

// Styled Components
const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2x2 grid */
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
`;

const Skeleton = styled.div`
  width: 100%;
  height: 150px;
  background-color: #e0e0e0;
  border-radius: 10px;
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: auto;
  cursor: pointer;
  border-radius: 10px;
  margin-top: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const PromptText = styled.p`
  font-size: 14px;
  color: #333;
  text-align: center;
`;

const GalleryStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 10px;
  text-align: center;

  p {
    margin: 5px 0;
    font-size: 14px;
    color: #555;
  }
`;

const SmallRefreshButton = styled.button`
  padding: 5px 10px;
  font-size: 14px;
  background-color: #6d4dc7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;
`;

const PageNumber = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  margin: 0 4px;
  font-size: 16px;
  background-color: ${(props) => (props.active ? "#6d4dc7" : "#e0e0e0")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;
