
import { Hono } from 'hono'
import { authMiddleware } from './authMiddleware'
import { sendOTP, verifyOTP } from './fastpass-api'

type Bindings = {
  FASTPASS_GATEWAY_KEY: string
  FASTPASS_MERCHANT_KEY: string
}

const app = new Hono<{Bindings:Bindings}>()

app.get('/user', authMiddleware , (c) => {

  return c.json({
    firstNames: "FirstNames",
    lastNames: "lastNames",
    email: "email@gmail.com",
    phoneNumber: "9998888777",
    professionalCareer: "Arquitectura",
    semester: "VII",
    birthDate: "00/00/2000",
    dni: "10000000",
    urlImage: null,
  })
})

app.post('/send-otp', async (c) => {
  const { email } = await c.req.json()
  console.log('email received', email)
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // return c.json({ success: false }, {status: 500});
  return c.json({ success: true, otpId:'123-test-123' })
  try {
    const otpId = await sendOTP({FASTPASS_GATEWAY_KEY: c.env.FASTPASS_GATEWAY_KEY, FASTPASS_MERCHANT_KEY: c.env.FASTPASS_MERCHANT_KEY}, email)
    return c.json({ success: true, otpId })
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    return c.json({ success: false, error: 'Error al enviar OTP' }, { status: 500 })
  }
})

app.post('/verify-otp', async (c) => {
  const { otpId, otp } = await c.req.json()
  console.log('json received', {otpId, otp})
  await new Promise((resolve) => setTimeout(resolve, 3000));
  if (otp === '123123'){
    c.header('Authorization', `Bearer test-999-test`)
    return c.json({ success: true,isValid: true, otpId:'otpId-test-123' })
  }else{
    return c.json({ success: false });
  }
  try {
    const isValid = await verifyOTP(c.env.FASTPASS_MERCHANT_KEY, otpId, otp)
    return c.json({ success: true, isValid: isValid })
  } catch (error) {
    console.error('Error al verificar OTP:', error);
    return c.json({ success: false, error: 'Error al verificar OTP' }, { status: 500 })
  }
})



app.get('/check-secrets', (c) => {
  const secrets = {
    gateway_key: !!c.env.FASTPASS_GATEWAY_KEY,
    merchant_key: !!c.env.FASTPASS_MERCHANT_KEY,
  }

  return c.json({
    message: 'Estado de los secrets',
    secretsConfigured: secrets
  })
})

export default app
