import { useState } from 'react';
import styled from 'styled-components';
import { navBarList } from '../../resource/string/navbar';

export default function NavItems() {
    const [toggleIndex, setToggleIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setToggleIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <Items>
            {navBarList.map((items, index) => (
                <ItemWrapper key={index}>
                        <div onClick={() => handleToggle(index)}>
                            {items.title}
                            <div className={toggleIndex === index ? 'child toggle' : 'child'}>
                                {toggleIndex === index &&
                                    items.child &&
                                    items.child.map((item, itemIndex) => (
                                        <div key={itemIndex}>{item.title}</div>
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

// const NavItem = styled.li`
//     list-style: none;
// `;

// const NavItemChild = styled.div`
//     position: relative;

//     .child {
//         width: 8rem;
//         position: absolute;
//         left: calc(50% - 4rem);
//         display: flex;
//         justify-content: center;
//         flex-direction: column;
//         background: rgb(23, 115, 224);
//         border-bottom-right-radius: 1.5rem;
//         border-bottom-left-radius: 1.5rem;
//         box-shadow: rgba(54, 113, 217, 0.25) 0px 4px 4px;
//         transition: opacity 0.5s ease 0s, visibility 0.5s ease 0s;
//         visibility: hidden;
//         opacity: 0;
//     }

//     .toggle {
//         visibility: visible;
//         opacity: 1;
//     }
   
// `;

// const NavItemc = styled.div`
//     list-style: none;
// `;

