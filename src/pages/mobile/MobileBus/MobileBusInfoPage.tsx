import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { useEffect } from "react";
import BusTabHeader from "@/components/mobile/bus/BusTabHeader";
import GoSchoolINU from "@/components/mobile/bus/goHomeSchool/GoSchoolINU.tsx";
import GoSchoolBIT from "@/components/mobile/bus/goHomeSchool/GoSchoolBIT.tsx";
import GoHomeMain from "@/components/mobile/bus/goHomeSchool/GoHomeMain.tsx";
import GoHomeDorm from "@/components/mobile/bus/goHomeSchool/GoHomeDorm.tsx";
import GoHomeScience from "@/components/mobile/bus/goHomeSchool/GoHomeScience.tsx";
import MichuholShuttle from "@/components/mobile/bus/shuttle/MichuholShuttle.tsx";
import SubwayShuttle from "@/components/mobile/bus/shuttle/SubwayShuttle.tsx";
import SchoolShuttle from "@/components/mobile/bus/shuttle/SchoolShuttle.tsx";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";
import { postApiLogs } from "@/apis/members";

export default function BusInfoPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const type = query.get("type") || "go-school";
  const tab = query.get("tab");

  // 디폴트 탭
  const defaultTab =
    type === "go-school"
      ? "INU"
      : type === "go-home"
        ? "main"
        : "michuholShuttle";
  const selectedTab = tab ?? defaultTab;

  useEffect(() => {
    const logApi = async () => {
      console.log("현재 type:", type);

      if (type === "go-school") {
        console.log("학교 가는 버스 탭 선택됨");
        await postApiLogs("/api/buses/go-school");
      } else if (type === "go-home") {
        console.log("집 가는 버스 탭 선택됨");
        await postApiLogs("/api/buses/go-home");
      } else if (type === "shuttle") {
        console.log("셔틀버스 탭 선택됨");
        await postApiLogs("/api/buses/shuttle");
      }
    };

    logApi();
  }, [type]);

  return (
    <BusInfoPageWrapper>
      <MobileHeader
        title={`${
          type === "go-school"
            ? "학교 갈래요"
            : type === "go-home"
              ? "집 갈래요"
              : type === "shuttle"
                ? "셔틀버스"
                : "인입런"
        }`}
      />
      <BusTabHeader Type={type} />
      <ContentWrapper>
        {type === "go-school" && selectedTab === "INU" && <GoSchoolINU />}
        {type === "go-school" && selectedTab === "BIT" && <GoSchoolBIT />}
        {type === "go-home" && selectedTab === "main" && <GoHomeMain />}
        {type === "go-home" && selectedTab === "science" && <GoHomeScience />}
        {type === "go-home" && selectedTab === "dorm" && <GoHomeDorm />}
        {type === "shuttle" && selectedTab === "michuholShuttle" && (
          <MichuholShuttle />
        )}
        {type === "shuttle" && selectedTab === "subwayShuttle" && (
          <SubwayShuttle />
        )}
        {type === "shuttle" && selectedTab === "schoolShuttle" && (
          <SchoolShuttle />
        )}
      </ContentWrapper>
    </BusInfoPageWrapper>
  );
}

const BusInfoPageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
`;
