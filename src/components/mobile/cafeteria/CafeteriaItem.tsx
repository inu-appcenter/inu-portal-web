import styled from "styled-components";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";

interface CafeteriaDeatilProps {
  구성원가: string;
  칼로리: string;
}

interface CafeteriaBreakfastProps {
  typeIndex: number;
  cafeteriaTypes: string[];
  cafeteriaDetail: (CafeteriaDeatilProps | null)[];
  cafeteriaInfo: (string | null)[];
}

export default function CafeteriaItem({
  typeIndex,
  cafeteriaTypes,
  cafeteriaDetail,
  cafeteriaInfo,
}: CafeteriaBreakfastProps) {
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
                cafeteriaInfo[typeIndex]?.split(" ").map((line) => (
                  <>
                    {line}
                    <br />
                  </>
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
  border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
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
    display: flex; /* Changed from inline-block to flex */
    gap: 6px;
    justify-content: flex-end;
    align-items: center;

    .sub-detail-wrapper {
      display: flex;
      //border: 0.5px solid #dfdfdf;
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
