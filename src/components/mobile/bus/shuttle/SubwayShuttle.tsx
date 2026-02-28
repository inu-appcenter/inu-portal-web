import styled from "styled-components";
import 등하교셔틀시간표 from "@/resources/assets/bus/등하교셔틀시간표.jpeg";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";

const MichuholShuttle = () => {
  return (
    <Wrapper>
      <ImageWrapper>
        <ImageWithSkeleton
          src={등하교셔틀시간표}
          alt={"등하교셔틀시간표"}
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
