import { useState, useEffect } from "react";
import styled from "styled-components";
import Skeleton from "./Skeleton";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  skeletonHeight?: string | number;
  skeletonWidth?: string | number;
  borderRadius?: string;
}

const ImageWithSkeleton = ({
  src,
  alt,
  skeletonHeight = "200px",
  skeletonWidth = "100%",
  borderRadius = "10px",
  style,
  onLoad,
  ...props
}: ImageWithSkeletonProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // src가 변경될 때마다 로딩 상태 초기화
  useEffect(() => {
    setIsLoading(true);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  return (
    <Container $borderRadius={borderRadius}>
      {isLoading && (
        <Skeleton
          height={skeletonHeight}
          width={skeletonWidth}
          style={{ borderRadius }}
        />
      )}
      <StyledImg
        src={src}
        alt={alt}
        onLoad={handleLoad}
        $isLoading={isLoading}
        style={{ ...style, borderRadius }}
        {...props}
      />
    </Container>
  );
};

export default ImageWithSkeleton;

const Container = styled.div<{ $borderRadius: string }>`
  width: 100%;
  position: relative;
  border-radius: ${({ $borderRadius }) => $borderRadius};
  overflow: hidden;
`;

const StyledImg = styled.img<{ $isLoading: boolean }>`
  width: 100%;
  display: ${({ $isLoading }) => ($isLoading ? "none" : "block")};
`;
