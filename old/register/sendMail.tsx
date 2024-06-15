const sendMail = async (email: string) => {
  try {
    const apiURL = `https://portal.inuappcenter.kr/api/members/code`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'email': email
      }),
    });
    const responseBody = await response.json()
    if (response.status == 200) {
      return responseBody;
    }
    else {
      throw new Error(`HTTP error! Status: ${response.status} ${responseBody.msg}`);
    }
  }
  catch (error) {
    throw error;
  }
};

export default sendMail;