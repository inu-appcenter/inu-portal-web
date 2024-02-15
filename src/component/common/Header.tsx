import styled from 'styled-components';

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../reducer/userSlice';

export default function Headerbar() {
    const email = useSelector((state: any) => state.user.email);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <React.Fragment>
            <Header>
                {email ? (
                    <>
                        현재 로그인: {email}
                        <LogOutButton onClick={handleLogout} className='login'>로그아웃</LogOutButton>
                    </>
                ) : (
                    <Link to='/login' className='login'>로그인</Link>
                )} 
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

    .login {
        font-size: 14px;
        font-weight: 300;
        line-height: 20px;
        color: #FFFFFF;
        text-decoration: none;
    }
`;

const  LogOutButton = styled.button`

    background-color:#0E4D9D;
    border:none;
`