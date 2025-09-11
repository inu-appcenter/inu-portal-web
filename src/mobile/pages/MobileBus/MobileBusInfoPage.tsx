import { useLocation } from "react-router-dom";
import styled from "styled-components";
import BusTabHeader from "mobile/components/bus/BusTabHeader";
import GoSchoolINU from "../../components/bus/goHomeSchool/GoSchoolINU.tsx";
import GoSchoolBIT from "../../components/bus/goHomeSchool/GoSchoolBIT.tsx";
import GoHomeMain from "../../components/bus/goHomeSchool/GoHomeMain.tsx";
import GoHomeDorm from "../../components/bus/goHomeSchool/GoHomeDorm.tsx";
import GoHomeScience from "../../components/bus/goHomeSchool/GoHomeScience.tsx";
import MichuholShuttle from "../../components/bus/shuttle/MichuholShuttle.tsx";
import SubwayShuttle from "../../components/bus/shuttle/SubwayShuttle.tsx";
import SchoolShuttle from "../../components/bus/shuttle/SchoolShuttle.tsx";
import MobileHeader from "../../containers/common/MobileHeader.tsx";

export default function BusInfoPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const type = query.get("type") || "go-school";
  const tab = query.get("tab");
  //디폴트 탭
  const defaultTab =
    type === "go-school"
      ? "INU"
      : type === "go-home"
        ? "main"
        : "michuholShuttle";
  const selectedTab = tab ?? defaultTab;

  return (
    <BusInfoPageWrapper>
      <MobileHeader
        title={`${type === "go-school" ? "학교 갈래요" : type === "go-home" ? "집 갈래요" : type === "shuttle" ? "셔틀버스" : "인입런"}`}
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
  padding-top: 56px;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
`;
