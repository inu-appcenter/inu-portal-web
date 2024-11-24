import styled from "styled-components";
import { postFiresRating } from "../../utils/API/Fires";
import { useSelector } from "react-redux";

interface AiSubmitProps {
  rating: number;
  id: string;
}

interface loginInfo {
  user: {
    token: string;
  };
}

export default function AiImgSubmit({ rating, id }: AiSubmitProps) {
  const user = useSelector((state: loginInfo) => state.user);

  const handleSubmitClick = async () => {
    try {
      if (!rating || rating < 0) {
        alert("별점을 평가하세요!");
        return;
      }
      const response = await postFiresRating(user.token, rating, id);
      if (response.status === 200) {
        alert("별점 평가가 완료되었습니다."); // 성공한 경우
      } else {
        console.error("평점 추가 실패:", response.status);
      }
    } catch (error) {
      console.error("평점 추가 실패:", error);
    }
  };

  return (
    <AIImgSubmitWrapper>
      <div className="submit" onClick={handleSubmitClick}>
        제출
      </div>
    </AIImgSubmitWrapper>
  );
}

const AIImgSubmitWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 90%;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  .submit {
    margin: 50px;
    position: absolute;
    width: 93px;
    height: 33px;
    background: #6d4dc7;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 800;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
`;
