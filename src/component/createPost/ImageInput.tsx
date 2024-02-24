import React, { ChangeEvent } from 'react';
import pictureImg from '../../resource/assets/picture-img.png';
import './ImageInput.css';

interface ImageInputProps {
  onImageChange: (file: File | null) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageChange }) => {

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // 이미지가 선택되면 부모로부터 전달받은 콜백 호출
    onImageChange(file);
  };

  return (
    <div>
      <label className='image-input-label' htmlFor="imageUpload">
        <img className='image-input-img' src={pictureImg} alt="Upload" />
        <div className='image-input-text'>사진</div>
      </label>
      <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} />
    </div>
  );
};

export default ImageInput;
