// refreshClient.ts - 헤더에 refresh 토큰을 보내야 하므로 apiClient와 구분
const refreshClient = async (url: string, method: string, refreshToken: string) => {
  const headers: HeadersInit = {};

  if (refreshToken) {
    headers['refresh'] = refreshToken;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  try {
    const response = await fetch(url, options);
    const responseBody = await response.json();

    return {
      status: response.status,
      body: responseBody,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default refreshClient;