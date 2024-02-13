interface ModifyInfo {
        password: string;
        nickname: string;
}

const ModifyUser = async (token: string, data: ModifyInfo) => {
    console.log(data);
    try {
     const response = await fetch(`https://portal.inuappcenter.kr/api/members`, {
        method: 'PUT',
        headers: {
         'Auth': token,
         'Content-Type': 'application/json',
        },
      body: JSON.stringify(data),
      });
  
      console.log(response,'response');
      if (response.status == 200) {    
        const data = await response.json();
        console.log(data);
        return data;
    }
      
  
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default ModifyUser;