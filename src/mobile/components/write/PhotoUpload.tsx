import { ChangeEvent } from 'react';
import styled from 'styled-components';
import cameraIcon from '../../../resource/assets/mobile/write/camera-icon.svg';

interface PhotoUploadProps {
  onImageChange: (file: File | null) => void;
  images: File[];
  onImageRemove: (index: number) => void;
}

export default function PhotoUpload({ onImageChange, images, onImageRemove }: PhotoUploadProps) {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  return (
    <PhotoUploadWrapper>
      {images.length === 0 ? (
        <CenteredAddImageWrapper>
          <label htmlFor="imageUpload">
            <AddImageButton>
              <img src={cameraIcon} alt="Upload" />
              <div>사진 추가</div>
            </AddImageButton>
          </label>
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </CenteredAddImageWrapper>
      ) : (
        <ImagePreviewWrapper>
          {images.map((image, index) => (
            <ImageContainer key={index}>
              <img src={URL.createObjectURL(image)} alt={`preview ${index}`} />
              <RemoveButton onClick={() => onImageRemove(index)}>X</RemoveButton>
            </ImageContainer>
          ))}
          {images.length < 10 && (
            <AddImageWrapper>
              <label htmlFor="imageUpload">
                <AddImageButton>
                  <img src={cameraIcon} alt="Upload" />
                  <div>사진 추가</div>
                </AddImageButton>
              </label>
              <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </AddImageWrapper>
          )}
        </ImagePreviewWrapper>
      )}
    </PhotoUploadWrapper>
  );
}

const PhotoUploadWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 1px;
  border: 1px solid #E0E0E0;
  position: relative;
  overflow-y: scroll;
`;

const CenteredAddImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const AddImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddImageButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 64px;
    height: 64px;
  }
  div {
    margin-top: 8px;
    font-size: 14px;
    color: #303030;
  }
`;

const ImagePreviewWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5열 */
  grid-template-rows: repeat(2, 1fr);  /* 2행 */
  gap: 8px;
  padding: 8px;
  box-sizing: border-box;
`;

const ImageContainer = styled.div`
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
