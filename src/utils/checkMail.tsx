const checkMail = async (email: string, numbers: string) => {
  try {
    const apiURL = `https://portal.inuappcenter.kr/api/members/check-mails`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'email': email,
        'numbers': numbers,
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

export default checkMail;