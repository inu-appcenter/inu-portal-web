import React, { useState } from "react";
import { restPlaces } from "../DB";
import { placesMarkDB } from "../utils/markerUtils";
import { imageSources } from "../constants/markerImages";

const FilterPanel: React.FC<{ map: any }> = ({ map }) => {
    const [isChecked1, setChecked1] = useState(false);
    const [isChecked2, setChecked2] = useState(false);
    const [isChecked3, setChecked3] = useState(false);

    const handleFilter = (filter: string) => {
        const filteredPlaces = restPlaces.filter((place) => {
            if (filter === "여자휴게실") {
                setChecked1(!isChecked1);
                return place.category === "여자휴게실";
            } else if (filter === "남자휴게실") {
                setChecked2(!isChecked2);
                return place.category === "남자휴게실";
            } else if (filter === "남녀공용 휴게실") {
                setChecked3(!isChecked3);
                return place.category === "남녀공용 휴게실";
            }
            return true;
        });

        placesMarkDB(filteredPlaces, imageSources[0], 2, map);
    };

    return (
        <div>
            <h3>필터</h3>
            <label>
                <input
                    type="checkbox"
                    checked={isChecked1}
                    onChange={() => handleFilter("여자휴게실")}
                />
                여자휴게실
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={isChecked2}
                    onChange={() => handleFilter("남자휴게실")}
                />
                남자휴게실
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={isChecked3}
                    onChange={() => handleFilter("남녀공용 휴게실")}
                />
                남녀공용 휴게실
            </label>
        </div>
    );
};

export default FilterPanel;
