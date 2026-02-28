import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import { SHUTTLE_ROUTES } from "@/constants/bus";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";

export default function ShuttleCardSection() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      {/* 탑승방법 버튼 */}
      <CardWrapper
        onClick={() => {
          navigate(ROUTES.BUS.SHUTTLE_HELLO);
        }}
      >
        <ImageWithSkeleton
          src="/Bus/탑승방법버튼.svg"
          alt="탑승방법버튼"
          skeletonHeight="100px"
          borderRadius="16px"
        />
      </CardWrapper>

      {/* 노선 카드 렌더링 */}
      {SHUTTLE_ROUTES.filter((route) => route.isActive).map((route) => (
        <CardWrapper
          key={route.id}
          onClick={() =>
            navigate(`${ROUTES.BUS.SHUTTLE_ROUTE}?route=${route.id}`)
          }
        >
          <ImageWithSkeleton
            src={route.buttonImage}
            alt={route.name}
            skeletonHeight="100px"
            borderRadius="16px"
          />
        </CardWrapper>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-self: stretch;
  justify-items: center;
  justify-content: center;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  cursor: pointer;
`;
