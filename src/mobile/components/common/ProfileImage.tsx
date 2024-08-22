import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getFireImages } from '../../../utils/API/Images';
import { useNavigate } from 'react-router-dom';

interface ProfileImageProps {
  fireId: number;
}

export default function ProfileImage({ fireId }: ProfileImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const nav = useNavigate();
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await getFireImages('', fireId);
        if (response.status === 200) {
          setImageUrl(response.body);
        } else {
          console.error('Failed to fetch image:', response.status);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [fireId]);

  return (
    <>
      {imageUrl ? (
        <ProfileImg src={imageUrl} alt={`Profile Image`} onClick={()=>{nav('mypage')}}/>
      ) : (
        <></>
      )}
    </>
  );
}

const ProfileImg = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 100%;
  border: 2px solid #ccc;
`;
