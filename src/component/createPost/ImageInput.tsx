import React, { ChangeEvent } from 'react';
import postImage from '../../utils/postImage';
import { useParams } from 'react-router-dom';

interface ImageInputProps {
  onImageChange: (file: File | null, id: string) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageChange }) => {
  const { id } = useParams<{ id: string }>();

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // 이미지가 선택되면 부모로부터 전달받은 콜백 호출
    onImageChange(file, id);

    // 이미지를 서버에 업로드
    try {
      if (file) {
        // postId 대신 id를 사용하도록 수정
        await postImage(id, file);
        console.log('이미지 업로드 완료');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  return (
    <div>
      <label htmlFor="imageUpload">이미지 업로드</label>
      <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} />
    </div>
  );
};

export default ImageInput;
