import styled from "styled-components";
import Box from "@/components/common/Box";
import Skeleton from "@/components/common/Skeleton";
import { FiChevronRight } from "react-icons/fi";

export default function BusItemSkeleton() {
  return (
    <Box>
      <BusItemWrapper>
        {/* 상단 노선 텍스트 영역 스켈레톤 */}
        <TopSection>
          <Skeleton width="60%" height={12} />
        </TopSection>

        <MainSection>
          {/* 버스 번호 원형 스켈레톤 */}
          <Skeleton width={38} height={38} circle />
          <TimeInfo>
            <ArrivalWrapper>
              {/* 도착 시간 텍스트 스켈레톤 */}
              <Skeleton width={45} height={18} />

              {/* 상태 정보(몇 번째 전, 혼잡도) 박스 스켈레톤 */}
              <StatusInfoPlaceholder>
                <Skeleton width={70} height={18} />
              </StatusInfoPlaceholder>
            </ArrivalWrapper>
          </TimeInfo>
          {/*오른쪽 화살표 아이콘 영역 스켈레톤*/}
          <FiChevronRight strokeWidth={3} />
        </MainSection>
      </BusItemWrapper>
    </Box>
  );
}

/* 기존 BusItem의 레이아웃 스타일과 동일하게 유지 */
const BusItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const TopSection = styled.div`
  height: 18px; /* 실제 텍스트 높이 확보 */
  display: flex;
  align-items: center;
`;

const MainSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 40px;
`;

const TimeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ArrivalWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 32px;
`;

const StatusInfoPlaceholder = styled.div`
  display: flex;
  align-items: center;
`;
