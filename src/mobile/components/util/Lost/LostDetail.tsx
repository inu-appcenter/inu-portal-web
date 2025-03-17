import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { getLostDetail, deleteLost } from "apis/lost.ts";
import UploadLost from "./UploadLost.tsx";
import { Lost } from "types/lost.ts";
import axios, { AxiosError } from "axios";
import useUserStore from "stores/useUserStore.ts";
import useReloadKeyStore from "stores/useReloadKeyStore.ts";

interface LostDetailProps {
  lostId: number;
  onClose: () => void;
}

export default function LostDetail({ lostId, onClose }: LostDetailProps) {
  const { triggerReload } = useReloadKeyStore();
  const { userInfo } = useUserStore();
  const [lost, setLost] = useState<Lost>({
    id: -1,
    name: "",
    content: "",
    createDate: "",
    imageCount: 0,
    modifiedDate: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 상세 정보 로드
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await getLostDetail(lostId);
        setLost(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("분실물 가져오기 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 403:
              alert("비밀글입니다.");
              break;
            default:
              alert("분실물 가져오기 실패");
              break;
          }
        }
        onClose();
      }
    };
    fetchDetail();
  }, [lostId]);

  // 삭제
  const handleDelete = async () => {
    try {
      await deleteLost(lostId);
      alert("분실물이 삭제되었습니다.");
      triggerReload();
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleUploaded = () => {
    setIsEditOpen(false);
    onClose(); // 새로고침
  };

  if (!lost) return <p>Loading...</p>;

  return (
    <BottomSheet open={true} onDismiss={onClose}>
      <DetailWrapper>
        <h2>{lost.name}</h2>
        <p className="create-date">{lost.createDate}</p>
        <p>{lost.content}</p>
        {Array.from({ length: lost.imageCount }, (_, index) => {
          const imageUrl = `https://portal.inuappcenter.kr/images/lost/${
            lost.id
          }-${index + 1}?v=${lost.modifiedDate}`;
          return (
            <img
              key={index}
              src={imageUrl}
              alt={`이미지 ${index + 1}`}
              onClick={() => window.open(imageUrl)}
            />
          );
        })}
        {userInfo.role == "admin" && (
          <ButtonWrapper>
            <button onClick={() => setIsEditOpen(true)}>수정</button>
            <button onClick={handleDelete}>삭제</button>
          </ButtonWrapper>
        )}
      </DetailWrapper>

      <UploadLost
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUploaded={handleUploaded}
        initialData={lost}
      />
    </BottomSheet>
  );
}

const DetailWrapper = styled.div`
  padding: 16px;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    margin: 0;
  }

  p {
    margin: 4px 0;
  }

  img {
    width: 300px;
  }

  .create-date {
    color: rgba(122, 167, 229, 1);
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 8px;

  button {
    padding: 8px 16px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:first-child {
    background-color: #007bff;
    color: white;
  }

  button:nth-child(2) {
    background-color: #ffc107;
  }

  button:last-child {
    background-color: #dc3545;
    color: white;
  }
`;
