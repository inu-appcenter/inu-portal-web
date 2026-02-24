import styled from "styled-components";

interface WeekDatesProps {
  dayName: string;
  date: string;
}

interface CafeteriaDateProps {
  nowday: number;
  setNowDay: (nowday: number) => void;
  weekDates: WeekDatesProps[];
}

export default function CafeteriaDate({
  nowday,
  setNowDay,
  weekDates,
}: CafeteriaDateProps) {
  const handleChangeDay = (day: number) => {
    setNowDay(day);
  };

  // 일요일(0) 처리
  const activeDay = nowday === 0 ? 7 : nowday;

  return (
    <DateListContainer>
      {weekDates.map((weekDate, index) => (
        <div
          className={`date ${index + 1 === activeDay ? "check" : ""}`}
          key={index}
          onClick={() => handleChangeDay(index + 1)}
        >
          <p
            className="day-name"
            style={{
              color:
                weekDate.dayName === "Sun"
                  ? "red"
                  : weekDate.dayName === "Sat"
                    ? "blue"
                    : "#444444",
            }}
          >
            {weekDate.dayName}
          </p>
          <p
            className="date-number"
            style={{
              color:
                weekDate.dayName === "Sun"
                  ? "red"
                  : weekDate.dayName === "Sat"
                    ? "blue"
                    : "#444444",
            }}
          >
            {weekDate.date}
          </p>
        </div>
      ))}
    </DateListContainer>
  );
}

const DateListContainer = styled.div`
  display: flex;
  overflow-x: auto;
  width: 100%;
  gap: 8px;
  justify-content: space-around;

  /* 그림자 공간 확보 및 좌우 여백 */
  padding: 10px 32px;
  //padding-right: 24px;
  box-sizing: border-box;

  /* 스크롤바 제거 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* 우측 페이드 효과 */
  mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 80%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 80%,
    rgba(0, 0, 0, 0) 100%
  );

  .date {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    /* 그림자 설정 */
    box-shadow: 0px 4px 4px 0px #00000040;

    padding: 8px 10px;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;

    .day-name {
      font-size: 10px;
      font-weight: 700;
      margin: 0;
    }

    .date-number {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
    }
  }

  .check {
    background-color: #4071b9;
    .day-name,
    .date-number {
      color: white !important;
    }
  }
`;
