import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { handlePostScrap } from "old/utils/API/Posts";
import scrapEmptyImg from "../../../resource/assets/scrap-empty-img.svg";
import styled from "styled-components";

interface PostScrapProps {
  scrap: number;
  isScrapedProp: boolean;
}

export default function PostScrap({ scrap, isScrapedProp }: PostScrapProps) {
  const [scraps, setScraps] = useState(scrap);
  const { id } = useParams<{ id: string }>();
  const [isScraped, setIsScraped] = useState(isScrapedProp);
  const token = useSelector((state: any) => state.user.token);

  const handleScrapClick = async () => {
    if (id === undefined) {
      console.error("ID is undefined");
      return;
    }
    if (token) {
      try {
        const result = await handlePostScrap(token, id);
        setIsScraped(!isScraped);
        if (result.body.data === -1) {
          setScraps(scraps - 1);
          alert("스크랩 취소");
        } else {
          setScraps(scraps + 1);
          alert("스크랩 성공");
        }
      } catch (error) {
        console.error("스크랩 처리 에러", error);
        alert("스크랩 처리 에러");
      }
    } else {
      alert("로그인 필요");
    }
  };

  return (
    <ScrapContainer>
      <ScrapRectangle onClick={handleScrapClick}>
        <UtilityImg
          src={isScraped ? scrapEmptyImg : scrapEmptyImg}
          alt="scrapImg"
        />
        <UtilityText>스크랩</UtilityText>
      </ScrapRectangle>
      <UtilityText>{scraps}</UtilityText>
    </ScrapContainer>
  );
}

// Styled Components
const ScrapContainer = styled.span`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
`;

const ScrapRectangle = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 65px;
  height: 25px;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    rgba(194, 205, 255, 0.7) 0%,
    rgba(197, 223, 255, 0.7) 100%
  );
`;

const UtilityImg = styled.img`
  height: 15px;
  width: auto;
`;

const UtilityText = styled.span`
  font-size: 15px;
  font-weight: 400;
`;
