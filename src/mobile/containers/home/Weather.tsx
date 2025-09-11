import { useEffect, useState } from "react";
import styled from "styled-components";
import sunImg from "resources/assets/weather/sun.svg";
import snowImg from "resources/assets/weather/snow.svg";
import cloudImg from "resources/assets/weather/cloud.svg";
import sleetImg from "resources/assets/weather/sleet.svg";
import rainImg from "resources/assets/weather/rain.svg";
import moonImg from "resources/assets/weather/moon.svg";
import cloud_moonImg from "resources/assets/weather/cloud_moon.svg";
import pmGradeGood from "resources/assets/weather/pmGrade-good.svg";
import pmGradeNormal from "resources/assets/weather/pmGrade-normal.svg";
import pmGradeHarm from "resources/assets/weather/pmGrade-harm.svg";
import pmGradeverHarm from "resources/assets/weather/pmGrade-veryharm.svg";
import back from "resources/assets/weather/weather-background.svg";
import { getWeathers } from "apis/weathers";
import { WeatherInfo } from "types/weathers";

export default function WeatherForm() {
  const [weather, setWeather] = useState<WeatherInfo>({
    sky: "",
    temperature: "",
    pm10Value: "",
    pm10Grade: "",
    pm25Value: "",
    pm25Grade: "",
    day: "",
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await getWeathers();
        setWeather(response.data);
      } catch (error) {
        console.error("날씨 가져오기 실패", error);
      }
    };
    fetchWeather();
  }, []);

  const getSky = (sky: string, day: string) => {
    let image = "";
    let gradient = "";

    switch (sky) {
      case "맑음":
        if (day === "night") {
          image = moonImg;
          gradient =
            "linear-gradient(90deg, #374d7c 4.5%, #0b2143 52.5%, #000306 100%)";
        } else {
          image = sunImg;
          gradient = "linear-gradient(90deg, #b5f1fb 0%, #8ce3d6 100%)";
        }
        break;
      case "구름":
        if (day === "night") {
          image = cloud_moonImg;
          gradient =
            "linear-gradient(90deg, #374d7c 4.5%, #0b2143 52.5%, #000306 100%)";
        } else {
          image = cloudImg;
          gradient = "linear-gradient(90deg, #fff7f0 0%, #85b3f2 100%)";
        }
        break;
      case "눈":
        if (day === "night") {
          image = snowImg;
          gradient =
            "linear-gradient(90deg, #374d7c 4.5%, #0b2143 52.5%, #000306 100%)";
        } else {
          image = snowImg;
          gradient = "linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%)";
        }
        break;
      case "진눈깨비":
        if (day === "night") {
          image = sleetImg;
          gradient =
            "linear-gradient(90deg, #374d7c 4.5%, #0b2143 52.5%, #000306 100%)";
        } else {
          image = sleetImg;
          gradient = "linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%)";
        }
        break;
      case "비":
        if (day === "night") {
          image = rainImg;
          gradient =
            "linear-gradient(90deg, #374d7c 4.5%, #0b2143 52.5%, #000306 100%)";
        } else {
          image = rainImg;
          gradient = "linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%)";
        }
        break;
      default:
        image = "";
        gradient = "linear-gradient(90deg, #b5f1fb 0%, #8ce3d6 100%)";
        break;
    }

    return { image, gradient };
  };

  const getPm10Grade = (pm10Grade: string) => {
    switch (pm10Grade) {
      case "좋음":
        return pmGradeGood;
      case "보통":
        return pmGradeNormal;
      case "나쁨":
        return pmGradeHarm;
      case "매우나쁨":
        return pmGradeverHarm;
      default:
        return;
    }
  };

  const { image, gradient } = getSky(weather.sky, weather.day);
  const pm10GradeImage = getPm10Grade(weather.pm10Grade);

  return (
    <WeatherWrapper>
      <WeatherBackground $gradient={gradient}>
        <BackImage src={back} alt="" />
        <WeatherIcon src={image} alt={weather.sky} />
        <Wrapper>
          <p className="temperature">{weather.temperature}</p>
          <p className="pm10grade">
            <img
              className="pmGradeColor"
              src={pm10GradeImage}
              alt={weather.pm10Grade}
            />
            미세먼지 : {weather.pm10Grade}
          </p>
          <p className="location">연수구 송도동</p>
        </Wrapper>
      </WeatherBackground>
    </WeatherWrapper>
  );
}

const WeatherWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WeatherBackground = styled.div<{ $gradient: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 20px 0 40px 0;
  box-sizing: border-box;
  justify-content: space-around;
  background: ${(props) => props.$gradient};
`;

const BackImage = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const WeatherIcon = styled.img`
  max-width: 180px;
  max-height: 180px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .temperature {
    width: 100px;
    font-size: 50px;
    font-weight: normal;
    color: white;
    margin: 0 20px 0 0;
    border-bottom: 2px solid #fff;
    position: relative;
    padding-right: 40px;

    &::after {
      content: " ";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 20;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid transparent;
      box-shadow: 0 0 0 1px #fff inset;
      margin-right: 8px;
    }
  }

  .pm10grade {
    font-size: 12px;
    font-weight: normal;
    color: white;
    margin-bottom: 1em;
  }

  .pmGradeColor {
    margin: 0 5px;
  }

  .location {
    font-size: 20px;
    font-weight: normal;
    color: white;
    margin: 0;
  }
`;
