import styled from "styled-components";

import { Place } from "@/components/map/DB.tsx";

import { CafeimageMap } from "@/resources/assets/mapCafeImages/cafeImageManage.ts";
import defaultImage from "../../../resources/assets/mapIcons/defaultImage.png";

const CafeInfoBox = ({ place }: { place: Place }) => {
  //@ts-ignore
  const imageSrc = CafeimageMap[place.cafePlaceInfo?.name] ?? defaultImage;

  return (
    <CafeInfoBoxWrapper>
      <Image
        src={imageSrc}
        alt={`${place.cafePlaceInfo?.name} `}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = defaultImage;
        }}
      />
      <Content>
        <Title>{place.cafePlaceInfo?.name}</Title>
      </Content>
    </CafeInfoBoxWrapper>
  );
};

const CafeInfoBoxWrapper = styled.div`
  background: #ffffff;
  border: 1px solid #c0c0c2;
  border-radius: 10px;

  display: flex;
  flex-direction: row;

  padding: 10px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  gap: 20px;
`;

const Image = styled.img`
  width: 30%;
  aspect-ratio: 1 / 1; /* 정사각형 비율 유지 */
  border-radius: 10px;
  object-fit: cover; /* 컨테이너에 맞게 이미지 자르기 */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 위아래로 요소를 나누어 배치 */
  height: 100%;
  width: 100%;
`;

const Title = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 30px;
  text-align: start;

  color: #324d97;
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  gap: 5px;
`;

export default CafeInfoBox;
