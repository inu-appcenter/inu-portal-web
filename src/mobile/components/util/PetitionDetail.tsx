import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { getPetitionsDetail, deletePetitions } from "apis/petitions";
import UploadPetition from "./UploadPetition";
import { Petition } from "types/petitions";
import axios, { AxiosError } from "axios";

interface PetitionDetailProps {
  petitionId: number;
  onClose: () => void;
}

export default function BookDetail({
  petitionId,
  onClose,
}: PetitionDetailProps) {
  const [petition, setPetition] = useState<Petition>({
    id: -1,
    title: "",
    content: "",
    writer: "",
    createDate: "",
    imageCount: 0,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 청원 상세 정보 로드
  useEffect(() => {
    const fetchPetitionDetail = async () => {
      try {
        const response = await getPetitionsDetail(petitionId);
        setPetition(response.data);
      } catch (error) {
        console.error("청원 가져오기실패", error);
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
              alert("청원 가져오기 실패");
              break;
          }
        }
        onClose();
      }
    };
    fetchPetitionDetail();
  }, [petitionId]);

  // 청원 삭제
  const handleDelete = async () => {
    try {
      await deletePetitions(petitionId);
      alert("청원이 삭제되었습니다.");
      onClose();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handlePetitionUploaded = () => {
    setIsEditOpen(false);
    onClose(); // 새로고침
  };

  if (!petition) return <p>Loading...</p>;

  return (
    <BottomSheet open={true} onDismiss={onClose}>
      <DetailWrapper>
        <h2>{petition.title}</h2>
        <p>작성자: {petition.writer}</p>
        <p>내용: {petition.content}</p>
      </DetailWrapper>

      <ButtonWrapper>
        <button onClick={() => setIsEditOpen(true)}>수정</button>
        <button onClick={handleDelete}>삭제</button>
      </ButtonWrapper>

      <UploadPetition
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onPetitionUpload={handlePetitionUploaded}
        initialData={petition}
      />
    </BottomSheet>
  );
}

const DetailWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    margin: 0;
  }

  p {
    margin: 4px 0;
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
