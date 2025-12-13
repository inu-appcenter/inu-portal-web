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
    if (nowday === 0) {
        nowday = 7;
    }


    return (
        <CafeteriaDateWrapper>
            {weekDates.map((weekDate, index) => (
                <div
                    className={`date ${index + 1 === nowday ? "check" : ""}`}
                    key={index}
                    onClick={() => handleChangeDay(index + 1)}
                >
                    <p
                        className="day-name"
                        style={{
                            color: weekDate.dayName === "Sun" ? "red" : weekDate.dayName === "Sat" ? "blue" : "#444444",
                        }}
                    >
                        {weekDate.dayName}
                    </p>
                    <p className="date-number"
                       style={{
                           color: weekDate.dayName === "Sun" ? "red" : weekDate.dayName === "Sat" ? "blue" : "#444444",
                       }}
                    >{weekDate.date}</p>
                </div>
            ))}
        </CafeteriaDateWrapper>
    );
}


const CafeteriaDateWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 15px;

    .date {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        box-shadow: 0px 4px 4px 0px #00000040;
        padding: 2px 10px;
        border-radius: 10px;


        .day-name {
            font-size: 10px;
            font-weight: 700;
            margin: 0;

        }

        .date-number {
            font-size: 15px;
            font-weight: 700;
            padding: 0;
            margin: 0;
        }
    }

    .check {
        background-color: #4071b9;

        .day-name,
        .date-number {
            color: white !important; /* 클릭된 날짜는 흰색 유지 */

        }
    }
`;