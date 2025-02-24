// import styled from "styled-components";
import styled, {keyframes} from "styled-components";

import menuButtonImage from "resources/assets/mobile-common/menu-button.svg";
import intipLogo from "resources/assets/intip-logo.svg";
import closeBtn from "resources/assets/mobile-common/closebtn.svg";
import {useEffect, useState} from "react";
import SerachForm from "mobile/containers/home/SerachForm";
import AiForm from "mobile/containers/home/Ai";

import menuImg from "resources/assets/mobile-home/menu.svg";
import noticeImg from "resources/assets/mobile-home/notice.svg";
import TipImg from "resources/assets/mobile-home/tip.svg";
import calendarImg from "resources/assets/mobile-home/calendar.svg";
import councilImg from "resources/assets/mobile-home/council.svg";
import mapImg from "resources/assets/mobile-home/map.svg";
import clubImg from "resources/assets/mobile-home/club.svg";
import utilImg from "resources/assets/mobile-home/util.svg";
import useMobileNavigate from "hooks/useMobileNavigate";
import {useLocation} from "react-router-dom";

const categorys = [
    {title: "메뉴", img: menuImg},
    {title: "공지사항", img: noticeImg},
    {title: "TIPS", img: TipImg},
    {title: "학사일정", img: calendarImg},
    {title: "총학생회", img: councilImg},
    {title: "캠퍼스", img: mapImg},
    {title: "동아리", img: clubImg},
    {title: "편의", img: utilImg},
];


export default function MenuButton() {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const mobileNavigate = useMobileNavigate();

    useEffect(() => {
        setIsVisible(false);
    }, [location.pathname]);

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    });

    const handleClick = (title: string) => {
        if (title === "메뉴") {
            mobileNavigate(`/home/menu`);
        } else if (title === "공지사항") {
            mobileNavigate(`/home/tips?type=notice`);
        } else if (title === "TIPS") {
            mobileNavigate(`/home/tips`);
        } else if (title === "학사일정") {
            mobileNavigate(`/home/calendar`);
        } else if (title === "총학생회") {
            mobileNavigate(`/home/council`);
        } else if (title === "동아리") {
            mobileNavigate(`/home/club`);
        } else if (title === "캠퍼스") {
            mobileNavigate(`/home/campus`);
        } else if (title === "편의") {
            mobileNavigate(`/home/util`);
        } else {
            mobileNavigate(`/home/${title}`);
        }
    };

    return (
        <>
            <MenuButtonImg
                src={menuButtonImage}
                alt="사이드바"
                onClick={() => setIsVisible(true)}
            />
            {isVisible && (
                <>
                    <Background isVisible={isVisible} onClick={() => setIsVisible(false)}/>
                    <Sidebar isVisible={isVisible}>
                        <div className="sidebar-header">
                            <img className="logo" src={intipLogo} alt=""/>
                            <button onClick={() => setIsVisible(false)}>
                                <span>닫기</span>
                                <img src={closeBtn} alt=""/>
                            </button>
                        </div>
                        <div className="sidebar-categories">
                            <div className="sf-wrapper">
                                <SerachForm/>
                            </div>
                            {categorys.map((category, index) => (
                                <div
                                    key={index}
                                    className="sidebar-category"
                                    onClick={() => handleClick(category.title)}
                                >
                                    <img src={category.img} alt="카테고리 이미지"/>
                                    <span>{`[${category.title}]`}</span>
                                </div>
                            ))}
                            <AiForm/>
                        </div>
                    </Sidebar>
                </>
            )}
        </>
    );
}


// 사이드바가 오른쪽에서 슬라이드 인/아웃하는 애니메이션
const slideIn = keyframes`
    0% {
        transform: translateX(100%);
    }
    100% {
        transform: translateX(0);
    }
`;

const slideOut = keyframes`
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(100%);
    }
`;

const fadeIn = keyframes`
    0% {
        background-color: rgba(255, 255, 255, 0);
    }
    100% {
        background-color: rgba(255, 255, 255, 0.5);
    }
`;

const fadeOut = keyframes`
    0% {
        background-color: rgba(255, 255, 255, 0.5);
    }
    100% {
        background-color: rgba(255, 255, 255, 0);
    }
`;

const MenuButtonImg = styled.img`
    height: 18px;
`;

const Background = styled.div<{ isVisible: boolean }>`
    position: fixed;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.5);
    animation: ${({isVisible}) => (isVisible ? fadeIn : fadeOut)} 0.3s ease-in-out;
`;

const Sidebar = styled.div<{ isVisible: boolean }>`
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    padding-bottom: 80px;
    width: 320px;
    background-color: #fff;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    animation: ${({isVisible}) =>
            isVisible ? slideIn : slideOut} 0.3s ease-in-out;

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background-color: rgba(238, 238, 238, 1);

        .logo {
            height: 32px;
        }

        button {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: transparent;
            border: none;
            color: black;

            span {
                font-size: 14px;
                font-weight: 500;
            }
        }
    }

    .sidebar-categories {
        display: flex;
        flex-direction: column;
        margin: 0 16px;

        .sf-wrapper {
            margin: 12px 0;
        }

        .sidebar-category {
            display: flex;
            align-items: center;
            gap: 16px;
            height: 60px;
            border-bottom: 1px solid rgba(223, 223, 223, 1);

            img {
                width: 32px;
            }

            span {
                font-weight: 500;
            }
        }
    }
`;