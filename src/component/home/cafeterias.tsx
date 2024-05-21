import styled from "styled-components";
import { cafeteriasList } from "../../resource/string/cafeterias";
import { useEffect, useState } from "react";
import getCafeteria from "../../utils/getCafeteria";
import dinnerImg from "../../resource/assets/Sunset.png";
import lunchImg from "../../resource/assets/Sun.png";
import breakfastImg from "../../resource/assets/Sunrise.png";
export default function Cafeteria() {
  const [cafeteriaType, setCafeteriaType] = useState("학생식당");
  const [cafeteriaInfo , setCageteriaInfo] = useState([]); 
  const [cafeteriaTypes, setCafeteriaTypes] = useState<string[]>([]);
  const [cafeteriaDetail, setCafeteriaDetail] = useState<{ 구성원가: string, 칼로리: string }[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  useEffect(() => {
    const fetchCafeteria = async () => {
      try {
        const response = await getCafeteria(cafeteriaType);
        const processedData = response.data.map((info: string) => extractValues(info));
        const infoData = response.data.map((info: string) => extractMenu(info));
        console.log(processedData,"여기여기여기",infoData);
        console.log(response,"return 값");
        setCageteriaInfo(infoData);
        setCafeteriaDetail(processedData);
        console.log(cafeteriaInfo,processedData,"wwww");
      } catch (error) {
        console.error('학식 정보 조회 안됨');
      }
    };

    fetchCafeteria();


    const date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()]; // 현재 월 이름
    const day = date.getDate(); // 현재 일
    const year = date.getFullYear(); // 현재 년도
    
    const formattedDate = `${month} ${day}, ${year}`;
    setCurrentDate(formattedDate);
    console.log("타입들",cafeteriaTypes);
  }, [cafeteriaType]);


  const handleCafeteriaType = (title: string,info:string[]) => {
    setCafeteriaType(title);
    setCafeteriaTypes(info);
  };


  function extractValues(input: string): { 구성원가: string, 칼로리: string } | null {
    const price= input.match(/([0-9,]+)원/);
    const calory = input.match(/[0-9,]+kcal/);
    console.log("구성원가,칼로리",price,calory);
    if (price && calory) {
        return {
            구성원가: price[0],
            칼로리: calory[0]
        };
    }

    return null;
}

useEffect(() => {
  console.log("타입들", cafeteriaTypes);
}, [cafeteriaTypes]); 


function extractMenu(input: string): string | null {
  const match = input.match(/^(.*?)(?=\s[0-9,]+원)/);
  return match ? match[1].trim() : input;
}

  return (
    <>
      <CafeteriaWrapper>
                <div className="title">
                <div className="circle"></div>
                <div className="cafeteria-type">{cafeteriaType}</div>
                <h1 className="today">Today</h1>
                </div>
                <span className="date">{currentDate}</span>
                <div className="cafeteria-list">
                <CafetriaInfo>
                <div className="breakfast">
<div className="detail">
                <div className="wrapper">
                  {cafeteriaTypes[0] !== '없음' && (
                    <>
                      <img src={breakfastImg} alt="조식" />
                      <p className="type">{cafeteriaTypes[0]}</p>
                    </>
                  )}
                </div>
                {cafeteriaTypes[0] !== '없음' && <p className="info">{cafeteriaInfo[0]}</p>}
              </div>
        </div>
        <div className="lunch">
        <div className="detail">
            <div className="wrapper">
                <img src={lunchImg} alt="중식" />
                <p className="type">{cafeteriaTypes[1]}</p>
           </div>
            <p className="info">{cafeteriaInfo[1]}</p>
        </div>
        </div>
        <div className="dinner">
            <div className="detail">
                <div className="wrapper">
                    <img src={dinnerImg} alt="석식" />
                    <p className="type">{cafeteriaTypes[2]}</p>
                    
            </div>
                <p className="info">{cafeteriaInfo[2]}</p>
            </div>
</div>


        </CafetriaInfo>
        <CafeteriaDetail>
          {cafeteriaDetail.map((detail, index) => (
            detail && (
              <div key={index} className="detail-wrapper">
                <p className="price">{detail.칼로리}</p>
                <TinyCircle/>
                <p className="calory">{detail.구성원가}</p>
              </div>
            )
          ))}
        </CafeteriaDetail>
        <CafetriaType>

        {cafeteriasList.map((cafeteria) => (
          <Cafeterias className="cafeteria"key={cafeteria.id} onClick={() => handleCafeteriaType(cafeteria.title,cafeteria.info)}>
            <div className="cafeteria-title">{cafeteria.title}</div>
          </Cafeterias>
        ))}
         </CafetriaType>
        </div>
      </CafeteriaWrapper>
    </>
  );
}

const CafeteriaWrapper = styled.div`
  width: 550px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 2px #6f84e2 inset;
  padding: 20px 18px;

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

  .circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid transparent;
    box-shadow: 0 0 0 2px #85cbda inset;
    margin-right: 10px; 
  }

  .cafeteria-type {
    font-size: 20px;
    font-weight: bold;
  }

  .today {
    font-size: 15px;
    font-weight: bold;
    margin-left: auto; 
  }

  .cafeteria-list{
    display: flex;
    justify-content: space-between;
    gap:10px;
  }
`;

const CafetriaInfo = styled.div`
    display: flex;
    flex-direction: column;
    /* gap:20px;     */
    .breakfast, .lunch , .dinner {
        display: flex;
        align-items: center;

        .detail {
            display: flex;
            align-items: center;

            .img {
            width:25px;
            height:25px;
        }

            .wrapper{
              
            }

            .type {
                font-size: 8px;
                color:#969696;
               
                font-weight: bold;
                margin:0;
            }
            .info {
                font-size:12px;
                font-weight: bold;
                margin-left:15px;
            }

            
        }
       
       
        
    }
    width: 325px;
    /* justify-content: space-evenly; */
    .breakfast, .lunch , .dinner {
        justify-content: flex-start;
    }
`;

const CafeteriaDetail = styled.div`
display: flex;
flex-direction: column;
/* justify-content: space-evenly; */
gap: 44px;
margin-top: 17px;
  .detail-wrapper {
              border: 0.5px solid #D6D7D9;
              border-radius: 3px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap:4px;
              width: 45px;
              
              .price , .calory {
                font-size: 4px;
                color: #888888;
              }

            }

`;
const CafetriaType = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
`

const Cafeterias  = styled.div`
  font-weight: bold;
  font-size: 10px;
  line-height: 25px;
  text-align:center;
  color:#fff;

  .cafeteria-title {
    padding:2px 20px;
    background:linear-gradient(90deg, #83CBD9 0%, #99C7E1 50%, #A1C9F1 100%);
    border-radius: 5px;
    width: 93px;
    margin: 5px;
  }
`

const TinyCircle = styled.div`
  width: 1px;
  height: 1px;
  background-color: black;
  border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
`;