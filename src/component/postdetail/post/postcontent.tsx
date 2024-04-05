import React, { useEffect, useState } from "react";
import getPostsImages from '../../../utils/getPostsImages';
import './postcontent.css';

interface PostContentProps {
  id: number;
  content: string;
  imageCount: number;
}

export default function PostContent({ id, content, imageCount }: PostContentProps) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let fetchedImages = [];
        for (let imageId = 1; imageId <= imageCount; imageId++) {
          const imageUrl = await getPostsImages(id, imageId);
          fetchedImages.push(imageUrl);
        }
        setImages(fetchedImages);
      }
      catch (error) {
        console.log(error);
      }
    };

    fetchImages();
  }, [id, imageCount]);

  return (
    <>
      <div className='post-contents'>
        <div className='contents-img-container'>
        {images.map((image, index) => (
          <img className='contents-img' key={index} src={image} alt={`Image ${index + 1}`} />
        ))}
        </div>
        <div className='contents'>{content}</div>
      </div>
    </>
  );
}
