import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import GoSchoolINU from "@/components/mobile/bus/goHomeSchool/GoSchoolINU.tsx";
import GoSchoolBIT from "@/components/mobile/bus/goHomeSchool/GoSchoolBIT.tsx";
import GoHomeMain from "@/components/mobile/bus/goHomeSchool/GoHomeMain.tsx";
import GoHomeDorm from "@/components/mobile/bus/goHomeSchool/GoHomeDorm.tsx";
import GoHomeScience from "@/components/mobile/bus/goHomeSchool/GoHomeScience.tsx";
import MichuholShuttle from "@/components/mobile/bus/shuttle/MichuholShuttle.tsx";
import SubwayShuttle from "@/components/mobile/bus/shuttle/SubwayShuttle.tsx";
import SchoolShuttle from "@/components/mobile/bus/shuttle/SchoolShuttle.tsx";
import { postApiLogs } from "@/apis/members";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";

export default function BusInfoPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const tab = query.get("category");

  // 디폴트 탭
  const defaultTab =
    type === "go-school"
      ? "인입런"
      : type === "go-home"
        ? "인천대 정문"
        : "사범대 셔틀";
  const selectedTab = tab ?? defaultTab;

  const [tabList, setTabList] = useState<string[]>([]);

  useEffect(() => {
    const logApi = async () => {
      console.log("현재 type:", type);

      if (type === "go-school") {
        console.log("학교 가는 버스 탭 선택됨");
        setTabList(["인입런", "지정단런"]);
        await postApiLogs("/api/buses/go-school");
      } else if (type === "go-home") {
        console.log("집 가는 버스 탭 선택됨");
        setTabList(["인천대 정문", "공대/자연대", "기숙사 앞"]);
        await postApiLogs("/api/buses/go-home");
      } else if (type === "shuttle") {
        console.log("셔틀버스 탭 선택됨");
        setTabList(["사범대 셔틀", "인천대입구 셔틀", "통학 셔틀"]);
        await postApiLogs("/api/buses/shuttle");
      }
    };

    logApi();
  }, [type]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={tabList}
        selectedCategory={selectedTab}
      />
    ),
    [tabList, selectedTab],
  ); // 의존성 배열 관리

  useHeader({
    title: `${
      type === "go-school"
        ? "학교 갈래요"
        : type === "go-home"
          ? "집 갈래요"
          : type === "shuttle"
            ? "셔틀버스"
            : "인입런"
    }`,
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  return (
    <BusInfoPageWrapper>
      <ContentWrapper>
        {type === "go-school" && selectedTab === "인입런" && <GoSchoolINU />}
        {type === "go-school" && selectedTab === "지정단런" && <GoSchoolBIT />}
        {type === "go-home" && selectedTab === "인천대 정문" && <GoHomeMain />}
        {type === "go-home" && selectedTab === "공대/자연대" && (
          <GoHomeScience />
        )}
        {type === "go-home" && selectedTab === "기숙사 앞" && <GoHomeDorm />}
        {type === "shuttle" && selectedTab === "사범대 셔틀" && (
          <MichuholShuttle />
        )}
        {type === "shuttle" && selectedTab === "인천대입구 셔틀" && (
          <SubwayShuttle />
        )}
        {type === "shuttle" && selectedTab === "통학 셔틀" && <SchoolShuttle />}
      </ContentWrapper>
    </BusInfoPageWrapper>
  );
}

const BusInfoPageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  padding-bottom: 100px;
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
`;
