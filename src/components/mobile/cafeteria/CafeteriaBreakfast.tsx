import styled from "styled-components";
import breakfastImg from "@/resources/assets/cafeteria/Sunrise.svg";

interface CafeteriaDeatilProps {
  구성원가: string;
  칼로리: string;
}

interface CafeteriaBreakfastProps {
  cafeteriaTypes: string[];
  cafeteriaDetail: (CafeteriaDeatilProps | null)[];
  cafeteriaInfo: (string | null)[];
}

export default function CafeteriaBreakfast({
  cafeteriaTypes,
  cafeteriaDetail,
  cafeteriaInfo,
}: CafeteriaBreakfastProps) {
  return (
    <div className="total-wrapper">
      {cafeteriaInfo[0] !== "-" && (
        <>
          <div className="info-wrapper">
            <div className="type-wrapper">
              {cafeteriaTypes[0] !== "없음" && (
                <>
                  <p className="type">
                    {cafeteriaTypes[0]?.split("\n").map((line) => (
                      <>
                        {line}
                        <br />
                      </>
                    ))}
                  </p>
                </>
              )}
              <img src={breakfastImg} alt="조식 이미지" />
            </div>
            <div className="detail-info-wrapper">
              {cafeteriaTypes[0] !== "없음" && (
                <p className="info">
                  {cafeteriaInfo[0] === "오늘은 쉽니다" ? (
                    <>오늘은 쉽니다</>
                  ) : (
                    cafeteriaInfo[0]?.split(" ").map((line) => (
                      <>
                        {line}
                        <br />
                      </>
                    ))
                  )}
                </p>
              )}
              {cafeteriaDetail[0] && (
                <div className="detail-wrapper">
                  <div className="sub-detail-wrapper">
                    <span className="price">{cafeteriaDetail[0].칼로리}</span>
                    <TinyCircle />
                    <span className="calory">
                      {cafeteriaDetail[0].구성원가}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
const TinyCircle = styled.p`
  width: 1px;
  height: 1px;
  background-color: black;
  border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
`;
