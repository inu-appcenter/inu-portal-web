import { useEffect, useState } from "react";
import styled from "styled-components";

import {
  FALLBACK_SKY_CONDITION_SLUG,
  PM_GRADE_ILLUSTRATIONS,
  PM_GRADE_SLUGS,
  SKY_CONDITION_SLUGS,
  SKY_ILLUSTRATIONS,
  WEATHER_BACKGROUND,
  type PmGradeName,
  type SkyConditionName,
} from "@/resources/assets/illustrations/weather";
import { getWeathers } from "@/apis/weathers";
import { WeatherInfo } from "@/types/weathers";

type SkyPresentation = {
  image: string;
  gradient: string;
  isShiftedIcon: boolean;
};

const getTemperatureValue = (temperature: string) =>
  temperature.replace(/\s+/g, "").replace(/[°℃]|C$/gi, "");

const NIGHT_GRADIENT =
  "linear-gradient(90deg, #374d7c 4.5%, #0b2143 52.5%, #000306 100%)";

const DAY_GRADIENTS: Record<SkyConditionName, string> = {
  맑음: "linear-gradient(90deg, #b5f1fb 0%, #8ce3d6 100%)",
  구름: "linear-gradient(90deg, #fff7f0 0%, #85b3f2 100%)",
  눈: "linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%)",
  진눈깨비: "linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%)",
  비: "linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%)",
};

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

  const getSkyPresentation = (sky: string, day: string): SkyPresentation => {
    const isNight = day === "night";
    const skyName = (sky in SKY_CONDITION_SLUGS ? sky : "맑음") as SkyConditionName;
    const slug = SKY_CONDITION_SLUGS[skyName] ?? FALLBACK_SKY_CONDITION_SLUG;
    const illustration = SKY_ILLUSTRATIONS[slug];

    return {
      image: isNight ? illustration.night : illustration.day,
      gradient: isNight ? NIGHT_GRADIENT : DAY_GRADIENTS[skyName],
      isShiftedIcon: illustration.isShiftedIcon,
    };
  };

  const getPm10GradeImage = (pm10Grade: string) => {
    const slug = PM_GRADE_SLUGS[pm10Grade as PmGradeName];
    return slug ? PM_GRADE_ILLUSTRATIONS[slug] : undefined;
  };

  const pm10GradeImage = weather?.pm10Grade ? getPm10GradeImage(weather.pm10Grade) : undefined;
  const temperatureValue = weather?.temperature ? getTemperatureValue(weather.temperature) : "";

  const { image, gradient, isShiftedIcon } = getSkyPresentation(
    weather?.sky || "",
    weather?.day || "",
  );

  return (
    <WeatherWrapper>
      <WeatherBackground $gradient={gradient}>
        <BackImage src={WEATHER_BACKGROUND} alt="" />
        <WeatherContent>
          <WeatherIcon src={image} alt={weather?.sky || ""} $isShifted={isShiftedIcon} />
          <Info>
            <p className="temperature">
              <span className="temperatureValue">{temperatureValue || "-"}</span>
              <span className="temperatureUnit">°</span>
            </p>
            <p className="pm10grade">
              {pm10GradeImage ? (
                <img
                  className="pmGradeColor"
                  src={pm10GradeImage}
                  alt={weather?.pm10Grade || ""}
                />
              ) : null}
              미세먼지 : {weather?.pm10Grade || "-"}
            </p>
            <p className="location">연수구 송도동</p>
          </Info>
        </WeatherContent>
      </WeatherBackground>
    </WeatherWrapper>
  );
}

const WeatherWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
`;

const WeatherBackground = styled.div<{ $gradient: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: ${(props) => props.$gradient};
`;

const BackImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const WeatherContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(8px, 2.2vw, 20px);
  width: 100%;
  height: 100%;
  padding: 0 clamp(8px, 2vw, 18px) 0 clamp(2px, 0.8vw, 10px);
  box-sizing: border-box;
`;

const WeatherIcon = styled.img<{ $isShifted: boolean }>`
  flex: 0 0 auto;
  width: ${(props) =>
    props.$isShifted
      ? "clamp(132px, 29vw, 214px)"
      : "clamp(142px, 32vw, 236px)"};
  max-width: 48%;
  max-height: 100%;
  object-fit: contain;
`;

const Info = styled.div`
  display: flex;
  gap: clamp(6px, 1.2vw, 12px);
  flex: 0 1 auto;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  padding-right: clamp(12px, 3vw, 28px);

  .temperature {
    display: inline-flex;
    align-items: flex-start;
    gap: 2px;
    width: fit-content;
    min-width: 0;
    margin: 0;
    padding: 0 0 4px;
    border-bottom: 2px solid #fff;
    color: white;
    line-height: 1;
    white-space: nowrap;
  }

  .temperatureValue {
    font-size: clamp(40px, 7vw, 66px);
    font-weight: 400;
    letter-spacing: -0.04em;
  }

  .temperatureUnit {
    font-size: clamp(18px, 3vw, 26px);
    font-weight: 400;
    line-height: 1;
    margin-top: clamp(2px, 0.5vw, 4px);
  }

  .pm10grade {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: white;
    font-size: clamp(12px, 2.1vw, 16px);
    font-weight: 400;
    line-height: 1.25;
    white-space: nowrap;
  }

  .pmGradeColor {
    width: clamp(12px, 2.1vw, 16px);
    height: clamp(12px, 2.1vw, 16px);
    flex: 0 0 auto;
  }

  .location {
    margin: 0;
    color: white;
    font-size: clamp(20px, 3.2vw, 26px);
    font-weight: 400;
    line-height: 1.15;
    white-space: nowrap;
  }
`;
