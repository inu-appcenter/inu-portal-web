interface PostData {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
}


const editPost = async (data: PostData, token: string, postId:number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/posts/${postId}`;
  try {
    const response = await fetch(apiURL, {
      method: 'PUT',
      headers: {
        'Auth': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log(response, 'response');
    
    if (response.ok) {
      const data = await response.json();

    if (response.status == 200) {
      console.log('게시글 등록 성공:', data);
      return data;
    } else if (response.status == 403) {
      return 403;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }} catch (error) {
    console.log('에러?', error);
    throw error;
  }
};
export default editPost;
