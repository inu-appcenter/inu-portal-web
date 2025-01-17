import React from "react";
import { zoomIn, zoomOut } from "../utils/mapUtils";

const MapControls: React.FC<{ map: any; setLevel: React.Dispatch<number> }> = ({
                                                                                   map,
                                                                                   setLevel,
                                                                               }) => {
    return (
        <p>
            <button onClick={() => zoomIn(map, setLevel)}>지도레벨 - 1</button>
            <button onClick={() => zoomOut(map, setLevel)}>지도레벨 + 1</button>
        </p>
    );
};

export default MapControls;
