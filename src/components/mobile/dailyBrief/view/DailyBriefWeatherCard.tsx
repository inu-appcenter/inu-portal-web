import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { getWeathers } from "@/apis/weathers";
import { WeatherInfo } from "@/types/weathers";
import Icon from "@/components/common/Icon";

export default function DailyBriefWeatherCard() {
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    void getWeathers()
      .then((res) => {
        if (isMounted && res.data) {
          setWeatherData(res.data);
        }
      })
      .catch((err) => {
        console.warn("Daily brief 날씨 조회 실패:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentHour = new Date().getHours();

  // 시간대별 예보 목업/계산
  const hourlyForecast = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 6; i++) {
      const h = (currentHour + i) % 24;
      const period = h < 12 ? "오전" : "오후";
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      let rainProb = 0;
      let icon = "☀️";

      if (weatherData?.sky?.includes("비")) {
        rainProb = 60 + i * 5;
        icon = "🌧️";
      } else if (
        weatherData?.sky?.includes("구름") ||
        weatherData?.sky?.includes("흐림")
      ) {
        rainProb = i % 2 === 0 ? 20 : 10;
        icon = "⛅";
      } else {
        rainProb = i === 2 || i === 4 ? 20 : 0;
        icon = h >= 6 && h <= 18 ? "☀️" : "🌙";
      }

      hours.push({
        time: `${period} ${displayHour}시`,
        icon,
        rainProb: `${rainProb}%`,
      });
    }
    return hours;
  }, [currentHour, weatherData?.sky]);

  const rawTemp = weatherData?.temperature?.replace(/[^0-9.-]/g, "") || "21";
  const tempNumber = parseInt(rawTemp, 10) || 21;
  const maxTemp = tempNumber + 4;
  const minTemp = tempNumber - 5;
  const skyText = weatherData?.sky || "화창";
  const pm10Grade = weatherData?.pm10Grade || "보통";
  const pm25Grade = weatherData?.pm25Grade || "좋음";

  return (
    <SectionWrapper>
      <ContextIntro>날씨 예보를 확인해 보세요.</ContextIntro>
      <WeatherCardWrapper>
        <CardHeader>
          <CardTitle>현재 날씨</CardTitle>
          <EditButton aria-label="날씨 새로고침">
            <Icon name="edit-pencil-01" size={15} color="#FFFFFF" />
          </EditButton>
        </CardHeader>

        <MainWeatherRow>
          <SunIconCircle>
            <InnerSun />
          </SunIconCircle>
          <TempInfoWrapper>
            <TempDegreeRow>
              <CurrentTemp>{rawTemp}°</CurrentTemp>
              <RightMeta>
                <SkyStatus>{skyText}</SkyStatus>
                <TempRange>
                  ↑{maxTemp}° / ↓{minTemp}°
                </TempRange>
              </RightMeta>
            </TempDegreeRow>
            <LocationRow>
              <LocationPin>📍</LocationPin>
              <span>인천 송도 캠퍼스</span>
            </LocationRow>
          </TempInfoWrapper>
        </MainWeatherRow>

        <InfoTextBlock>
          <InfoItem>
            <InfoLabel>오늘의 기온</InfoLabel>
            <InfoValue>어제와 기온이 거의 비슷합니다</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>일몰을 놓치지 마세요</InfoLabel>
            <InfoValue>일몰 시각은 오후 6:37 입니다</InfoValue>
          </InfoItem>
        </InfoTextBlock>

        <PrecipitationSection>
          <PrecipitationTitle>강수 확률</PrecipitationTitle>
          <HourlyForecastScroll>
            {hourlyForecast.map((item, idx) => (
              <HourlyItem key={idx}>
                <HourTime>{item.time}</HourTime>
                <HourIcon>{item.icon}</HourIcon>
                <RainProbRow>
                  <UmbrellaIcon>☂</UmbrellaIcon>
                  <span>{item.rainProb}</span>
                </RainProbRow>
              </HourlyItem>
            ))}
          </HourlyForecastScroll>
        </PrecipitationSection>

        <AirQualityFooter>
          <AirQualityLabel>미세먼지</AirQualityLabel>
          <AirQualityValue>
            {pm10Grade} · 초미세먼지 {pm25Grade}
          </AirQualityValue>
        </AirQualityFooter>
      </WeatherCardWrapper>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
`;

const WeatherCardWrapper = styled.div`
  background: linear-gradient(155deg, #3a7fe4 0%, #4a8ff0 50%, #5ba0f7 100%);
  border-radius: 28px;
  padding: 24px 20px 20px 20px;
  box-shadow:
    0 8px 24px rgba(58, 127, 228, 0.28),
    0 2px 6px rgba(0, 0, 0, 0.04);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.4px;
  margin: 0;
`;

const EditButton = styled.button`
  background: rgba(255, 255, 255, 0.22);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background-color 0.15s ease;

  &:active {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const MainWeatherRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const SunIconCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: radial-gradient(circle, #ffea79 0%, #ffc837 80%, #ffb300 100%);
  box-shadow: 0 0 20px rgba(255, 200, 55, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InnerSun = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #ffc837;
`;

const TempInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const TempDegreeRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

const CurrentTemp = styled.span`
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1.5px;
  color: #ffffff;
`;

const RightMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const SkyStatus = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
`;

const TempRange = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const LocationPin = styled.span`
  font-size: 12px;
`;

const InfoTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const InfoLabel = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
`;

const InfoValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
`;

const PrecipitationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 6px;
`;

const PrecipitationTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.3px;
`;

const HourlyForecastScroll = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const HourlyItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 48px;
`;

const HourTime = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
`;

const HourIcon = styled.span`
  font-size: 18px;
`;

const RainProbRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const UmbrellaIcon = styled.span`
  font-size: 10px;
  opacity: 0.85;
`;

const AirQualityFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  padding-top: 14px;
  font-size: 13.5px;
`;

const AirQualityLabel = styled.span`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
`;

const AirQualityValue = styled.span`
  font-weight: 700;
  color: #ffffff;
`;
