import { Place } from "../DB";

const InfoWindowTumbler = (place: Place) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #333; width: 200px; padding: 10px; overflow: hidden;">
    <div style="font-size: 15px; color: #333; font-weight: bold; margin-bottom: 5px;">
        텀블러 세척기
    </div>
    <div style="text-align: right; font-size: 10px; color: #888; font-weight: 600;">
      <span>      ${place.location} ${place.place_name}
</span>
    </div>
  </div>
`;

export default InfoWindowTumbler;
