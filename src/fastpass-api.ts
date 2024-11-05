
import { fetchWithAuth } from './fetch-utils';

export const sendOTP = async (env: any, email: string): Promise<string> => {
  try {
    const result = await fetchWithAuth(env.FASTPASS_MERCHANT_KEY, '/otp/request', 'POST', {
      email,
      gateway_key: env.FASTPASS_GATEWAY_KEY,
    });
    console.log('the resultJson -> ',result)
    return result.data.id;
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (MERCHANT_KEY: string, otpId: string, otp: string): Promise<boolean> => {
  try {
    const result = await fetchWithAuth(MERCHANT_KEY, '/otp/verify', 'POST', {
      otpId,
      otp,
    });
    return result.status;
  } catch (error) {
    console.error('Error al verificar OTP:', error);
    throw error;
  }
};