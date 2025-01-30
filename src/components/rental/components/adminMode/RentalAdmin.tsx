import {useState} from "react";
import styled from "styled-components";

import AddItem from "./AddItem";
import ItemListAdmin from "./ItemListAdmin.tsx";


export default function RentalAdmin() {

    const [curDisplay, setCurDisplay] = useState<string>("menu");


    const handleMenu = (menu: string) => {
        setCurDisplay(menu);
    }


    return (
        <Wrapper>
            <h1>관리자 페이지</h1>
            {curDisplay === "menu" && (
                <ButtonGroup>
                    <button onClick={() => {
                        handleMenu("itemlist")
                    }}>물품 목록 조회
                    </button>
                    <button onClick={() => {
                        handleMenu("additem")
                    }}>물품 등록
                    </button>
                </ButtonGroup>
            )}
            {curDisplay === "itemlist" && (
                <>
                    <ItemListAdmin/>
                </>
            )}
            {curDisplay === "additem" && (
                <>
                    <AddItem/>
                </>
            )}


        </Wrapper>

    );
}
//styled components
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    margin-bottom: 30px;

`
const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`





