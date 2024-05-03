// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';
import postImg from "../../../resource/assets/post-img.svg"
import HeartImg from "../../../resource/assets/heart-logo.svg"
import CalendarImg from "../../../resource/assets/bx_calendar.svg"
import SortDropBox from '../../common/SortDropBox';
interface Document {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  createDate: string;
  modifiedDate: string;
}


interface PostinfoProps {
  postinfo: Document[],
  postsort:string;
  setPostSort:(sort: string) => void;
}



export default function UserPost({postinfo,postsort,setPostSort}:PostinfoProps) {
    
  return (
    <>
<PostsWrapper>
        <CountWrapper>
          <Likeimg src={postImg} />
          <LikeCount>{postinfo.length}</LikeCount>
        </CountWrapper>
        <SortDropBox sort={postsort} setSort={setPostSort} />
      </PostsWrapper>
      <PostWrapper>
        {postinfo.map((item) => (
          <PostDetailWrapper>
            <PostScrapItem  key={item.id}> 
              <PostLink to={`/tips/${item.id}`}>
                <PostScrapItem>
                  <p className='category'>{item.category}</p>
                  <p className='title'>{`[${item.content}`}</p>
                  <p className='close-title'>{`]`}</p>
                </PostScrapItem>
              </PostLink>
              <PostListWrapper>
              <PostInfoWrapper>
                <img src={CalendarImg} alt="" className='calender-image'/>
                <p className='createdate'>{item.createDate}</p>
                <img src={HeartImg} alt="" className='heart-image'/>
                <p className='like'>{item.like}</p>
              </PostInfoWrapper>
              </PostListWrapper>
            </PostScrapItem>
          </PostDetailWrapper>
        ))}
</PostWrapper>
</>
  );
}

const PostsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const PostWrapper = styled.div`
  max-height: 170px; 
  overflow-y: auto; 


  scrollbar-width: thin; 
  scrollbar-color: #82ADE899 #DBEBFF ; 
  padding-left: 5px;
  &::-webkit-scrollbar {
    width: 8px; 
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1; 
  }

  &::-webkit-scrollbar-thumb {
    background-color: #DBEBFF ; 
    border-radius: 4px; 
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #DBEBFF ;
  }
`;

const CountWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
`

const PostDetailWrapper = styled.div`
border:1px solid #AAC9EE;
margin-bottom: 22px;
`

const PostScrapItem = styled.div`
  display: flex;
  gap:2px;
  background-color:white;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  .category {
    background-color: #a4c8e4; 
    padding:10px;
    margin:10px;
    color:white;
    font-weight: 600;
    border-radius: 10px;
    font-size:15px;
  }
  .title {
    padding:10px 0 10px 10px;
    margin: 10px 0 10px 10px;
    color:black;
font-size: 15px;

font-family: Inter;
font-size: 20px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #656565;
max-width: 500px;
    white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; 
  }

  .close-title {
    font-family: Inter;
font-size: 20px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #656565;
  }

`;

const PostListWrapper = styled.div`
display: flex;
align-items: center;
gap:16px;
`;

const Likeimg = styled.img`
  width: 24px;
  height: 20px;
  margin-right: 16px;
`;

const LikeCount = styled.p`
font-size: 15px;
font-weight: 600;
color: #0E4D9D;

`;


const PostLink = styled(Link)`
    text-decoration:none;
  color:black;
  box-sizing: border-box;
`;

const PostInfoWrapper = styled.div`
display:flex;
align-items: center;

.createdate {
  font-family: Inter;
font-size: 10px;
font-weight: 500;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #969696;
margin: 0 26px 0 3px;
}

.like {
  font-family: Inter;
font-size: 8px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
margin: 0 26px 0 6px;
}
`