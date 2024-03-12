const ModifyNickname= async (token: string, nickname: string,fireId:number) => {
    const apiURL = `https://portal.inuappcenter.kr/api/members`;
    try {
      const response = await fetch(apiURL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify({
            'nickname': nickname,
            'fireId': fireId
          })
      });
  
      console.log(response,'response');
      if (response.status == 400) {
        console.error('입력한 닉네임과 현재 닉네임이 동일합니다.', response.status);
        return 400;
      }
      else if(response.status == 404) {
        console.error('존재하지 않는 회원입니다.', response.status);
        return 404;
      }
      else {
          const data = await response.json();
          return data;
      }
      
  
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default ModifyNickname;