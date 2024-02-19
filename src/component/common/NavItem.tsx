import { useState } from 'react';
import styled from 'styled-components';
import { navBarList } from '../../resource/string/navbar';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

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
                    <div className={toggleIndex === index ? 'child toggle' : 'child'}>
                        {toggleIndex === index &&
                            items.child &&
                            items.child.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                    {item.title}
                                </div>
                            ))}
                    </div>
                </div>
            </ItemWrapper>
        ))}
         {isOpenModal && <LoginModal setOpenModal={setOpenModal} closeModal={closeModal} />} {/* isOpenModal 상태에 따라 모달을 렌더링 */}
    </Items>
    );
}

const ItemWrapper = styled.div`
    font-weight: 700;
    font-size: 1rem;
    line-height: 2rem;

    .child {
        width: 8rem;
        position: absolute;
        top: 2rem;
        display: flex;
        justify-content: center;
        flex-direction: column;
        transition: opacity 0.5s, visibility 0.5s;
        visibility: hidden;
        opacity: 0;
    }

    .child.toggle {
        visibility: visible;
        opacity: 1;
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
