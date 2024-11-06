import { useEffect, useState } from "react";
import styled from "styled-components";
import { result } from "../../utils/API/GenTorchy";
import { getFiresV2 } from "../../utils/API/Fires";
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
  eta?: number;
  prompt?: string;
}

export default function AiGallery() {
  const [imageRequests, setImageRequests] = useState<ImageRequest[]>([]);
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [page, setPage] = useState(1); // 페이지네이션을 위한 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const user = useSelector((state: loginInfo) => state.user);

  useEffect(() => {
    fetchImageRequests();
  }, [page]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | undefined;

    if (isRefreshDisabled && refreshCountdown > 0) {
      countdownInterval = setInterval(() => {
        setRefreshCountdown((prev) => prev - 1);
      }, 1000);
    } else if (refreshCountdown === 0) {
      setIsRefreshDisabled(false);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isRefreshDisabled, refreshCountdown]);

  const fetchImageRequests = async () => {
    try {
      const response = await getFiresV2(user.token, page);
      if (response.status === 200) {
        const { fires, pages } = response.body.data;
        setTotalPages(pages);

        const requests = await Promise.all(
          fires.map(async (fire: { request_id: string; prompt: string }) => {
            const res = await result(fire.request_id);
            if (res.status === 201) {
              return {
                id: fire.request_id,
                status: "success",
                b64_img: res.body.b64_img,
                prompt: fire.prompt,
              };
            } else if (res.status === 202 || res.status === 203) {
              return {
                id: fire.request_id,
                status: res.body.status,
                request_ahead: res.body.requests_ahead,
                eta: res.body.eta,
                prompt: fire.prompt,
              };
            } else {
              return {
                id: fire.request_id,
                status: "not_found",
                prompt: fire.prompt,
              };
            }
          })
        );

        setImageRequests(requests);
      } else {
        console.error("이미지 정보 요청 실패:", response.status);
      }
    } catch (error) {
      console.error("Error fetching image requests:", error);
    }
  };

  const handleRefreshClick = async () => {
    setIsRefreshDisabled(true);
    setRefreshCountdown(5);

    const updatedResults = await Promise.all(
      imageRequests.map(async (req) => {
        if (req.status === "generating") {
          const response = await result(req.id);
          if (response.status === 201) {
            return {
              id: req.id,
              status: "success",
              b64_img: response.body.b64_img,
              prompt: req.prompt,
            };
          } else {
            return {
              id: req.id,
              status: response.body.status,
              request_ahead: response.body.requests_ahead,
              eta: response.body.eta,
              prompt: req.prompt,
            };
          }
        }
        return req;
      })
    );

    setImageRequests(updatedResults);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div>
      <GalleryWrapper>
        {imageRequests.map((req) =>
          req.status === "success" && req.b64_img ? (
            <ImageContainer key={req.id}>
              <GalleryImage
                src={`data:image/png;base64,${req.b64_img}`}
                alt="AI 생성 이미지"
              />
              <PromptText>{req.prompt}</PromptText>
            </ImageContainer>
          ) : (
            <GalleryStatus key={req.id}>
              {req.status === "queued" ? (
                <>
                  <p>대기 중</p>
                  <p>앞선 요청 수: {req.request_ahead}</p>
                  <p>예상 대기 시간: {req.eta}초</p>
                </>
              ) : req.status === "generating" ? (
                <>
                  <p>생성 중</p>
                  <p>남은 요청 수: {req.request_ahead}</p>
                  <p>예상 완료 시간: {req.eta}초</p>
                </>
              ) : (
                <p>이미지를 찾을 수 없습니다</p>
              )}
            </GalleryStatus>
          )
        )}
      </GalleryWrapper>
      <ButtonsWrapper>
        <RefreshButton
          disabled={isRefreshDisabled}
          onClick={handleRefreshClick}
        >
          {isRefreshDisabled ? `새로고침 (${refreshCountdown})` : "새로고침"}
        </RefreshButton>
        <PaginationWrapper>
          <PageButton onClick={handlePreviousPage} disabled={page === 1}>
            이전
          </PageButton>
          <PageInfo>
            {page} / {totalPages}
          </PageInfo>
          <PageButton onClick={handleNextPage} disabled={page === totalPages}>
            다음
          </PageButton>
        </PaginationWrapper>
        <span />
      </ButtonsWrapper>
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

const RefreshButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  background-color: #6d4dc7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const PromptText = styled.p`
  margin-top: 8px;
  font-size: 14px;
  color: #333;
  text-align: center;
`;

const GalleryStatus = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 10px;

  p {
    margin: 5px 0;
    font-size: 14px;
    color: #555;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 20px 20px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  margin: 0 8px;
  font-size: 16px;
  font-weight: bold;
  background-color: #6d4dc7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageInfo = styled.span`
  font-size: 16px;
  font-weight: bold;
`;
