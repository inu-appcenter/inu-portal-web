const editPost = async (
  token: string,
  postId: number,
  title: string,
  content: string,
  category: string,
  anonymous: boolean
) => {
  const apiURL = `https://portal.inuappcenter.kr/api/post/${postId}`;
  try {
    const response = await fetch(apiURL, {
      method: 'PUT',
      headers: {
        Auth: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'title': title,
        'content': content,
        'category': category,
        'anonymous': anonymous,
      }),
    });
    console.log(response, 'response');
    if (response.status == 200) {
      return 200;
    } else if (response.status == 403) {
      return 403;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.log('에러?', error);
    throw error;
  }
};
export default editPost;
