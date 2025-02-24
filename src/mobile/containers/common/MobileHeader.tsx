import styled from "styled-components";
import intipLogo from "resources/assets/intip-logo.svg";
import ProfileImage from "mobile/components/common/ProfileImage";
import ProfileNickname from "mobile/components/common/ProfileNickname";
import MenuButton from "mobile/components/common/MenuButton";
import LoginNavigateButton from "mobile/components/common/LoginNavigateButton";
import useUserStore from "stores/useUserStore";
import useMobileNavigate from "hooks/useMobileNavigate";
import {ReactSVG} from "react-svg";
import eyeImg from "../../../resources/assets/posts/eye.svg";

export default function MobileHeader() {
    const {userInfo} = useUserStore();
    const mobileNavigate = useMobileNavigate();

    const handleLogoClick = () => {
        mobileNavigate(`/home`);
    };
    const handleProfileClick = () => {
        mobileNavigate("/mypage");
    };

    return (
        <MobileHeaderWrapper>
            <ReactSVG onClick={handleLogoClick} src={intipLogo}/>
            <ProfileMenuWrapper>
                {userInfo.nickname ? (
                    <>
                        {/*<ProfileImage fireId={userInfo.fireId}/>*/}
                        {/*<ProfileNickname nickname={userInfo.nickname}/>*/}
                        <PostInfo onClick={handleProfileClick}>
                            <ProfileImage fireId={userInfo.fireId}/>
                            {userInfo.nickname}
                        </PostInfo>
                    </>
                ) : (
                    <>
                        <LoginNavigateButton/>
                    </>
                )}
                <MenuButton/>
            </ProfileMenuWrapper>
        </MobileHeaderWrapper>
    );
}

const MobileHeaderWrapper = styled.header`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 72px;
    padding: 0 24px;
    position: relative;
    z-index: 2;

    img {
        shape-rendering: crispEdges;
    }
`;

const ProfileMenuWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;


const PostInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    background: #ecf4ff;
    font-size: 14px;
    color: #666;
    height: fit-content;
    width: auto;
    border-radius: 100px;
    padding: 5px;

    font-weight: 400;


    img {
        top: 10px;
    }


`;
