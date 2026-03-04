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

import { useState, ReactNode } from "react";
import { Place } from "@/components/map/DB";
import { MAP_CENTER_OFFSET, MAP_TAB_CONFIG, TabType } from "../constants/mapConfig";

interface PlaceListProps {
  places: Place[];
  map: any;
  selectedTab: TabType;
  setOpenedMarkerId: (id: string | null) => void;
  renderDetail: (place: Place) => ReactNode;
}

const PlaceList = ({
  places,
  map,
  selectedTab,
  setOpenedMarkerId,
  renderDetail,
}: PlaceListProps) => {
  const [openIndex, setOpenIndex] = useState(-1);
  const config = MAP_TAB_CONFIG[selectedTab];

  const getIcon = (place: Place) => {
    if (selectedTab === "카페") return CafeIcon;
    if (selectedTab === "식당") {
      return place.category === "식당" ? RestaurantIcon : 
             place.category === "편의점" ? ConvienienceStoreIcon : LocationIcon;
    }
    if (selectedTab === "휴게실") {
      return place.category === "여자휴게실" ? WomanRestIcon :
             place.category === "남자휴게실" ? ManRestIcon : PublicRestIcon;
    }
    return LocationIcon;
  };

  const handleItemClick = (place: Place, index: number) => {
    setOpenIndex(index === openIndex ? -1 : index);
    
    if (map) {
      const moveLatLon = new window.kakao.maps.LatLng(
        Number(place.latitude) + MAP_CENTER_OFFSET,
        place.longitude
      );
      map.setCenter(moveLatLon);
      map.setLevel(3);
    }
    
    setOpenedMarkerId(config.getMarkerId(place));
  };

  return (
    <ListWrapper>
      {places.map((place, index) => {
        const isOpen = openIndex === index;
        return (
          <ItemContainer key={index}>
            <Header onClick={() => handleItemClick(place, index)}>
              <Icon src={getIcon(place)} />
              <Title>
                {selectedTab === "학교" ? (
                  <><strong>{place.location}</strong> {place.place_name} {place.category}</>
                ) : (
                  <>
                    <strong>{config.getPlaceTitle(place)}</strong>
                    <br />
                    <small>{place.category} {place.location} {place.place_name}</small>
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
