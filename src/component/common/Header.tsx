import styled from 'styled-components';

import React from 'react';
import { Link } from 'react-router-dom';

export default function Headerbar() {
    return (
        <React.Fragment>
            <Header>
                <Link to='/login' className='login'>로그인</Link>
            </Header>
        </React.Fragment>
    )
}

const Header = styled.header`
    position: fixed;
    top:0;
    left:32px;
    right:32px;
    background-color:#0E4D9D;
    text-align: right;
    padding-right: 26px;

    a{
        font-size: 14px;
        font-weight: 300;
        line-height: 20px;
        color: #FFFFFF;
        text-decoration: none;
    }
`;
