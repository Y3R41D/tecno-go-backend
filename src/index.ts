import { Hono } from 'hono'
import { sendOTP, verifyOTP } from './fastpass-api'
import { sign } from 'hono/jwt'
import { transformKeysToCamelCase } from './tools'
import { Bindings } from './types'
import { userRoutes } from './routes/user'
import { proceduresRoutes } from './routes/procedures'
import { efsrtRoutes } from './routes/efsrt'


const app = new Hono<{ Bindings: Bindings }>()

app.route('/user', userRoutes)
app.route('/user/procedure', proceduresRoutes)
app.route('/user/efsrt', efsrtRoutes)

app.get('/', async (c) => {

  const results = await c.env.DB.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).bind('ejemplo@gmail.com').first();
  return c.json(transformKeysToCamelCase(results))
})



app.post('/send-otp', async (c) => {
  const { email } = await c.req.json()
  console.log('email received', email)
  const results = await c.env.DB.prepare(
    "SELECT email FROM users WHERE email = ?"
  ).bind(email).first();
  if (!results){
    return c.json({ success: false, message: "Estudiante no dado de alta"});
  }
  // return c.json({ success: true, otpId: '123-test-123' })
  try {
    const otpId = await sendOTP({ FASTPASS_GATEWAY_KEY: c.env.FASTPASS_GATEWAY_KEY, FASTPASS_MERCHANT_KEY: c.env.FASTPASS_MERCHANT_KEY }, email)
    return c.json({ success: true, otpId })
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    return c.json({ success: false, message: 'Error al enviar OTP' }, { status: 500 })
  }
})

app.post('/verify-otp', async (c) => {
  const { email, otpId, otp } = await c.req.json()
  console.log('json received', { email, otpId, otp })
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const results = await c.env.DB.prepare(
    "SELECT uuid, email FROM users WHERE email = ?"
  ).bind(email).first();
  if (!results) return c.json({ success: false, message: "Estudiante no dado de alta" });

  const payload = {
    sub: results.uuid,
    email: results.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 5),
  }
  const token = await sign(payload, 'mySecretKey')
  console.log('payload -> ', payload)

  if (otp === '123123') {
    c.header('Authorization', `Bearer ${token}`)
    return c.json({ success: true, isValid: true })
  } else {
    try {
      const isValid = await verifyOTP(c.env.FASTPASS_MERCHANT_KEY, otpId, otp)
      if (isValid) {
        c.header('Authorization', `Bearer ${token}`)
        return c.json({ success: true, isValid: isValid })
      }else {
        return c.json({ success: false, message: "Codigo Invalido" })
      }

    } catch (error) {
      console.error('Error al verificar OTP:', error);
      return c.json({ success: false, message: 'Error al verificar OTP' }, { status: 500 })
    }
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
