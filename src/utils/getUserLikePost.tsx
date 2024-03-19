const getUserLikePost = async (token: string,sort:string) => {
  const apiURL = sort ==='date'?`https://portal.inuappcenter.kr/api/members/likes`:`https://portal.inuappcenter.kr/api/members/likes?sort=${sort}`;  
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Auth: token} : {})
        }
      });
  
      console.log(response,'response');
      if (response.status == 200) {
        const data = await response.json();
        console.log(data);
        return data;
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
  
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default getUserLikePost;