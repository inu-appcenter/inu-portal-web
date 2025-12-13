import styled from "styled-components";
import { useState, useEffect } from "react";
import Woman from "@/resources/assets/mapIcons/woman.svg";
import Bed from "@/resources/assets/mapIcons/bed.svg";
import Shower from "@/resources/assets/mapIcons/shower.svg";

const RestInfoBox = ({
  title,
  isExist,
  num,
}: {
  title: string;
  isExist?: any;
  num?: any;
}) => {
  const [iconSrc, setIconSrc] = useState<string>("");

  const decisionIcon = () => {
    if (title === "여성용품 배치") {
      setIconSrc(Woman);
    } else if (title === "침대, 빈백(개)") {
      setIconSrc(Bed);
    } else if (title === "샤워실") {
      setIconSrc(Shower);
    }
  };

  useEffect(() => {
    decisionIcon();
  }, []);

  return (
    <InfoBoxWrapper>
      <IconBox>
        <Icon src={iconSrc} />
      </IconBox>
      <ContentBox>
        <TitleBox>{title}</TitleBox>
        <NumberBox>
          {isExist === true ? <>O</> : num !== undefined ? <>{num}</> : <>X</>}
        </NumberBox>
      </ContentBox>
    </InfoBoxWrapper>
  );
};

const InfoBoxWrapper = styled.div`
  width: 85px;
  height: fit-content;
  left: 38.23px;
  top: 535.25px;

  border: 0.871981px solid #a5a5a5;
  border-radius: 19.1836px;

  display: flex;
  flex-direction: row;

  padding: 5px 10px 5px 5px;
`;
const IconBox = styled.div`
  width: 25px;
  height: 25px;
  left: 33px;
  top: 527.4px;

  background: #4071b9;
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
const Icon = styled.img``;
const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
const TitleBox = styled.div`
  height: 100%;
  font-style: normal;
  font-weight: 400;
  font-size: 9px;
  line-height: 13px;
  /* identical to box height */
  letter-spacing: 0.871981px;

  color: #3b566e;
`;
const NumberBox = styled.div`
  height: fit-content;
  width: fit-content;
  font-style: normal;
  font-weight: 600;
  font-size: 9px;
  line-height: 12px;
  letter-spacing: 0.871981px;

  color: #0e4d9d;
`;

export default RestInfoBox;
