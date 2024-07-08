import { useEffect, useState } from 'react';
import { getImages } from '../../../../utils/API/Posts';
import styled from 'styled-components';

interface PostContentProps {
  id: string;
  content: string;
  imageCount: number;
}

const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <div className='image-modal'>
      <div className='modal-button-wrapper'>
        <div className='modal-button-red' onClick={onClose}></div>
        <div
          className='modal-button-green'
          onClick={() => window.open(src, '_blank')}
        ></div>
      </div>
      <img src={src} alt='Modal' onClick={onClose} />
    </div>
  );
};

export default function PostContent({
  id,
  content,
  imageCount,
}: PostContentProps) {
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let fetchedImages = [];
        for (let imageId = 1; imageId <= imageCount; imageId++) {
          const response = await getImages(id, imageId);
          console.log(id, imageId);
          if (response.status === 200) {
            const imageUrl = URL.createObjectURL(response.body);
            fetchedImages.push(imageUrl);
          }
        }
        setImages(fetchedImages);
      } catch (error) {
        console.log(error);
      }
    };

    fetchImages();
  }, [id, imageCount]);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowModal(true);
  };

  return (
    <>
      <div className='post-contents'>
        <div className='contents-img-container'>
          {images.map((image, index) => (
            <ContentImg
              key={index}
              src={image}
              alt={`Image ${index + 1}`}
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>
        <div className='contents'>{content}</div>

        {showModal && (
          <ImageModal src={selectedImage} onClose={() => setShowModal(false)} />
        )}
      </div>
    </>
  );
}

const ContentImg = styled.img`
max-width:100%;
`
