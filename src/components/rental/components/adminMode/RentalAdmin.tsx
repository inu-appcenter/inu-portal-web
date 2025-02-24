import {useState} from "react";
import styled from "styled-components";

import AddItem from "./AddItem";
import ItemListAdmin from "./ItemListAdmin.tsx";

export default function RentalAdmin() {
    const [curDisplay, setCurDisplay] = useState<string>("menu");

    const handleMenu = (menu: string) => {
        setCurDisplay(menu);
    };

    return (
        <Wrapper>
            <Header>관리자 페이지</Header>
            {curDisplay === "menu" && (
                <ButtonGroup>
                    <Button onClick={() => handleMenu("itemlist")}>물품 목록 조회</Button>
                    <Button onClick={() => handleMenu("additem")}>물품 등록</Button>
                </ButtonGroup>
            )}
            {curDisplay === "itemlist" && <ItemListAdmin/>}
            {curDisplay === "additem" && <AddItem/>}
        </Wrapper>
    );
}

// styled components
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 80vw;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h1`
    text-align: center;
    color: #343a40;
    font-size: 24px;
    margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const Button = styled.button`
    background-color: #007bff;
    color: white;
    padding: 12px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #0056b3;
    }

    &:active {
        background-color: #004085;
    }

    &:focus {
        outline: none;
    }
`;
