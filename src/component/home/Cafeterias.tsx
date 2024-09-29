import styled from "styled-components";
import { cafeteriasList } from "../../resource/string/cafeterias";
import { useEffect, useState } from "react";
import { getCafeterias } from "../../utils/API/Cafeterias";
import dinnerImg from "../../resource/assets/Sunset.svg";
import lunchImg from "../../resource/assets/Sun.svg";
import breakfastImg from "../../resource/assets/Sunrise.svg";

export default function Cafeteria() {
  const [nowday,setNowDay] = useState(()=>{
    const date = new Date();
    const day = date.getDay();
    return day === 0 ? 7 : day;
  });
  const [cafeteriaType, setCafeteriaType] = useState("학생식당");
  const [cafeteriaInfo, setCafeteriaInfo] = useState([]);
  const [cafeteriaTypes, setCafeteriaTypes] = useState<string[]>([
    "중식(백반)",
    "중식(일품)",
    "석식",
  ]);
  const [cafeteriaDetail, setCafeteriaDetail] = useState<
    { 구성원가: string; 칼로리: string }[]
  >([]);
  const days =['Mon', 'Tue', 'Wnd', 'Thur', 'Fri', 'Sat','Sun' ];
  const [selectedDay, setSelectedDay] = useState<number>(nowday-1);

  useEffect(() => {
    fetchCafeteriaData();
  }, [cafeteriaType, nowday]);

  const handleDayChange = (index: number) => {
    console.log(`day index: ${index + 1}, Day: ${days[index]}`);
    setNowDay(index+1);
    setSelectedDay(index);
  };

  const fetchCafeteriaData = async () => {
    try {
      const response = await getCafeterias(cafeteriaType, nowday);
      if (response.status === 200) {
        const processedData = response.body.data.map((info: string) =>
          extractValues(info)
        );
        const infoData = response.body.data.map((info: string) =>
          extractMenu(info)
        );
        setCafeteriaInfo(infoData);
        setCafeteriaDetail(processedData);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("학식 정보 조회 안됨", error);
    }
  };

  const handleCafeteriaType = (title: string, info: string[]) => {
    setCafeteriaType(title);
    setCafeteriaTypes(info);
  };

  function extractValues(
    input: string
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

  function extractMenu(input: string): string | null {
    const match = input.match(/^(.*?)(?=\s[0-9,]+원)/);
    return match ? match[1].trim() : input;
  }

  return (
    <>
      <CafeteriaWrapper>
        <div className='type-wrapper'>
        <div className="title">
          <div className="circle"></div>
          <div className="cafeteria-type">{cafeteriaType}</div>
        </div>
        <DayButtons>
            {days.map((dayName, index)=>(
              <DayButton
              key = {index}
              onClick = {()=>handleDayChange(index)}
              isSelected={selectedDay === index}>
                {dayName}
              </DayButton>
            ))}
          </DayButtons>
        
        </div>
        
        <div className="total-wrapper">
          <CafetriaType>
            {cafeteriasList.map((cafeteria) => (
              <Cafeterias
                className="cafeteria"
                key={cafeteria.id}
                onClick={() =>
                  handleCafeteriaType(cafeteria.title, cafeteria.info)
                }
                selected={cafeteria.title === cafeteriaType}
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
                      <TinyCircle />
                      <div className="calory">
                        {cafeteriaDetail[0].구성원가}
                      </div>
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
                      <TinyCircle />
                      <div className="calory">
                        {cafeteriaDetail[1].구성원가}
                      </div>
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
                      <TinyCircle />
                      <div className="calory">
                        {cafeteriaDetail[2].구성원가}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CafetriaInfo>
          </div>
        </div>
      </CafeteriaWrapper>
    </>
  );
}

const CafeteriaWrapper = styled.div`
  ::-webkit-scrollbar {
    height: 10px;
    width: 5%;
  }

  ::-webkit-scrollbar-track {
    background: transparent; // 스크롤바 배경색
  }

  ::-webkit-scrollbar-thumb {
    background: #fff; // 스크롤바 썸(움직이는 부분)의 색상
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #82ade8ff; // 스크롤바 썸에 마우스를 올렸을 때의 색상
  }

  box-sizing: border-box;
  border-radius: 10px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 2px #6f84e2 inset;
  padding: 20px 18px;
  width: 100%;
  height: 320px;
  .total-wrapper {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }
  .date {
    font-size: 12px;
    color: #656565;
    display: flex;
    justify-content: flex-end;
  }
  .title {
    display: flex;
    align-items: center;
  }
  .type-wrapper{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
  }
  .circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid transparent;
    box-shadow: 0 0 0 2px #85cbda inset;
    margin-right: 10px;
  }

  .cafeteria-type {
    font-family: inter;
    font-size: 20px;
    font-weight: bold;
  }

  .today {
    font-family: inter;
    font-size: 15px;
    font-weight: bold;
    margin-left: auto;
  }

  .cafeteria-list {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 15px;
    background-color: #F8F9FD;
    border-radius: 5px;
  }
`;

const DayButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-right: 10px;
`;

const DayButton = styled.div<{ isSelected: boolean }>`
  border-bottom: solid 2px ${({ isSelected }) => (isSelected ? "#A4C5E7" : "#fff")};
  font-weight: 600;
  font-size: 11px;
  color: #404040;
  width: 30px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  padding-bottom: 5px;
  transition: border-bottom 0.3s ease;

  &:hover {
    border-bottom-color: #A4C5E7; // 마우스 호버 시 색상 변경
  }
`;

const CafetriaInfo = styled.div`
  display: flex;
  flex-direction: column;
  .breakfast,
  .lunch,
  .dinner {
    display: flex;
    align-items: center;

    .detail {
      display: flex;
      align-items: center;

      .img {
        width: 25px;
        height: 25px;
      }

      .wrapper {
        min-width: 40px;
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .type {
        font-family: inter;
        font-size: 8px;
        color: #969696;

        font-weight: bold;
        margin: 0;
      }
      .info {
        font-family: inter;
        font-size: 12px;
        font-weight: bold;
        margin-left: 15px;
        color: #404040;
      }
      .detail-wrapper {
        margin-left: 10px;
        border: 0.5px solid #d6d7d9;
        border-radius: 3px;
        display: grid;
        align-items: center;
        justify-content: center;
        min-width: 60px;
        padding: 3px;
        .price,
        .calory {
          font-size: 10px;
          color: #000000;
        }
      }
    }
  }
  justify-content: space-around;
  box-sizing: border-box;
  /* justify-content: space-evenly; */
  .breakfast,
  .lunch,
  .dinner {
    justify-content: flex-start;
  }
`;
const CafetriaType = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  white-space: nowrap;
  gap: 10px;
`;

const Cafeterias = styled.div<{ selected?: boolean }>`
  font-family: inter;
  font-weight: bold;
  font-size: 9px;
  line-height: 25px;
  text-align: center;
  color: #fff;
  background: ${({ selected }) =>
    selected
      ? "linear-gradient(90deg, #83CBD9 0%, #99C7E1 50%, #A1C9F1 100%)"
      : "#DBDBDB"};
  border-radius: 5px;
  width: fit-content;
  margin: 5px;
  padding: 2px 20px;
`;

const TinyCircle = styled.div`
  width: 1px;
  height: 1px;
  background-color: black;
  border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
`;
