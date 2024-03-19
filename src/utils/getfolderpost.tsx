const getFolderPost = async (folderId: number) => {
    const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}`;
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      console.log(response,'response');
      if (response.status === 200) {
        const data = await response.json();
        return data.data.posts;
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default getFolderPost;
