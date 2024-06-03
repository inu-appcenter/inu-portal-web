// src/utils/apiClient.ts
const apiClient = async (url: string, method: string, token: string, body?: any) => {
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
    // Content-Type은 FormData 사용 시 자동으로 설정됩니다.
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const responseBody = await response.json();

  if (response.ok) {
    return responseBody;
  } else {
    throw new Error(`HTTP error! Status: ${response.status} ${responseBody.msg || 'No additional information available.'}`);
  }
};

export default apiClient;
