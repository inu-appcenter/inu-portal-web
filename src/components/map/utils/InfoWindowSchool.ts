import {Place} from "../DB";


const InfoWindowSchool = (place: Place) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 200px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 15px; background-color: #fff;">
          <h3 style="border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; color: #555;">${place.category}</h3>
          <div style="margin-bottom: 12px;">
              <strong style="display: inline-block; width: 80px; color: #444;">위치:</strong>
              <span>${place.place_name} </span>
          </div>
      </div>`;

export default InfoWindowSchool;