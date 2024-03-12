// import { useState } from 'react';
// import styled from 'styled-components';
// import arrowImg from '../../resource/assets/arrow.svg';
// import { profileimg } from '../../resource/string/profileImg';

import styled from "styled-components";



// interface ProfileDropdownProps {
//   images: string[]; // 이미지 경로 배열
//   selectedImage: string; // 선택된 이미지
//   onChange: (image: string) => void; // 이미지 변경 핸들러
// }



// export default function ProfileDropDown({ images,selectedImage,onChange }: ProfileDropdownProps) {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [images,setImages] = useState<string[]>(profileimg);
//     const [currentimage,setCurrentImage] = useState(images[0]);
//   const handleSearchTypeClick = () => {
//     setShowDropdown(!showDropdown);
//     console.log(setImages);
//   };

//   const handleOptionClick = (image: string) => {
//     // setSearchType(type);
//     // setShowDropdown(false);
//     // onSearchTypeChange(type); 
//     setCurrentImage(image);
//   };

//   return (
//     <>
//       <TipDropDownWrapper onClick={handleSearchTypeClick}>
//         {/* <TipDropDownBox>{searchType}</TipDropDownBox> */}
//         <Img src={arrowImg} alt="arrow image" />
//         {showDropdown && (
//           <TipDropDowns className="dropdown-menu">
//             {images.map((image,index) => (
//               <TipDropDownDetail key={index} onClick={() => handleOptionClick(image)}>
//                 <img src={currentimage} alt="" />
//               </TipDropDownDetail>
//             ))}
//           </TipDropDowns>
//         )}
//       </TipDropDownWrapper>
//     </>
//   );
// }

// interface loginInfo {
//   user: {
//     token: string;
//   };
// }

interface ProfileDropdownProps {
  images: string[]; // 이미지 경로 배열
  onChange: (image: string) => void; // 이미지 변경 핸들러
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ images, onChange }) => {
  const handleImageClick = (image: string) => {
    onChange(image); // 선택된 이미지 변경
  };

  return (
    <DropdownWrapper>
      {/* <select value={selectedImage} onChange={(e) => onChange(e.target.value)}> */}
      {images.map((image, index) => (
        <img key={index} src={image} alt="" onClick={() => handleImageClick(image)} />
      ))}
      {/* </select> */}
    </DropdownWrapper>
  );
};


const DropdownWrapper = styled.div`
  /* width: 81px;
  height: 30px;
  display: flex;
  padding: 10px;
  box-sizing: border-box;
  justify-content: space-between;
  position: relative;
  background: #F3F3F3; */
  img {
    width: 80px;
    height: 80px;
  }
`;

// const TipDropDownBox = styled.div`
//   font-size: 10px;
//   font-weight: 800;
//   line-height: 12px;
//   letter-spacing: 0em;
//   text-align: left;
// `;

// const Img = styled.img`
//   width: 6px;
//   height: 11px;
// `;

// const TipDropDowns = styled.div`
//   z-index: 2000;
//   position: absolute;
//   left: 0;
//   right: 0;
//   top: 30px;
//   background-color: black;
//   border-radius: 10px;
//   color: white;
// `;

// const TipDropDownDetail = styled.div`
//   width: 81px;
//   height: 30px;
//   font-size: 10px;
//   font-weight: 800;
//   line-height: 12px;
//   letter-spacing: 0em;
//   text-align: center;
//   padding: 10px;
//   box-sizing: border-box;
// `;
