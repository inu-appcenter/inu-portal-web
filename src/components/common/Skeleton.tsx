import styled, { keyframes, css } from "styled-components";

// 애니메이션 정의
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// 스켈레톤 종류별 스타일 맵
const variantStyles = {
  text: css`
    border-radius: 4px;
  `,
  tag: css`
    width: 70px;
    height: 28px;
    border-radius: 4px;
  `,
  card: css`
    width: 100%;
    height: 80px;
    border-radius: 12px;
  `,
};

interface SkeletonProps {
  variant?: "text" | "tag" | "card";
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

// 스타일 컴포넌트 정의
const StyledSkeleton = styled.div<SkeletonProps>`
  background: #e3e3e3;
  border-radius: 6px;
  position: relative;
  overflow: hidden;

  // 너비 및 높이 설정
  width: ${({ width }) =>
    typeof width === "number" ? `${width}px` : width || "100%"};
  height: ${({ height }) =>
    typeof height === "number" ? `${height}px` : height || "20px"};

  // 변형 스타일 적용
  ${({ variant }) => variant && variantStyles[variant]};

  // 원형 옵션
  ${({ circle }) =>
    circle &&
    css`
      border-radius: 50%;
    `};

  // 가상 요소를 활용한 Shimmer 효과
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(230, 230, 230, 0) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(230, 230, 230, 0) 100%
    );
    animation: ${shimmer} 1.4s infinite;
  }
`;

const Skeleton = ({ variant = "text", ...props }: SkeletonProps) => {
  return <StyledSkeleton variant={variant} aria-hidden="true" {...props} />;
};

export default Skeleton;
