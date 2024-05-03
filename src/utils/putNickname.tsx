const ModifyInfo= async (token: string, nickname: string,fireId:string) => {
    const apiURL = `https://portal.inuappcenter.kr/api/members`;
    const data: { nickname?: string; fireId?: string } = {};
    if (nickname) data.nickname = nickname;
    if (fireId) data.fireId = fireId;
    console.log("data 가 어떻게 되여있니", data);
    try {
      const response = await fetch(apiURL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify(data)
      });
  
      console.log(response,'response');
      if (response.status == 400) {
        const data = await response.json();
        console.log(data.msg);
        return data.msg;
      }
      else if(response.status == 404) {
        const data = await response.json();
        console.log(data.msg);
        return data.msg;
      }
      else {
        if(data.nickname === undefined && data.fireId !== undefined) return 200;
        else if(data.nickname !== undefined && data.fireId === undefined) return 201;
        else return 202;
      }
      
  
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default ModifyInfo;