import React, { useEffect, useRef, useState } from "react";
import {Place, places, restPlaces} from './DB.tsx';

const KakaoMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null); // 지도를 표시할 div의 레퍼런스
  const [map, setMap] = useState<any>(null); // 지도 객체를 상태로 저장
  const [level, setLevel] = useState<number>(3); // 현재 지도 레벨을 상태로 저장
  const [searchQuery, setSearchQuery] = useState<string>(""); // 검색어 상태 저장

  const imageSources = [
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", // 마커이미지의 주소입니다
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
  ];

  useEffect(() => {
    // Kakao Maps API가 로드된 후에 실행
    if (window.kakao && mapContainer.current) {
      const options = {
        center: new window.kakao.maps.LatLng(
          37.374474020920864,
          126.63361466845616
        ), // 중심 좌표 설정
        level: 3, // 확대 레벨 설정
      };

      const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options); // 지도 생성
      setMap(kakaoMap); // 지도 객체 상태 저장

      displayLevel(kakaoMap); // 초기 레벨 표시
    }
  }, []);

  const zoomIn = () => {
    if (map) {
      const currentLevel = map.getLevel();
      map.setLevel(currentLevel - 1);
      setLevel(map.getLevel()); // 지도 레벨 상태 업데이트
    }
  };

  const zoomOut = () => {
    if (map) {
      const currentLevel = map.getLevel();
      map.setLevel(currentLevel + 1);
      setLevel(map.getLevel()); // 지도 레벨 상태 업데이트
    }
  };

  const displayLevel = (kakaoMap: any) => {
    setLevel(kakaoMap.getLevel());
  };

  const handleSearch = () => {
    // 장소 검색 객체를 생성합니다
    const ps = new window.kakao.maps.services.Places();
    // 키워드로 장소를 검색합니다
    ps.keywordSearch(searchQuery, placesSearchCB);
  };

  // 키워드 검색 완료 시 호출되는 콜백함수 입니다
  function placesSearchCB(data: any[], status: any /*pagination: any*/) {
    if (status === window.kakao.maps.services.Status.OK) {
      // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기 위해
      // LatLngBounds 객체에 좌표를 추가합니다
      var bounds = new window.kakao.maps.LatLngBounds();

      for (var i = 0; i < data.length; i++) {
        displayMarker(data[i], "");
        bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
      }

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      map.setBounds(bounds);
    }
  }

  //DB에 있는 위, 경도에 따라 마커를 찍는다
  function placesMarkDB(places: Place[], imageSrc: string, mode:number) {
    places.forEach((place) => {
      console.log(`${place.place_name}: 위도(${place.latitude}), 경도(${place.longitude})`);
      displayMarker(place, imageSrc, mode);
    });
  }

  // 지도에 마커를 표시하는 함수입니다
  function displayMarker(place: Place, imageSrc: string, mode:number) {
    const imageSize = new window.kakao.maps.Size(24, 35); // 마커이미지의 크기입니다
    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
    // 마커를 생성하고 지도에 표시합니다
    const marker = new window.kakao.maps.Marker({
      map: map,
      position: new window.kakao.maps.LatLng(place.latitude, place.longitude),
      title: place.place_name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
      image: markerImage, // 마커 이미지
    });

    let iwContent;
    if(mode===1) {
      iwContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 200px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 15px; background-color: #fff;">
          <h3 style="border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; color: #555;">${place.category}</h3>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">위치:</strong>
              <span>${place.place_name} </span>
          </div>
      </div>`;
    }
    if(mode===2) {
      iwContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 200px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 15px; background-color: #fff;">
          <h3 style="border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; color: #555;">${place.category}</h3>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">위치:</strong>
              <span>${place.place_name} ${place.restareaInfo.roomNumber}</span>
          </div>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">여성용품:</strong>
              <span>${place.restareaInfo.hasFemaleProducts ? "있음" : "없음"}</span>
          </div>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">침대:</strong>
              <span>${place.restareaInfo.bedCount}개</span>
          </div>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">탈의실:</strong>
              <span>${place.restareaInfo.hasChangingRoom ? "있음" : "없음"}</span>
          </div>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">샤워실:</strong>
              <span>${place.restareaInfo.hasShowerRoom ? "있음" : "없음"}</span>
          </div>
      </div>`;
    }



    const iwRemoveable = true;

    const infowindow = new window.kakao.maps.InfoWindow({
      content: iwContent,
      removable: iwRemoveable
    })

    // 마커에 클릭이벤트를 등록합니다
    window.kakao.maps.event.addListener(marker, "click", function () {
      infowindow.open(map, marker);
    });
  }

  const handleFilter = (filter: string) => {
    // filter 값에 맞는 places를 필터링
    const filteredPlaces = restPlaces.filter(place => {
      if (filter === "여자휴게실") {
        return place.category === "여자휴게실";
      } else if (filter === "남자휴게실") {
        return place.category === "남자휴게실";
      } else if (filter === "남녀공용휴게실") {
        return place.category === "남녀공용휴게실";
      } else {
        return true; // 필터가 "여자휴게실", "남자휴게실", "남녀공용휴게실"이 아닐 경우 모두 반환
      }
    });

    // 필터링된 places와 imageSources[0]을 placesMarkDB 함수에 전달
    placesMarkDB(filteredPlaces, imageSources[0], 2);
  };

  placesMarkDB(places, imageSources[1], 1);
  return (
    <div>
      <div
        ref={mapContainer}
        style={{ width: "50%", height: "500px" }}
      ></div>
      <p>
        <button onClick={zoomIn}>지도레벨 - 1</button>
        <button onClick={zoomOut}>지도레벨 + 1</button>
        <span>현재 지도 레벨은 {level} 레벨 입니다.</span>
      </p>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="주소를 입력하세요"
        />
        <button onClick={handleSearch}>검색</button>
      </div>
      <div>
        <h3>필터</h3>
        <div onClick={()=>handleFilter("여자휴게실")}>여자휴게실</div>
        <div onClick={()=>handleFilter("남자휴게실")}>남자휴게실</div>
        <div onClick={()=>handleFilter("남녀공용휴게실")}>남녀공용휴게실</div>
        <h2>장소 목록</h2>
        <ul>
          {restPlaces.map((place, index) => (
            <li key={index} >
              <strong>{place.place_name}</strong>: 위도({place.latitude}), 경도(
              {place.longitude})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KakaoMap;
