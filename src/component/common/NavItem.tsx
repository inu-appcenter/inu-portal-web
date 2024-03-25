import { useState } from 'react';
import styled from 'styled-components';
import { navBarList } from '../../resource/string/navbar';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VVector from '../../resource/assets/V-Vector.svg';

import LoginModal from './LoginModal.tsx';
interface loginInfo {
  user: {
    token: string;
  };
}
export default function NavItems() {
  const [toggleIndex, setToggleIndex] = useState<number | null>(null);
  const user = useSelector((state: loginInfo) => state.user);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleToggle = (index: number) => {
    setToggleIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleMyPageClick = (url: string) => {
    if (user.token == '') {
      setOpenModal(!isOpenModal);
    } else {
      console.log(user.token);
      navigate(url);
    }
  };

  const handleItemClick = (url: string) => {
    window.open(url);
  };

  const closeModal = () => {
    setOpenModal(false); // 모달을 닫기 위해 상태 업데이트
  };

  return (
    <Items>
      {navBarList.map((items, index) => (
        <ItemWrapper key={index}>
          <div
            onClick={() => {
              handleToggle(index);
              if (items.title === '마이 페이지') {
                console.log('마이 페이지 클릭됨');
                handleMyPageClick('/mypage');
              }
            }}
          >
            {items.title}
            {items.child && (
              <div className={toggleIndex === index ? 'child toggle' : 'child'}>
                <img className='v-vector' src={VVector} />
                <div className='line-vector'></div>
                {toggleIndex === index &&
                  items.child &&
                  items.child.map((item, itemIndex) => (
                    <ChildDetail
                      key={itemIndex}
                      onClick={() => handleItemClick(item.url)}
                    >
                      {item.title}
                    </ChildDetail>
                  ))}
              </div>
            )}
          </div>
        </ItemWrapper>
      ))}
      {isOpenModal && (
        <LoginModal setOpenModal={setOpenModal} closeModal={closeModal} />
      )}{' '}
      {/* isOpenModal 상태에 따라 모달을 렌더링 */}
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

  .child {
    width: 5rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    top: 2.5rem;
    transition: opacity 0.5s, visibility 0.5s;
    visibility: hidden;
    opacity: 0;
  }

  .child.toggle {
    visibility: visible;
    opacity: 1;
    z-index: 10;

    width: 187px;
    padding: 20px;
    border-radius: 10px;

    background: linear-gradient(
      180deg,
      #8da6ec 4.5%,
      #9cafe2 54%,
      #7590d9 100%
    );

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .v-vector {
    height: 8px;
    width: 14.6px;
  }

  .line-vector {
    height: 0px;
    width: 179px;
    border: 1px solid white;
  }
`;

const Items = styled.div`
  display: flex;
  max-width: 500px;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-flex: 1;
  flex-grow: 1;
`;

const ChildDetail = styled.div`
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  color: white;
`;
