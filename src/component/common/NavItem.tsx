import { useState } from 'react';
import styled from 'styled-components';
import { navBarList } from '../../resource/string/navbar';
import { useSelector } from "react-redux";
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

    const handleItemClick = (index: number) => {
        if (index === 3) {
            if(user.token == ""){
                // alert("로그인 해주세요");
                setOpenModal(!isOpenModal);
                // navigate('/login');
            }
            else {
                console.log('마이 페이지 클릭됨');
                console.log(user.token);
                navigate('/mypage');
            }

            
        }
    };

    const closeModal = () => {
        setOpenModal(false); // 모달을 닫기 위해 상태 업데이트
    };

    return (
        <Items>
        {navBarList.map((items, index) => (
            <ItemWrapper key={index}>
                <div onClick={() => {
                    handleToggle(index);
                    if (items.title === '마이 페이지') {
                        handleItemClick(index);
                    }
                    if(items.title === '메인 페이지') {
                        navigate('/home');
                    }
                }}>
                    {items.title}
                    {items.child && (
                    <div className={toggleIndex === index ? 'child toggle' : 'child'}>
                        <img className='v-vector' src={VVector}/>
                        <div className='line-vector'></div>
                        {toggleIndex === index &&
                            items.child &&
                            items.child.map((item, itemIndex) => (
                                <ChildDetail key={itemIndex}>
                                    {item.title}
                                </ChildDetail>
                            ))}
                    </div>
                    )}
                </div>
            </ItemWrapper>
        ))}
         {isOpenModal && <LoginModal setOpenModal={setOpenModal} closeModal={closeModal} />} {/* isOpenModal 상태에 따라 모달을 렌더링 */}
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
        
        background: linear-gradient(180deg, #8DA6EC 4.5%, #9CAFE2 54%, #7590D9 100%);

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
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
`