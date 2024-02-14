const DeleteUser = async (token: string) => {

try {
 const response = await fetch(`https://portal.inuappcenter.kr/api/members`, {
    method: 'DELETE',
    headers: {
     'Auth': token,
     'Content-Type': 'application/json',
    },
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

export default DeleteUser;