import { Place } from "../DB";

const InfoWindowCafe = (place: Place, imagesrc: any) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #333; max-width: 150px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 20px; background-color: #ffffff; overflow: hidden;">
    <div style="font-size: 15px; color: #333; font-weight: bold; margin-bottom: 5px;">
        ${place.cafePlaceInfo?.name}
    </div>
    <div style="text-align: right; font-size: 10px; color: #888; font-weight: 600;">
      <span>      ${place.location} ${place.place_name}
</span>
    </div>
    
    <div style="border-bottom: 2px solid #f1f1f1; margin: 15px 0; font-size: 18px; color: #555;"></div>

    <div style="margin-bottom: 0;">
      <img src="${imagesrc}" alt="카페 이미지" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"/>
    </div>
  </div>
`;

export default InfoWindowCafe;
