import launchPost from '../../utils/launchPost';

interface PostData {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
  image: File | null;
}

class PostService {
  static async submitPost(data: PostData, token: string) {
    try {
      const imageUrl = await PostService.uploadImage(data.image, token);

      // 이미지 URL을 데이터에 추가
      const postDataWithImage = { ...data, imageUrl };

      return await launchPost(postDataWithImage, token);
    } catch (error) {
      console.error('에러가 발생했습니다:', error);
      throw error;
    }
  }

  static async uploadImage(image: File | null, token: string) {
    try {
      if (!image) return null;

      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch('https://portal.inuappcenter.kr/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.imageUrl;
      } else {
        console.error('이미지 업로드 실패:', response.status);
        throw new Error(`HTTP 에러! 상태 코드: ${response.status}`);
      }
    } catch (error) {
      console.error('이미지 업로드 에러:', error);
      throw error;
    }
  }
}

export default PostService;
