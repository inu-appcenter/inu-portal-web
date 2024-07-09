import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import backbtn from '../../../resource/assets/backbtn.svg';
import PostLike from '../../components/postdetail/util/m.postlike';
import PostScrap from '../../components/postdetail/util/m.postscrap';

interface PostUtilityProps {
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
  hasAuthority: boolean;
}
export default function PostUtilContainer({
  like,
  isLiked,
  scrap,
  isScraped,
  hasAuthority,
}: PostUtilityProps) {
  const navigate = useNavigate();

  return (
    <>
    <Wrapper>
      <BackBtn onClick={() => navigate(-1)}>
        <img src={backbtn} alt='뒤로가기 버튼' />
      </BackBtn>
      <UtilWrapper>
        <PostLike
          like={like}
          isLikedProp={isLiked}
          hasAuthority={hasAuthority}
        />
        <PostScrap />
      </UtilWrapper>
      </Wrapper>
    </>
  );
}
const Wrapper = styled.div`
    display: flex;
    justify-cotent: space-between;
    align-items: center;
    width: 100%;
`

const BackBtn = styled.div`
  color: #888888;
  margin-right: auto;
  display: flex;
  cursor: url('/pointers/cursor-pointer.svg'), pointer;
`;

const BackBtnImg = styled.div``;

const UtilWrapper = styled.div`
    margin-left: auto;
    display: flex;
    flex-direction: row;
    gap: 20px;

`