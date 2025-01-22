import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { getCouncilNotices, deleteCouncilNotices } from "apis/councilNotices";
import UploadNotice from "./UploadNotice";
import { CouncilNotice } from "types/councilNotices";
import axios, { AxiosError } from "axios";
import useUserStore from "stores/useUserStore";

interface NoticeDetailProps {
  councilNoticeId: number;
  onClose: () => void;
}

export default function NoticeDetail({
  councilNoticeId,
  onClose,
}: NoticeDetailProps) {
  const { userInfo } = useUserStore();
  const [notice, setNotice] = useState<CouncilNotice>({
    id: -1,
    title: "",
    content: "",
    view: 0,
    createDate: "",
    imageCount: 0,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 상세 정보 로드
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await getCouncilNotices(councilNoticeId);
        setNotice(response.data);
      } catch (error) {
        console.error("총학생회 공지사항 가져오기실패", error);
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
              alert("총학생회 공지사항 가져오기 실패");
              break;
          }
        }
        onClose();
      }
    };
    fetchDetail();
  }, [councilNoticeId]);

  // 삭제
  const handleDelete = async () => {
    try {
      await deleteCouncilNotices(councilNoticeId);
      alert("총학생회 공지사항이 삭제되었습니다.");
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleUploaded = () => {
    setIsEditOpen(false);
    onClose(); // 새로고침
  };

  if (!notice) return <p>Loading...</p>;

  return (
    <BottomSheet open={true} onDismiss={onClose}>
      <DetailWrapper>
        <h2>{notice.title}</h2>
        <p>내용: {notice.content}</p>
        {userInfo.role == "admin" && (
          <ButtonWrapper>
            <button onClick={() => setIsEditOpen(true)}>수정</button>
            <button onClick={handleDelete}>삭제</button>
          </ButtonWrapper>
        )}
      </DetailWrapper>

      <UploadNotice
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUploaded={handleUploaded}
        initialData={notice}
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
