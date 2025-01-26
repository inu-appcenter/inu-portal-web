import React from "react";
import styled from 'styled-components';
import BottomSheet from "./BottomSheet";

const BaseDiv = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: #000000
`

export default function Base() {

    return (
        <BaseDiv>
            <BottomSheet/>
        </BaseDiv>
    )
}