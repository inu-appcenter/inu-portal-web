import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import GoSchoolINU from "@/components/mobile/bus/goHomeSchool/GoSchoolINU";
import GoSchoolBIT from "@/components/mobile/bus/goHomeSchool/GoSchoolBIT";
import GoHomeMain from "@/components/mobile/bus/goHomeSchool/GoHomeMain";
import GoHomeDorm from "@/components/mobile/bus/goHomeSchool/GoHomeDorm";
import GoHomeScience from "@/components/mobile/bus/goHomeSchool/GoHomeScience";
import MichuholShuttle from "@/components/mobile/bus/shuttle/MichuholShuttle";
import SubwayShuttle from "@/components/mobile/bus/shuttle/SubwayShuttle";
import SchoolShuttle from "@/components/mobile/bus/shuttle/SchoolShuttle";
import { postApiLogs } from "@/apis/members";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import {
  buildBusUiRoute,
  getStoredBusUiVersion,
  isSwitchableBusInfoType,
  setStoredBusUiVersion,
} from "@/utils/busUiPreference";

export default function BusInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const tab = query.get("category");

  const defaultTab =
    type === "go-school"
      ? "인입런"
      : type === "go-home"
        ? "인천대 정문"
        : "사범대 셔틀";
  const selectedTab = tab ?? defaultTab;
  const shouldUseNewUi =
    isSwitchableBusInfoType(type) && getStoredBusUiVersion() === "new";
  const redirectTarget = shouldUseNewUi
    ? buildBusUiRoute({
        type,
        category: selectedTab,
        version: "new",
      })
    : null;

  const [tabList, setTabList] = useState<string[]>([]);

  useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    return undefined;
  }, [navigate, redirectTarget]);

  useEffect(() => {
    if (redirectTarget) {
      return;
    }

    const logApi = async () => {
      if (type === "go-school") {
        setTabList(["인입런", "지정단런"]);
        await postApiLogs("/api/buses/go-school");
      } else if (type === "go-home") {
        setTabList(["인천대 정문", "공대/자연대", "기숙사 앞"]);
        await postApiLogs("/api/buses/go-home");
      } else if (type === "shuttle") {
        setTabList(["사범대 셔틀", "인천대입구 셔틀", "통학 셔틀"]);
        await postApiLogs("/api/buses/shuttle");
      }
    };

    void logApi();
  }, [redirectTarget, type]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={tabList}
        selectedCategory={selectedTab}
      />
    ),
    [selectedTab, tabList],
  );

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    if (!isSwitchableBusInfoType(type)) {
      return undefined;
    }

    return [
      {
        label: "신 버전으로 사용하기",
        onClick: () => {
          setStoredBusUiVersion("new");
          navigate(
            buildBusUiRoute({
              type,
              category: selectedTab,
              version: "new",
            }),
            { replace: true },
          );
        },
      },
    ];
  }, [navigate, selectedTab, type]);

  useHeader({
    title:
      type === "go-school"
        ? "학교 갈래요"
        : type === "go-home"
          ? "집 갈래요"
          : type === "shuttle"
            ? "셔틀버스"
            : "인입런",
    subHeader,
    menuItems,
    floatingSubHeader: true,
  });

  if (redirectTarget) {
    return null;
  }

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

  @media ${DESKTOP_MEDIA} {
    height: 100%;
    min-height: 0;
    padding-bottom: 0;
    overflow: hidden;
  }
`;

const ContentWrapper = styled.div`
  padding: 8px ${MOBILE_PAGE_GUTTER} 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media ${DESKTOP_MEDIA} {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0 20px;
  }
`;
