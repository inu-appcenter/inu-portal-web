// SortDropBox.tsx
import React from 'react';
import styled from 'styled-components';
import SortDropBoxImg from '../../resource/assets/SortDropBox-img.svg';

interface SortDropBoxProps {
  sort: string;
  setSort: (sort: string) => void;
}

const SortDropBox: React.FC<SortDropBoxProps> = ({ sort, setSort }) => {
  return (
    <DropBoxWrapper>
      <span className='dropdown-title'>Sort by</span>
      <span className='dropdown'>
        <span className='dropbtn'>{sort.charAt(0).toUpperCase() + sort.slice(1)}</span>
        <span className='dropdown-content'>
          <span onClick={() => setSort('date')}>Date</span>
          <span onClick={() => setSort('like')}>Like</span>
        </span>
        <img src={SortDropBoxImg} />
      </span>
    </DropBoxWrapper>
  );
};

export default SortDropBox;

const DropBoxWrapper = styled.div`
  display: flex;
  align-items: center;

  .dropdown-title {
    font-family: Inter;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    color: #969696;
    margin-right: 10px;
  }

  .dropdown {
    position: relative;
    display: flex;
    align-items: center;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropbtn{
    background-color: rgba(255, 255, 255, 0);
    font-family: Inter;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    color: #0E4D9D;
    border: none;
    width: 35px;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.75);
    z-index: 1;
    top: 100%;
    width: 100%;
  }

  .dropdown-content span {
    font-family: Inter;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    color: #0E4D9D;
    border: none;
    display: block;
    cursor: pointer;
  }
`;

