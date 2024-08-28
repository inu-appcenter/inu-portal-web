import { ChangeEvent } from "react";
import pictureImg from "../../resource/assets/picture-img.svg";
import styled from "styled-components";

interface ImageInputProps {
  onImageChange: (file: File | null) => void;
}

export default function ImageInput({ onImageChange }: ImageInputProps) {
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  return (
    <div>
      <ImageInputLabel htmlFor="imageUpload">
        <ImageInputImage src={pictureImg} alt="Upload" />
        <ImageInputText>사진</ImageInputText>
      </ImageInputLabel>
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

// Styled Components
const ImageInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  margin: 0 20px;
  cursor: pointer;
`;

const ImageInputImage = styled.img`
  width: 25px;
  height: 18.33px;
`;

const ImageInputText = styled.div`
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #969696;
`;
