import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { AiChat } from "../../../../old/mobile/components/ai/AiChat";
import { getFires } from "../../../../src/utils/API/Fires";
import AiImgViewer from "../../../component/ai/AiImgViewer";

export default function MobileAiResult() {
  const { imageId } = useParams<{ imageId: string }>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!imageId) return;
    const fetchImage = async () => {
      try {
        const response = await getFires(imageId);
        if (response.status === 200) {
          const imageURL = URL.createObjectURL(response.body);
          setImageUrl(imageURL);
        } else if (response.status === 404) {
          alert("존재하지 않는 이미지 번호입니다.");
        } else {
          alert("이미지 불러오기 실패");
        }
      } catch (error) {
        console.error("Error fetching image", error);
      }
    };
    fetchImage();
  }, [imageId]);

  // 날짜 포맷 함수
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  return (
    <MobileAiInputWrapper>
      <DateWrapper>
        <DateLine />
        <DateDisplay>{getFormattedDate()}</DateDisplay>
        <DateLine />
      </DateWrapper>
      <ChatWrapper>
        <AiChat message="AI 이미지 생성중 ..." />
      </ChatWrapper>
      {imageUrl && <AiImgViewer imageUrl={imageUrl} />}
      <button onClick={() => navigate("/m/ai/input")}>다시 그리기</button>
    </MobileAiInputWrapper>
  );
}

const MobileAiInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const DateWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
`;

const DateLine = styled.div`
  height: 1px;
  flex: 1;
  background-color: white;
`;

const DateDisplay = styled.div`
  width: 132px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  border-radius: 14px;
  color: white;
  font-size: 14px;
`;

const ChatWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 16px 16px 16px;
`;
