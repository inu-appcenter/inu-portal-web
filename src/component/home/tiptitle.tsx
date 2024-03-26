import styled from "styled-components"


export default function TipTitle() {
    return (
        <TipTile>🍯 TIPS</TipTile>
    )
}

const TipTile = styled.div`
    flex-grow: 0;
    flex-shrink: 0;

    font-family: Inter;
    font-size: 24px;
    font-weight: 700;
    line-height: 29px;
    letter-spacing: 0em;
    text-align: left;
    color: #0E4D9D;

`