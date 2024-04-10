import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { navBarList } from '../../resource/string/navbar';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VVector from '../../resource/assets/V-Vector.svg';
import LoginModal from './LoginModal.tsx';
import round from '../../resource/assets/round.svg'
import lightround from '../../resource/assets/lightround.svg'
import polygon from '../../resource/assets/polygon.svg'

interface loginInfo {
  user: {
    token: string;
  };
}

export default function NavItems() {
  const [toggleIndex, setToggleIndex] = useState<number | null>(null);
  const [subToggleIndex, setSubToggleIndex] = useState<number | null>(null);
  const user = useSelector((state: loginInfo) => state.user);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [selectedChildItems, setSelectedChildItems] = useState<any[]>([]);
  const navigate = useNavigate();

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent){
      if(wrapperRef.current && !wrapperRef.current.contains(event.target as Node)){
        setToggleIndex(null);
        setSubToggleIndex(null);
        setSelectedChildItems([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () =>{
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleToggle = (index: number) => {
    setToggleIndex((prevIndex) => (prevIndex === index ? null : index));
    
  };

  const handleMyPageClick = (url: string) => {
    if (user.token === '') {
      setOpenModal(true);
    } else {
      console.log(user.token);
      navigate(url);
    }
  };

  const handleSubItemClick = (item: any, index: number, event: any) => {
    event.stopPropagation(); // 이벤트 전파 중지
    if (item.subItems) {
      setSubToggleIndex(index);
      setSelectedChildItems(item.subItems); // 수정: 자식 항목의 모달 상태 업데이트
      console.log(setSubToggleIndex);
      console.log(setSelectedChildItems);
      
      
    } else {
      window.open(item.url);
      setSelectedChildItems([]);
      setToggleIndex(null);
    }
  };

  const closeModal = () => {   
    setOpenModal(false);
     // 수정: 모달이 닫힐 때 자식 항목의 모달 상태 초기화
  };
  const closeSubModal = () => {
    console.log('닫힘');
    
    setSelectedChildItems([]); // child toggle2가 닫힐 때 selectedChildItems 초기화
  };

  return (
    <Items ref={wrapperRef}>
      {navBarList.map((items, index) => (
        <ItemWrapper key={index} >
          <div onClick={() => { handleToggle(index);
              if (items.title === '마이 페이지') {
                handleMyPageClick('/mypage');
              } 
            }}
          >
            {items.title}
            
            {((items.title === '학과 홈페이지' || items.title === '학교 홈페이지') && (toggleIndex === index)) && (
              <div className='child toggle' >
                <img className='v-vector' src={VVector} />
                <div className='line-vector'></div>
                {items.child?.map((item, itemIndex) => (
                  <ChildDetail key={itemIndex} onClick={(event) => handleSubItemClick(item, itemIndex, event)} >
                    <img src={lightround} alt='상단바 인덱스 디자인' style={{margin: '0 10px'}}/>
                    {item.title}
                    
                    {((items.title === '학과 홈페이지') && (toggleIndex === index) && (selectedChildItems.length > 0)) && (itemIndex === subToggleIndex) && (
                      <div className='child toggle2' onClick={closeSubModal}> {/* 수정된 부분 */}
                        {selectedChildItems.map((subItem, subItemIndex) => (
                          <ChildDetail2 key={subItemIndex} onClick={(event) => handleSubItemClick(subItem, subItemIndex, event)} >
                            {subItem.title}
                          </ChildDetail2>
                      ))}
                      </div>
                )}
                  </ChildDetail>
                ))}
              </div>
            )}
          </div>
        </ItemWrapper>
      ))}
      {isOpenModal && (
        <LoginModal setOpenModal={setOpenModal} closeModal={closeModal} />
      )}
    </Items>
  );
}

const ItemWrapper = styled.div`
  position: relative;
  font-weight: 700;
  font-size: 1rem;
  line-height: 2rem;

  font-family: Inter;
  font-size: 17px;
  font-weight: 300;
  
  &: hover{
    font-weight: 500;
  }

  .child {
    width: 5rem;

    top: 2.5rem;
    transition: opacity 0.5s, visibility 0.5s;
    visibility: hidden;
    opacity: 0;
  }

  .toggle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    visibility: visible;
    opacity: 1;
    z-index: 10;
    margin: 10px 0;
    width: 210px;
    padding: 30px 20px;
    border-radius: 10px;

    background: linear-gradient(
      180deg,
      #8da6ec 4.5%,
      #9cafe2 54%,
      #7590d9 100%);

    display: flex;
    flex-direction: column;
    align-items: center;
  }


  .toggle2 {
    position: absolute;
    left: 180px;
    top: 0px;
    visibility: visible;
    opacity: 1;
    z-index: 10;
    width: max-content;
    padding: 10px;
    border-radius: 10px;
    background:  #FFFFFFCC;
    color: #656565; /* 글씨 색상 */
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  
  .v-vector {
    height: 8px;
    width: 14.6px;
    padding-top: 7px;
    padding-bottom: 7px;
  }

  .round{
    left: 10px;
    position: absolute;
    padding: 10px 10px 10px 12px;
    
  }
  .line-vector {
    height: 0px;
    width: 179px;
    border: 1px solid white;
    margin-top: 7px;
    margin-bottom: 7px;
  }
`;

const Items = styled.div`
  display: flex;
  max-width: 500px;
  -webkit-box-pack: justify;
  justify-content: space-around;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-flex: 1;
  flex-grow: 1;
`;


const ChildDetail = styled.div`
  font-family: Inter;
  font-size: 15px;
  font-weight: 700;
  padding-top: 7px;
  padding-bottom: 7px;
  color: #FFFFFF99;

  width: 100%;
  transition: color 0.2s; /* 배경색 변화에 대한 트랜지션 */
  border-radius: 10px;
  &:hover {
    color: #FFFFFF /* 호버 시 배경색을 변경 */
  }
  &:hover{
    img {
      content: url(${round}); /* 호버 시 이미지 변경 */
    }
  }
  cursor: url('/pointers/cursor-pointer.svg'), pointer;
  position: relative
`;

const ChildDetail2 = styled.div`
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  color:#656565;
  padding: 0 15px;
  transition: background-color 0.3s; /* 배경색 변화에 대한 트랜지션 */
  border-radius: 10px;
  &:hover {
    color: #000000; /* 호버 시 배경색을 변경 */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    img {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      content: url(${polygon}); /* 호버 시 polygon 이미지로 변경 */
    }
  }
`;
