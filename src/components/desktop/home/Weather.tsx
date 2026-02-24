import styled from "styled-components";
import { useEffect, useState } from "react";
import WeatherBackgroundImage from "@/resources/assets/weather/weather-background.svg";
import sunImg from "@/resources/assets/weather/sun.svg";
import snowImg from "@/resources/assets/weather/snow.svg";
import cloudImg from "@/resources/assets/weather/cloud.svg";
import sleetImg from "@/resources/assets/weather/sleet.svg";
import rainImg from "@/resources/assets/weather/rain.svg";
import moonImg from "@/resources/assets/weather/moon.svg";
import cloud_moonImg from "@/resources/assets/weather/cloud_moon.svg";
import pmGradeGood from "@/resources/assets/weather/pmGrade-good.svg";
import pmGradeNormal from "@/resources/assets/weather/pmGrade-normal.svg";
import pmGradeHarm from "@/resources/assets/weather/pmGrade-harm.svg";
import pmGradeverHarm from "@/resources/assets/weather/pmGrade-veryharm.svg";
import { getWeathers } from "@/apis/weathers";
import { WeatherInfo } from "@/types/weathers";

export default function Weather() {
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
    let isShiftedIcon = false;

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
        isShiftedIcon = true;
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
        isShiftedIcon = true;
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
        isShiftedIcon = true;
        break;
      default:
        image = "";
        gradient = "linear-gradient(90deg, #b5f1fb 0%, #8ce3d6 100%)";
        break;
    }

    return { image, gradient, isShiftedIcon };
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

  const { image, gradient, isShiftedIcon } = getSky(weather.sky, weather.day);
  const pm10GradeImage = getPm10Grade(weather.pm10Grade);

  return (
    <WeatherWrapper>
      <WeatherBackground $gradient={gradient}>
        <BackImage src={WeatherBackgroundImage} alt="" />
        <WeatherIcon src={image} alt={weather.sky} $isShifted={isShiftedIcon} />
        <Info>
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
        </Info>
      </WeatherBackground>
    </WeatherWrapper>
  );
}

const WeatherWrapper = styled.div`
  height: 160px;
  width: 100%;
  margin-top: 32px;
  position: relative;
  display: flex;
  border-radius: 12px;
`;

const WeatherBackground = styled.div<{ $gradient: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-around;
  border-radius: 10px;
  background: ${(props) => props.$gradient};
`;

const BackImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const WeatherIcon = styled.img<{ $isShifted: boolean }>`
  position: absolute;
  top: ${(props) => (props.$isShifted ? "0" : "-60px")};
  left: ${(props) => (props.$isShifted ? "20px" : "0")};
  height: ${(props) => (props.$isShifted ? "160px" : "220px")};
  object-fit: cover;
`;

const Info = styled.div`
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
      left: 20;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid transparent;
      box-shadow: 0 0 0 1px #fff inset;
    }
  }

  .pm10grade {
    font-size: 12px;
    font-weight: normal;
    color: white;
    display: flex;
    align-items: center;
  }

  .pmGradeColor {
    margin: 0 6px;
  }

  .location {
    font-size: 20px;
    color: white;
    margin: 0;
  }
`;
