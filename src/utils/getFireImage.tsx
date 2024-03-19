// getCategory.tsx
const getFireImage= async (token:string,fireId:number) => {
    const apiURL = `https://portal.inuappcenter.kr/api/images/${fireId}`;
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Auth:token
        },
      });
  
      if (response.status == 200) {
        
        console.log(response.url,"이미지 url");
        return response.url;
      }
    } catch (error) {
      console.log('에러?', error);
      throw error;
    }
  };
  
  export default getFireImage;
  