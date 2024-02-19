import { useState } from 'react';
import styled from 'styled-components';
import { MypageList } from '../../resource/string/mypage';
import ScrapInfo from './scrap';
import ActiveInfo from './active';
import ModifyInfo from './modify';
import DeleteInfo from './delete';


export default function MyPageListButton() {
  const [selectedItem, setSelectedItem] = useState<string>('스크랩'); 

  const handleBtn = (title: string) => {
    setSelectedItem(title); // 선택된 항목 업데이트
  };

  return (
    <>
      <MyPageDetailWrapper>
      <ScrapList>
        {MypageList.map((list, index) => (
          <MyPageBtnWrapper
            key={index}
            onClick={() => handleBtn(list.title)}
            className={selectedItem === list.title ? 'select' : ''}
          >
            <BtnImg src={list.img}  className={selectedItem === list.title ? 'change' : ''}/>
            <BtnTitle  className={selectedItem === list.title ? 'color' : ''}>{list.title}</BtnTitle>
          </MyPageBtnWrapper>
        ))}
      </ScrapList>
      {selectedItem === '스크랩' && <ScrapInfo />}
      {selectedItem === '내 활동' && <ActiveInfo />}
      {selectedItem === '비밀번호 변경' && <ModifyInfo />}
      {selectedItem === '회원탈퇴' && <DeleteInfo />}
      </MyPageDetailWrapper>
    </>
  );
}



const MyPageBtnWrapper = styled.button`
  display:flex;
  width: 193px;
  box-sizing: border-box;
  padding:25px 20px;
  border: none;
  font-size: 17px;
  font-weight: 500;
  border-radius: 12px;
  color: #656565;
  background-color: white;
  &.select {
    background: #0E4D9D;
  }
`;

const MyPageDetailWrapper = styled.div`
  display: flex;
  flex:1;
`;

const BtnTitle = styled.div`
  border:none;
  color: #656565;
  margin-left: 23px;
  &.color {
    color: white;
    font-weight: 800;
  }

`;

const BtnImg = styled.img`

  color: #656565;
  &.change {
    /* color: white; */
    /* filter: opacity(0.5) drop-shadow(0 0 0 #e8d9ff); */
  }
`;

const ScrapList = styled.div`
  margin-right: 30px;
`