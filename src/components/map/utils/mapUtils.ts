export const zoomIn = (map: any, setLevel: React.Dispatch<number>) => {
    const currentLevel = map.getLevel();
    map.setLevel(currentLevel - 1);
    setLevel(map.getLevel());
};

export const zoomOut = (map: any, setLevel: React.Dispatch<number>) => {
    const currentLevel = map.getLevel();
    map.setLevel(currentLevel + 1);
    setLevel(map.getLevel());
};

export const displayLevel = (map: any, setLevel: React.Dispatch<number>) => {
    setLevel(map.getLevel());
};

// 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
export const setMapType = (map: any, mapType: string) => {
    if (map) {
        const roadmapControl = document.getElementById("btnRoadmap")!;
        const skyviewControl = document.getElementById("btnSkyview")!;
        if (mapType === "roadmap") {
            map.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
            roadmapControl.className = "selected_btn";
            skyviewControl.className = "btn";
        } else {
            map.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
            skyviewControl.className = "selected_btn";
            roadmapControl.className = "btn";
        }
    }
};