// SortDropBox.tsx
import { useEffect } from "react";
import styled from "styled-components";
import { getNotices } from "old/utils/API/Notices";

interface Notice {
  id: number;
  category: string;
  title: string;
  writer: string;
  createDate: string;
  view: number;
  url: string;
}

interface NoticeProps {
  sort: string;
  setNotices: (notice: Notice) => void;
}

export default function SortNotice({ sort, setNotices }: NoticeProps) {
  useEffect(() => {
    const fetchNotices = async () => {
      const response = await getNotices("전체", "date", "1");
      if (response.status === 200) {
        setNotices(response.body.data.notices);
      }
    };
    fetchNotices();
    console.log("왓니");
  }, [sort]);
  return <DropBoxWrapper></DropBoxWrapper>;
}
// const SortDropBox: React.FC<SortDropBoxProps> = ({ sort, setSort }) => {
//   return (
//     <DropBoxWrapper>
//       <span className='dropdown-title'>Sort by</span>
//       <span className='dropdown'>
//         <span className='dropbtn'>{sort.charAt(0).toUpperCase() + sort.slice(1)}</span>
//         <span className='dropdown-content'>
//           <span onClick={() => setSort('date')}>Date</span>
//           <span onClick={() => setSort('like')}>Like</span>
//         </span>
//         <img src={SortDropBoxImg} />
//       </span>
//     </DropBoxWrapper>
//   );
// };

// export default SortDropBox;

const DropBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  /* p::before {
    content: " ";
    display:block;
    background-color: black;
    width: 2px;
    height: 2px;
    border-radius:50%;
    
  } */
  /* .dropdown-title {
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
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    color: #0E4D9D;
    border: none;
    display: block;
    cursor: url('/pointers/cursor-pointer.svg'), pointer;
  } */
`;
