import { Place } from "../DB";

const InfoWindowSchool = (place: Place, imagesrc: any) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #333; width: 200px; padding: 10px; overflow: hidden;">
    <div style="font-size: 15px; color: #333; font-weight: bold; margin-bottom: 5px;">
      ${place.location}<br/>${place.place_name}
    </div>
    <div style="text-align: right; font-size: 10px; color: #888; font-weight: 600;">
      <span>${place.category}</span>
    </div>
    
    <div style="border-bottom: 2px solid #f1f1f1; margin: 5px 0; font-size: 18px; color: #555;"></div>

    <div style="margin-top: 10px; text-align: center; min-height: 120px;">
      <img src="${imagesrc}" alt="학교 이미지" style="width: 100%; max-width: 180px; height: auto; min-height: 120px; display: block; margin: 0 auto; border-radius: 8px;"/>
    </div>
  </div>
`;

export default InfoWindowSchool;
