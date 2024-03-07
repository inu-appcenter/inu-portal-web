const deletePost = async (token: string, postId: number) => {
    const apiURL = `https://portal.inuappcenter.kr/api/posts/${postId}`;
    try {
      const response = await fetch(apiURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        }
      });
  
      console.log(response,'response');
      if (response.status == 200) {
          return 200;
      }
      else if (response.status == 403) {
        return 403;
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
  
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default deletePost;