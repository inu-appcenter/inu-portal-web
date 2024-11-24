import styled from "styled-components";

interface ProfileDropdownProps {
  newFireId: string;
  images: string[];
  onChange: (image: string) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  images,
  newFireId,
  onChange,
}) => {
  const handleImageClick = (image: string) => {
    onChange(image);
  };

  return (
    <DropdownWrapper>
      {images.map((image, index) => (
        <GridItem
          key={index}
          isSelected={image === newFireId}
          onClick={() => handleImageClick(image)}
        >
          <img src={image} alt="" />
        </GridItem>
      ))}
    </DropdownWrapper>
  );
};

const DropdownWrapper = styled.div`
  /* margin-top: 44px;
  bottom: 100px; */
  /* display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 10px;
  border: 1px solid #4071B9;
  padding: 30px;
  justify-items: center; */
  /* height: 307px; */
  /* box-sizing: border-box;
  overflow: auto;
  z-index:99; */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 30px;
  border: 1px solid #888888;
  margin: 24px;
  justify-items: center;
  gap: 10px;
  border-radius: 5px;
  box-sizing: border-box;
`;

interface GridItemProps {
  isSelected: boolean;
}

const GridItem = styled.div<GridItemProps>`
  /* width: 58px; 
  height: 99px; 
  position: relative; 
  
  img {
    width: 100%; 
    height: 100%; 
    border: ${({ isSelected }) => (isSelected ? "1px solid #4072B9" : "none")}; 
    border-radius: 5%;
    padding:20px;
    cursor: pointer;
  } */

  img {
    width: 80px;
    height: 90px;
    border: ${({ isSelected }) =>
      isSelected ? "1px solid #4072B9;padding:10px" : "none"};
    border-radius: 50%;
    padding: 5px;
  }
`;
