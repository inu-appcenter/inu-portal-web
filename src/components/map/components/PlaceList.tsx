import styled from "styled-components";
import LocationIcon from "@/resources/assets/mapIcons/LocationIcon.svg";
import OpenIcon from "@/resources/assets/mapIcons/OpenIcon.svg";
import CloseIcon from "@/resources/assets/mapIcons/CloseIcon.svg";
import CafeIcon from "@/resources/assets/mapIcons/CafeIcon.svg";
import RestaurantIcon from "@/resources/assets/mapIcons/RestaurantIcon.svg";
import ConvienienceStoreIcon from "@/resources/assets/mapIcons/ConvenienceStoreIcon.svg";
import ManRestIcon from "@/resources/assets/mapIcons/manRest.svg";
import WomanRestIcon from "@/resources/assets/mapIcons/womanRest.svg";
import PublicRestIcon from "@/resources/assets/mapIcons/publicRest.svg";

import { useState, ReactNode, useRef, useEffect } from "react";
import { Place } from "@/components/map/DB";
import {
  BOTTOM_SHEET_HEIGHT,
  MAP_TAB_CONFIG,
  TabType,
} from "../constants/mapConfig";

interface PlaceListProps {
  places: Place[];
  map: any;
  selectedTab: TabType;
  setSelectedCoord: (coord: { X: number; Y: number }) => void;
  openedMarkerId: string | null;
  setOpenedMarkerId: (id: string | null) => void;
  renderDetail: (place: Place) => ReactNode;
  setSnap: (snap: string | number | null) => void;
}

const PlaceList = ({
  places,
  map,
  selectedTab,
  setSelectedCoord,
  openedMarkerId,
  setOpenedMarkerId,
  renderDetail,
  setSnap,
}: PlaceListProps) => {
  const [openIndex, setOpenIndex] = useState(-1);
  const config = MAP_TAB_CONFIG[selectedTab];
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 탭 변경 시 리스트 상단으로 스크롤 및 인덱스 초기화
  useEffect(() => {
    setOpenIndex(-1);
  }, [selectedTab]);

  // 외부(지도 핀 클릭)에서 openedMarkerId가 변경될 때 대응
  useEffect(() => {
    if (openedMarkerId) {
      const index = places.findIndex(
        (p) => config.getMarkerId(p) === openedMarkerId,
      );
      if (index !== -1) {
        setOpenIndex(index);
        // 바텀시트가 올라오고 리스트가 렌더링될 시간을 벌기 위해 지연 스크롤
        setTimeout(() => {
          itemRefs.current[index]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 400);
      }
    }
  }, [openedMarkerId, places, config]);

  const getIcon = (place: Place) => {
    if (selectedTab === "카페") return CafeIcon;
    if (selectedTab === "식당") {
      return place.category === "식당"
        ? RestaurantIcon
        : place.category === "편의점"
          ? ConvienienceStoreIcon
          : LocationIcon;
    }
    if (selectedTab === "휴게실") {
      return place.category === "여자휴게실"
        ? WomanRestIcon
        : place.category === "남자휴게실"
          ? ManRestIcon
          : PublicRestIcon;
    }
    return LocationIcon;
  };

  const handleItemClick = (place: Place, index: number) => {
    const isClosing = index === openIndex;
    setOpenIndex(isClosing ? -1 : index);

    // 1. 즉시 바텀시트를 기본 높이로 내림
    setSnap(BOTTOM_SHEET_HEIGHT.DEFAULT);

    // 2. 바텀시트가 내려가는 애니메이션(300ms) 후에 지도 중심점을 업데이트하여
    // 가시 영역 중앙에 정확히 위치하게 함
    setTimeout(() => {
      setSelectedCoord({
        X: Number(place.latitude),
        Y: Number(place.longitude),
      });
    }, 300);

    if (map) {
      map.setLevel(3);
    }

    // 바텀시트에서 선택 시 인포윈도우를 띄우지 않음 (기존 창 닫기)
    setOpenedMarkerId(null);

    // 바텀시트가 내려간 후 해당 아이템이 보이도록 스크롤 보정
    if (!isClosing) {
      setTimeout(() => {
        itemRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  };

  return (
    <ListWrapper>
      {places.map((place, index) => {
        const isOpen = openIndex === index;
        return (
          <ItemContainer
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
          >
            <Header onClick={() => handleItemClick(place, index)}>
              <Icon src={getIcon(place)} />
              <Title>
                {selectedTab === "학교" ? (
                  <>
                    <strong>{place.location}</strong> {place.place_name}{" "}
                    {place.category}
                  </>
                ) : (
                  <>
                    <strong>{config.getPlaceTitle(place)}</strong>
                    <br />
                    <small>
                      {place.category} {place.location} {place.place_name}
                    </small>
                  </>
                )}
              </Title>
              <ToggleIcon src={isOpen ? CloseIcon : OpenIcon} />
            </Header>
            {isOpen && <DetailSection>{renderDetail(place)}</DetailSection>}
          </ItemContainer>
        );
      })}
    </ListWrapper>
  );
};

export default PlaceList;

const ListWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  overflow-y: auto;
  padding-right: 10px;
  padding-bottom: 20px;
  box-sizing: border-box;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 0.5px solid #d6d6d6;
`;

const Header = styled.div`
  height: 56px;
  align-items: center;
  justify-content: space-between;
  display: flex;
  cursor: pointer;
`;

const Icon = styled.img`
  height: 32px;
  width: auto;
`;

const Title = styled.div`
  font-size: 14px;
  color: #3b566e;
  flex: 1;
  padding-left: 15px;
  line-height: 1.4;

  small {
    font-size: 12px;
    color: #888;
  }
`;

const ToggleIcon = styled.img`
  height: 12px;
  width: auto;
`;

const DetailSection = styled.div`
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
