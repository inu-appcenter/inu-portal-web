import { useLocation } from "react-router-dom";
import styled from "styled-components";
import BusTabHeader from "mobile/components/bus/BusTabHeader";
import GoSchoolINU from "../../components/bus/GoSchoolINU.tsx";
import GoSchoolBIT from "../../components/bus/GoSchoolBIT.tsx";
import GoHomeMain from "../../components/bus/GoHomeMain.tsx";
import GoHomeDorm from "../../components/bus/GoHomeDorm.tsx";
import GoHomeScience from "../../components/bus/GoHomeScience.tsx";
import MichuholShuttle from "../../components/bus/MichuholShuttle.tsx";
import SubwayShuttle from "../../components/bus/SubwayShuttle.tsx";
import SchoolShuttle from "../../components/bus/SchoolShuttle.tsx";

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
      <BusTabHeader Type={type} />
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
    </BusInfoPageWrapper>
  );
}

const BusInfoPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
`;
