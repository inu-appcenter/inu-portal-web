import { useState } from 'react';
import styled from 'styled-components';
import { navBarList } from '../../resource/string/navbar';
import { useSelector } from "react-redux";

interface loginInfo {
  user: {
    token: string;
  };
}
export default function NavItems() {
    const [toggleIndex, setToggleIndex] = useState<number | null>(null);
    const user = useSelector((state: loginInfo) => state.user);
    const handleToggle = (index: number) => {
        setToggleIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    const handleItemClick = (index: number) => {
        if (index === 3) {
            
            console.log('마이 페이지 클릭됨');
            console.log(user.token);
            if(user.token == ""){
                alert("로그인 해주세요")
            }
        }
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
    </Items>
    );
}

const ItemWrapper = styled.div`
    position: relative;

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

const Items = styled.ul`
    display: flex;
    align-items: center;
    flex-grow: 1;
    gap: 20px;
`;
