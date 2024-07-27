// import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import backbtn from '../../../resource/assets/backbtn.svg';
import PostLike from '../../components/postdetail/util/m.postlike';
import PostScrap from '../../components/postdetail/util/m.postscrap';
import utilfolder from '../../../resource/assets/utilfolder.svg';
import { useEffect, useRef, useState } from 'react';
import DeletePostBtn from '../../../component/postdetail/post/deletpostbtn';
import EditPostBtn from '../../../component/postdetail/post/editpostbtn';
import { useSelector } from 'react-redux';
interface PostUtilityProps {
  id: string;
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
  hasAuthority: boolean;
}
export default function PostUtilContainer({ id, like, isLiked, scrap, isScraped, hasAuthority }: PostUtilityProps) {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.user.token);
  const [showPopup, setShowPopup] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  
  const handleFolderClick = ()=>{
    setShowPopup(prev => !prev);
  }
  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setShowPopup(false);
    }
  };

  useEffect(()=>{
    document.addEventListener('mousedown', handleClickOutside);
    return ()=>{
      document.removeEventListener('mousedown', handleClickOutside)
    };
  },[]);
  const handlePostUpdate = () => {
    //
};

  return (
    <>
      <Wrapper>
        <BackBtn onClick={() => navigate(-1)}>
          <img src={backbtn} alt="뒤로가기 버튼" />
        </BackBtn>
        <UtilWrapper>
          <PostLike id={id} like={like} isLikedProp={isLiked} hasAuthority={hasAuthority} />
          <PostScrap id={id} scrap={scrap} isScrapedProp={isScraped} />
          {hasAuthority && (
            <DelOrModifyWrapper>
              <img
                src={utilfolder}
                alt="del or modify folder"
                onClick={handleFolderClick}
                style={{ cursor: 'pointer' }}
              />
              {showPopup && (
                <Popup ref={popupRef}>
                  <DeletePostBtn token={token} id={id} onPostUpdate={handlePostUpdate} />
                  <EditPostBtn id={id} />
                </Popup>
              )}
            </DelOrModifyWrapper>
          )}
        </UtilWrapper>
      </Wrapper>
      <Line />
    </>
  );
}

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`

const BackBtn = styled.div`
  color: #888888;
  margin-right: auto;
  display: flex;
  cursor: url('/pointers/cursor-pointer.svg'), pointer;
`;

const UtilWrapper = styled.div`
    margin-left: auto;
    display: flex;
    flex-direction: row;
    gap: 20px;
`
const DelOrModifyWrapper =styled.div`
`

const Line = styled.div`
border-top: 1px solid #ccc; 
left:0;
right: 0;`

const Popup = styled.div`
  position: absolute;
  top: 10%;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
`;
