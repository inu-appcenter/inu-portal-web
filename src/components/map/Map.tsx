import React, { useEffect, useRef, useState } from "react";

const KakaoMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null); // 지도를 표시할 div의 레퍼런스
  const [map, setMap] = useState<any>(null); // 지도 객체를 상태로 저장
  const [level, setLevel] = useState<number>(3); // 현재 지도 레벨을 상태로 저장
  const [searchQuery, setSearchQuery] = useState<string>(""); // 검색어 상태 저장

  const imageSources = [
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", // 마커이미지의 주소입니다
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
  ];

  // 장소 객체의 타입 정의
  interface Place {
    y: string; // 위도
    x: string; // 경도
    place_name: string; // 장소명
    // 필요시 추가적인 프로퍼티를 여기에 정의할 수 있습니다.
  }

  // Place 타입 배열 생성
  const places: Place[] = [
    {
      y: "37.3768675", // 위도
      x: "126.6347546", // 경도
      place_name: "1호관", // 장소명
    },
    {
      y: "37.37754246",
      x: "126.6337663",
      place_name: "2호관",
    },
    {
      y: "37.37739016",
      x: "126.6340465",
      place_name: "3호관",
    },
  ];

  const cafePlaces: Place[] = [
    {
      y: "37.37501993",
      x: "126.6338717",
      place_name: "카페드림",
    },
    {
      y: "37.37432268",
      x: "126.630584",
      place_name: "카페아이엔지",
    },
  ];

  // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
  var infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
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
    var ps = new window.kakao.maps.services.Places();
    // 키워드로 장소를 검색합니다
    ps.keywordSearch(searchQuery, placesSearchCB);
  };

  //장소 목록에서 선택했을 때 지도에 표시해주는 함수
  const handleClickPlace = (place: any) => {
    var bounds = new window.kakao.maps.LatLngBounds();
    bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
    map.setBounds(bounds);

    // 마커를 생성하고 지도에 표시합니다
    var marker = new window.kakao.maps.Marker({
      map: map,
      position: new window.kakao.maps.LatLng(place.y, place.x),
    });

    infowindow.setContent(
      '<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>"
    );
    infowindow.open(map, marker);
  };

  // 키워드 검색 완료 시 호출되는 콜백함수 입니다
  function placesSearchCB(data: any[], status: any, pagination: any) {
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
  function placesMarkDB(places: Place[], imageSrc: String) {
    places.forEach((place) => {
      console.log(`${place.place_name}: 위도(${place.y}), 경도(${place.x})`);
      displayMarker(place, imageSrc);
    });
  }
  placesMarkDB(places, imageSources[0]);
  placesMarkDB(cafePlaces, imageSources[1]);

  // 지도에 마커를 표시하는 함수입니다
  function displayMarker(place: Place, imageSrc: String) {
    var imageSize = new window.kakao.maps.Size(24, 35); // 마커이미지의 크기입니다

    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

    // 마커를 생성하고 지도에 표시합니다
    var marker = new window.kakao.maps.Marker({
      map: map,
      position: new window.kakao.maps.LatLng(place.y, place.x),
      title: place.place_name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다

      image: markerImage, // 마커 이미지
    });

    // 마커에 클릭이벤트를 등록합니다
    window.kakao.maps.event.addListener(marker, "click", function () {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      infowindow.setContent(
        '<div style="padding:5px;font-size:12px;">' +
          place.place_name +
          "</div>"
      );
      infowindow.open(map, marker);
    });
  }

  return (
    <div>
      <div
        ref={mapContainer}
        style={{ width: "1000px", height: "500px" }}
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
        <h2>장소 목록</h2>
        <ul>
          {places.map((place, index) => (
            <li key={index} onClick={() => handleClickPlace(place)}>
              <strong>{place.place_name}</strong>: 위도({place.y}), 경도(
              {place.x})
            </li>
          ))}
          {cafePlaces.map((place, index) => (
            <li key={index} onClick={() => handleClickPlace(place)}>
              <strong>{place.place_name}</strong>: 위도({place.y}), 경도(
              {place.x})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KakaoMap;
