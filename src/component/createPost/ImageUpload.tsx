import React, { ChangeEvent } from 'react';
import postImage from '../../utils/postImage';

interface ImageUploadProps {
  onImageChange: (file: File | null, postId:number) => void;
  postId: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageChange, postId }) => {
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // 이미지가 선택되면 부모로부터 전달받은 콜백 호출
    onImageChange(file, postId);

    // 이미지를 서버에 업로드
    try {
      if (file) {
        await postImage(postId, file); // postId에는 실제 값을 넣어야 합니다.
        console.log('이미지 업로드 완료');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:');
    }
  };

  return (
    <div>
      <label htmlFor="imageUpload">이미지 업로드</label>
      <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} />
    </div>
  );
};

export default ImageUpload;
