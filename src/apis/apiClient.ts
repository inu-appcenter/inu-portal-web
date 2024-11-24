// apiClient.ts - status와 body를 return
const apiClient = async (url: string, method: string, token: string, body?: any, responseType: 'json' | 'blob' | 'url' = 'json') => {
  const headers: HeadersInit = {};

  if (token) {
    headers['Auth'] = token;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body instanceof FormData) {
    options.body = body;
    // FormData 사용 시 Content-Type에 application/json 사용하지 않음
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    let responseBody;
    // responseType이 blob, json, url의 경우로 나누어짐
    if (responseType === 'blob') {
      responseBody = await response.blob();
    } else if (responseType === 'url') {
      responseBody = response.url;
    } else {
      responseBody = await response.json();
    }

    return {
      status: response.status,
      body: responseBody,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default apiClient;
