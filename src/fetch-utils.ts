const baseURL = 'https://api.fazpass.com/v1';


export const fetchWithAuth = async (MERCHANT_KEY: string, endpoint: string, method: string,  body?: object): Promise<any> => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCHANT_KEY}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res = await response.json()
    return res;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};