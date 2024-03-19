import styled from "styled-components";




interface ProfileDropdownProps {
  images: string[]; 
  onChange: (image: string) => void; 
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ images, onChange }) => {
  const handleImageClick = (image: string) => {
    onChange(image); 
  };

  return (
    <DropdownWrapper>
      {images.map((image, index) => (
        <img key={index} src={image} alt="" onClick={() => handleImageClick(image)} />
      ))}
    </DropdownWrapper>
  );
};


const DropdownWrapper = styled.div`
  position: absolute;
  bottom: 100px;
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6개의 열로 구성 */
  gap: 20px; /* 열과 행 사이의 간격 설정 */
  border: 1px solid #4071B9;
  padding:30px;
  img {
    width: 68px;
    height: 109px;
  }
`;