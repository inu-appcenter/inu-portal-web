import ProfileNickname from "mobile/components/common/ProfileNickname";
import ProfileImage from "mobile/components/common/ProfileImage";
import styled from "styled-components";
import useUserStore from "stores/useUserStore";

export default function UserInfo() {
  const { userInfo } = useUserStore();

  return (
    <UserInfoWrapper>
      {userInfo.id && (
        <>
          <ProfileImage fireId={userInfo.fireId} />
          <ProfileNickname nickname={userInfo.nickname} />
          {userInfo.department && (
            <ProfileNickname nickname={userInfo.department} />
          )}
        </>
      )}
    </UserInfoWrapper>
  );
}

const UserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 125px;
  position: relative;

  gap: 10px;

  img {
    width: 110px;
    height: 110px;
    //margin-bottom: 10px;
  }
`;
