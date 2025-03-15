import styled from "styled-components";
import dinnerImg from "resources/assets/cafeteria/Sunset.svg";

interface CafeteriaDeatilProps {
  구성원가: string;
  칼로리: string;
}

interface CafeteriaBreakfastProps {
  cafeteriaTypes: string[];
  cafeteriaDetail: (CafeteriaDeatilProps | null)[];
  cafeteriaInfo: (string | null)[];
}

export default function CafeteriaDinner({
  cafeteriaTypes,
  cafeteriaDetail,
  cafeteriaInfo,
}: CafeteriaBreakfastProps) {
  return (
    <div className="total-wrapper">
      <div className="info-wrapper">
        <div className="type-wrapper">
          <p className="type">{cafeteriaTypes[2]}</p>
          <img src={dinnerImg} alt="석식 이미지" />
        </div>
        <div className="detail-info-wrapper">
          <p className="info">
            {" "}
            {cafeteriaInfo[2] === "오늘은 쉽니다" ? (
              <>오늘은 쉽니다</>
            ) : (
              cafeteriaInfo[2]?.split(" ").map((line) => (
                <>
                  {" "}
                  {line} <br />{" "}
                </>
              ))
            )}
          </p>
          {cafeteriaDetail[2] && (
            <div className="detail-wrapper">
              <div className="sub-detail-wrapper">
                <span className="price">{cafeteriaDetail[2].칼로리}</span>
                <TinyCircle />
                <span className="calory">{cafeteriaDetail[2].구성원가}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TinyCircle = styled.p`
  width: 1px;
  height: 1px;
  background-color: black;
  border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
`;
