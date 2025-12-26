import styled from "styled-components";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton"; // 스켈레톤 컴포넌트 임포트

interface CafeteriaDeatilProps {
  구성원가: string;
  칼로리: string;
}

interface CafeteriaBreakfastProps {
  typeIndex: number;
  cafeteriaTypes: string[];
  cafeteriaDetail: (CafeteriaDeatilProps | null)[];
  cafeteriaInfo: (string | null)[];
  isLoading: boolean;
}

export default function CafeteriaItem({
  typeIndex,
  cafeteriaTypes,
  cafeteriaDetail,
  cafeteriaInfo,
  isLoading,
}: CafeteriaBreakfastProps) {
  // 로딩 상태 레이아웃
  if (isLoading) {
    return (
      <TitleContentArea title={<Skeleton width={120} height={24} />}>
        <Box>
          <DetailWrapper>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Skeleton width="40%" height={16} />
              <Skeleton width="30%" height={16} />
              <Skeleton width="50%" height={16} />
              <Skeleton width="40%" height={16} />
              <Skeleton width="30%" height={16} />
            </div>
            <Divider />
            <div className="detail-wrapper">
              <div className="sub-detail-wrapper">
                <Skeleton width={40} height={14} />
                <TinyCircle />
                <Skeleton width={40} height={14} />
              </div>
            </div>
          </DetailWrapper>
        </Box>
      </TitleContentArea>
    );
  }

  // 데이터 부재 시 처리
  if (cafeteriaTypes[typeIndex] === "없음") {
    return null;
  }

  return (
    <TitleContentArea title={cafeteriaTypes[typeIndex]}>
      <Box>
        <DetailWrapper>
          {cafeteriaTypes[typeIndex] !== "없음" && (
            <p className="info">
              {cafeteriaInfo[typeIndex] === "오늘은 쉽니다" ? (
                <>오늘은 쉽니다</>
              ) : (
                cafeteriaInfo[typeIndex]?.split(" ").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              )}
            </p>
          )}
          <Divider />
          {cafeteriaDetail[typeIndex] && (
            <div className="detail-wrapper">
              <div className="sub-detail-wrapper">
                <span className="price">
                  {cafeteriaDetail[typeIndex].칼로리}
                </span>
                <TinyCircle />
                <span className="calory">
                  {cafeteriaDetail[typeIndex].구성원가}
                </span>
              </div>
            </div>
          )}
        </DetailWrapper>
      </Box>
    </TitleContentArea>
  );
}

const TinyCircle = styled.p`
  width: 1px;
  height: 1px;
  background-color: #888888;
  border-radius: 50%;
`;

const DetailWrapper = styled.div`
  width: 100%;
  min-height: 90px;
  box-sizing: border-box;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .info {
    font-size: 13px;
    font-weight: 500;
    color: #404040;
    margin: 0;
  }

  .detail-wrapper {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
    align-items: center;

    .sub-detail-wrapper {
      display: flex;
      gap: 10px;
      border: none;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      padding: 3px;
      font-size: 10px;
      font-weight: 500;
      color: #888888;
    }
  }
`;
