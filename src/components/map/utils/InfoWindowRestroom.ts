import {Place} from "../DB";
import Woman from "resources/assets/mapIcons/woman.svg";
import Bed from "resources/assets/mapIcons/bed.svg";
import Shower from "resources/assets/mapIcons/shower.svg";

const InfoWindowRestroom = (place: Place) => {
    const decisionIcon = (title: string) => {
        if (title === "여성용품") return Woman;
        if (title === "침대") return Bed;
        if (title === "샤워실") return Shower;
        return "";
    };

    return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #333; min-width: 150px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 20px; background-color: #ffffff; overflow: hidden;">
      <!-- 위치 정보 -->
    <div style="font-size: 15px; color: #333; font-weight: bold; margin-bottom: 5px;">

      ${place.category}
    </div>
    <div style="text-align: right; font-size: 10px; color: #888; font-weight: 600;">
      <span> ${place.place_name}<br/>${place.location} ${place.restareaInfo?.roomNumber}</span>
    </div>
    <!-- 구분선 -->
        <div style="border-bottom: 2px solid #f1f1f1; margin: 15px 0; font-size: 18px; color: #555;"></div>

      
      <!-- 여성용품 배치 -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="width: 25px; height: 25px; background-color: #4071b9; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
            <img src="${decisionIcon('여성용품')}" alt="여성용품 아이콘" style="width: 14px; height: 14px;" />
          </div>
          <div style="flex: 1; font-size: 10px; color: #555;">여성용품 배치</div>
          <div style="font-weight: 600;  font-size: 10px; color: #0e4d9d;">${place.restareaInfo?.hasFemaleProducts ? "O" : "X"}</div>
        </div>
      </div>

      <!-- 침대, 빈백(개) -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="width: 25px; height: 25px; background-color: #4071b9; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
            <img src="${decisionIcon('침대')}" alt="침대 아이콘" style="width: 14px; height: 14px;" />
          </div>
          <div style="flex: 1; font-size: 10px; color: #555;">침대, 빈백(개)</div>
          <div style="font-weight: 600; font-size: 10px; color: #0e4d9d;">${place.restareaInfo?.bedCount || "X"}</div>
        </div>
      </div>

      <!-- 샤워실 -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="width: 25px; height: 25px; background-color: #4071b9; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
            <img src="${decisionIcon('샤워실')}" alt="샤워실 아이콘" style="width: 14px; height: 14px;" />
          </div>
          <div style="flex: 1; font-size: 10px; color: #555;">샤워실</div>
          <div style="font-weight: 600; font-size: 10px; color: #0e4d9d;">${place.restareaInfo?.hasShowerRoom ? "O" : "X"}</div>
        </div>
      </div>
    </div>
  `;
};

export default InfoWindowRestroom;
