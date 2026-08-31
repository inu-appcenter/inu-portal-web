import styled from "styled-components";
import { educationCollegeShuttleSchedule as 사범대셔틀시간표 } from "@/resources/assets/illustrations/bus";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";

const MichuholShuttle = () => {
  return (
    <Wrapper>
      <ImageWrapper>
        <ImageWithSkeleton
          src={사범대셔틀시간표}
          alt={"사범대셔틀시간표"}
          skeletonHeight="60vh"
        />
      </ImageWrapper>
    </Wrapper>
  );
};

export default MichuholShuttle;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  display: flex;
  justify-content: center;
`;

const ImageWrapper = styled.div`
  width: 100%;
  max-width: 500px;
`;
