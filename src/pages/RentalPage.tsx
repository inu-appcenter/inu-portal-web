import Categories from "components/posts/Categories";

import RentalTitle from "../../src/components/rental/RentalTitle.tsx";
import ReservationList from "../components/rental/components/ReservationList.tsx";
import ItemList from 'components/rental/components/ItemList.tsx';
import React, {useEffect, useState /*useState*/} from "react";
import {useLocation} from "react-router-dom";
import styled from "styled-components";

import {ThemeProvider} from "styled-components";
import {broadcasting, tents, athleticGoods, elses} from "../components/rental/DB.tsx";

const theme = {
    colors: {
        primary: "#007bff",
        secondary: "#f5f5f5",
        text: "#333",
        background: "#ffffff",
        border: "#ddd",
    },
};

import Rental from "../../src/components/rental/Rental.tsx";


export default function RentalPage() {

    return (
        <PostsPageWrapper>
            <Categories/>
            <ContentsWrapper>
                <RentalTitle/>
                <ThemeProvider theme={theme}>

                    <Rental/>
                </ThemeProvider>
            </ContentsWrapper>
        </PostsPageWrapper>
    );
}


//styled components


const PostsPageWrapper = styled.div`
    padding: 0 32px;
    display: flex;
    gap: 16px;
    position: relative;
`;

const ContentsWrapper = styled.div`
    flex: 1;

    display: flex;
    flex-direction: column;
`;
