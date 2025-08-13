import styled from "styled-components";

export interface RouteImgProps {
  routeImg: string[];
}

export default function RouteImg({ routeImg }: RouteImgProps) {
  if (!routeImg || routeImg.length === 0) return null;

  return (
    <RouteImgWrapper>
      {routeImg.map((img, index) => (
        <Img key={index} src={img} alt={`노선 사진${index}`} />
      ))}
    </RouteImgWrapper>
  );
}

const RouteImgWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
`;

const Img = styled.img`
  width: 100%;
  border-radius: 12px;
`;
