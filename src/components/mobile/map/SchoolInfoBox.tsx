import styled from "styled-components";
import { SchoolimageMap } from "@/resources/assets/mapBuildingImages/buildingImageManage.ts";
import { Place } from "@/components/map/DB.tsx";
import defaultImage from "../../../resources/assets/mapIcons/defaultImage.png";

const SchoolInfoBox = ({ place }: { place: Place }) => {
  const imageSrc = SchoolimageMap[place.location] ?? defaultImage;

  return (
    <SchoolInfoBoxWrapper>
      <Image
        src={imageSrc}
        alt={`${place.location}호관`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = defaultImage;
        }}
      />
      <Content>
        <Title>
          {place.location} {place.place_name}
        </Title>
        <DepartmentWrapper>
          {place.schoolPlaceInfo &&
            place.schoolPlaceInfo.map((item, index) => {
              return <Department key={index}>{item.name}</Department>;
            })}
        </DepartmentWrapper>
      </Content>
    </SchoolInfoBoxWrapper>
  );
};

const SchoolInfoBoxWrapper = styled.div`
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

const DepartmentWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 한 줄에 두 개씩 */

  width: 100%;
  height: 100%;

  justify-content: end;
`;

const Department = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 22px;

  color: #6b87c4;

  display: flex;
  flex-direction: row;
  gap: 5px;
`;

export default SchoolInfoBox;
