import styled from "styled-components";

export interface StopImgProps {
  stopImg: string[];
}

export default function StopImg({ stopImg }: StopImgProps) {
  if (!stopImg || stopImg.length === 0) return null;

  return (
    <StopImgWrapper>
      {stopImg.map((img, index) => (
        <Img key={index} src={img} alt={`정류장 사진${index}`} />
      ))}
    </StopImgWrapper>
  );
}

const StopImgWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
`;

const Img = styled.img`
  width: 100%;
  border-radius: 12px;
`;
