import launchPost from '../../utils/launchPost';

interface PostData {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
}

class PostService {
  static async submitPost(data: PostData, token: string) {
    try {
      return await launchPost(data, token);
    } catch (error) {
      console.error('에러가 발생했습니다:', error);
      throw error;
    }
  }
}

export default PostService;
