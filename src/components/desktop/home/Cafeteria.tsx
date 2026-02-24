import styled from "styled-components";
import { useEffect, useState } from "react";
import { cafeterias } from "@/resources/strings/cafeterias";
import { getCafeterias } from "@/apis/cafeterias";
import breakfastImg from "@/resources/assets/cafeteria/Sunrise.svg";
import lunchImg from "@/resources/assets/cafeteria/Sun.svg";
import dinnerImg from "@/resources/assets/cafeteria/Sunset.svg";

interface CafeteriaDetail {
  구성원가: string;
  칼로리: string;
}

export default function Cafeteria() {
  const [nowday, setNowDay] = useState(() => {
    const date = new Date();
    const day = date.getDay();
    return day === 0 ? 7 : day;
  });

  const [cafeteriaType, setCafeteriaType] = useState("학생식당");
  const [cafeteriaInfo, setCafeteriaInfo] = useState<(string | null)[]>([]);
  const [cafeteriaTypes, setCafeteriaTypes] = useState<string[]>([
    "중식(백반)",
    "중식(일품)",
    "석식",
  ]);
  const [cafeteriaDetail, setCafeteriaDetail] = useState<
    (CafeteriaDetail | null)[]
  >([]);
  const days = ["Mon", "Tue", "Wnd", "Thur", "Fri", "Sat", "Sun"];
  const [selectedDay, setSelectedDay] = useState<number>(nowday - 1);

  useEffect(() => {
    fetchCafeteriaData();
  }, [cafeteriaType, nowday]);

  const handleDayChange = (index: number) => {
    setNowDay(index + 1);
    setSelectedDay(index);
  };

  const fetchCafeteriaData = async () => {
    try {
      const response = await getCafeterias(cafeteriaType, nowday);
      const processedData = response.data.map((info: string) =>
        extractValues(info),
      );
      const infoData = response.data.map((info: string) => extractMenu(info));
      setCafeteriaInfo(infoData);
      setCafeteriaDetail(processedData);
    } catch (error) {
      console.error("학식 메뉴 가져오기 실패", error);
    }
  };

  const handleCafeteriaType = (title: string, info: string[]) => {
    setCafeteriaType(title);
    setCafeteriaTypes(info);
  };

  function extractValues(
    input: string,
  ): { 구성원가: string; 칼로리: string } | null {
    const price = input.match(/([0-9,]+)원/);
    const calory = input.match(/[0-9,]+kcal/);
    if (price && calory) {
      return {
        구성원가: price[0],
        칼로리: calory[0],
      };
    }
    return null;
  }

  const extractMenu = (input: string): string | null => {
    const match = input.match(/^(.*?)(?=\s[0-9,]+원|\s\"[0-9,]+원)/);
    return match ? match[1].trim() : input;
  };

  return (
    <CafeteriaWrapper>
      <div className="type-wrapper">
        <div className="title">
          <div className="circle"></div>
          <div className="cafeteria-type">{cafeteriaType}</div>
        </div>
        <DayButtons>
          {days.map((dayName, index) => (
            <DayButton
              key={index}
              onClick={() => handleDayChange(index)}
              $isSelected={selectedDay === index}
            >
              {dayName}
            </DayButton>
          ))}
        </DayButtons>
      </div>

      <div className="total-wrapper">
        <CafetriaType>
          {cafeterias.map((cafeteria) => (
            <Cafeterias
              className="cafeteria"
              key={cafeteria.id}
              onClick={() =>
                handleCafeteriaType(cafeteria.title, cafeteria.info)
              }
              $selected={cafeteria.title === cafeteriaType}
            >
              <div className="cafeteria-title">{cafeteria.title}</div>
            </Cafeterias>
          ))}
        </CafetriaType>
        <div className="cafeteria-list">
          <CafetriaInfo>
            <div className="breakfast">
              <div className="detail">
                <div className="wrapper">
                  {cafeteriaTypes[0] !== "없음" && (
                    <>
                      <img src={breakfastImg} alt="조식" />
                      <p className="type">{cafeteriaTypes[0]}</p>
                    </>
                  )}
                </div>
                {cafeteriaTypes[0] !== "없음" && (
                  <p className="info">{cafeteriaInfo[0]}</p>
                )}
                {cafeteriaDetail[0] && (
                  <div className="detail-wrapper">
                    <div className="price">{cafeteriaDetail[0].칼로리}</div>
                    <div className="calory">{cafeteriaDetail[0].구성원가}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="lunch">
              <div className="detail">
                <div className="wrapper">
                  <img src={lunchImg} alt="중식" />
                  <p className="type">{cafeteriaTypes[1]}</p>
                </div>
                <p className="info">{cafeteriaInfo[1]}</p>
                {cafeteriaDetail[1] && (
                  <div className="detail-wrapper">
                    <div className="price">{cafeteriaDetail[1].칼로리}</div>
                    <div className="calory">{cafeteriaDetail[1].구성원가}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="dinner">
              <div className="detail">
                <div className="wrapper">
                  <img src={dinnerImg} alt="석식" />
                  <p className="type">{cafeteriaTypes[2]}</p>
                </div>
                <p className="info">{cafeteriaInfo[2]}</p>
                {cafeteriaDetail[2] && (
                  <div className="detail-wrapper">
                    <div className="price">{cafeteriaDetail[2].칼로리}</div>
                    <div className="calory">{cafeteriaDetail[2].구성원가}</div>
                  </div>
                )}
              </div>
            </div>
          </CafetriaInfo>
        </div>
      </div>
    </CafeteriaWrapper>
  );
}

const CafeteriaWrapper = styled.div`
  width: 100%;
  min-height: 340px;

  ::-webkit-scrollbar {
    height: 8px;
    width: 5%;
  }

  ::-webkit-scrollbar-track {
    background: transparent; // 스크롤바 배경색
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #82ade8ff; // 스크롤바 썸에 마우스를 올렸을 때의 색상
  }

  border-radius: 12px;
  box-shadow: 0 0 0 2px #6f84e2 inset;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .type-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    padding-bottom: 0;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;

      .circle {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid transparent;
        box-shadow: 0 0 0 2px #85cbda inset;
      }

      .cafeteria-type {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }

  .total-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    padding-top: 0;
  }

  .date {
    font-size: 12px;
    color: #656565;
    display: flex;
    justify-content: flex-end;
  }

  .today {
    font-size: 15px;
    font-weight: bold;
    margin-left: auto;
  }

  .cafeteria-list {
    padding: 12px 16px;
    background-color: #f8f9fd;
    border-radius: 8px;
  }
`;

const DayButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const DayButton = styled.button<{ $isSelected: boolean }>`
  border: none;
  border-bottom: solid 2px
    ${({ $isSelected }) => ($isSelected ? "#A4C5E7" : "#fff")};
  font-size: 12px;
  background-color: transparent;
  color: #404040;
  width: 32px;
  padding: 0 0 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-bottom 0.3s ease;

  &:hover {
    border-bottom-color: #a4c5e7;
  }
`;

const CafetriaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  .breakfast,
  .lunch,
  .dinner {
    .detail {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .img {
        width: 24px;
        height: 24px;
      }

      .wrapper {
        min-width: 40px;
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .type {
        font-size: 8px;
        color: #969696;

        font-weight: bold;
        margin: 0;
      }

      .info {
        font-size: 12px;
        font-weight: bold;
        color: #404040;
        flex: 1;
        margin: 0 12px;
      }

      .detail-wrapper {
        border: 0.5px solid #d6d7d9;
        border-radius: 4px;
        display: grid;
        align-items: center;
        justify-content: center;
        min-width: 60px;
        padding: 4px;
        .price,
        .calory {
          font-size: 10px;
          color: #000000;
        }
      }
    }
  }
`;

const CafetriaType = styled.div`
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  gap: 8px;
  margin-bottom: 4px;
`;

const Cafeterias = styled.button<{ $selected?: boolean }>`
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  color: #fff;
  background: ${({ $selected }) =>
    $selected
      ? "linear-gradient(90deg, #83CBD9 0%, #99C7E1 50%, #A1C9F1 100%)"
      : "#DBDBDB"};
  border-radius: 8px;
  padding: 0 20px;
  height: 32px;
  border: none;
  margin-bottom: 4px;
`;
