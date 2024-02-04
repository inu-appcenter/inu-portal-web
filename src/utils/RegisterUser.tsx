interface RegisterData {
  email: string,
  password: string
}

const registerUser = async (data: RegisterData): Promise<string |void> => {
  try {
    const response = await fetch('https://portal.inuappcenter.kr/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log(response,'response');
    if (response.status == 400) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
        const token = response.text();
        console.log("회원가입 성공", token);

        return token; 
    }
    

  } catch (error) {
    console.log("에러?", error);
    alert("다시 입력해주세요.")
    throw error;
  }
};

export default registerUser;