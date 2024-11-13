
import { Context, Hono } from 'hono'
import { authMiddleware } from './authMiddleware'
import { sendOTP, verifyOTP } from './fastpass-api'
import { sign } from 'hono/jwt'
import { transformKeysToCamelCase, transformKeysToSnakeCase } from './tools'
import { JWTPayload } from 'hono/utils/jwt/types'

type Bindings = {
  FASTPASS_GATEWAY_KEY: string
  FASTPASS_MERCHANT_KEY: string
  DB: D1Database
}

// Define las variables personalizadas para el contexto
interface AuthVariables {
  payload: JWTPayload;
}

// Tipo para el contexto autenticado
type AuthContext = Context<{
  Bindings: Bindings,
  Variables: AuthVariables;
  JWT: JWTPayload; // Esto es importante para que Hono sepa del payload
}>;

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {

  const results = await c.env.DB.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).bind('ejemplo@gmail.com').first();
  return c.json(transformKeysToCamelCase(results))
})

app.get('/user', authMiddleware, async (c: AuthContext) => {
  const { email } = c.get('payload');
  const results = await c.env.DB.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).bind(email).first();

  return c.json(transformKeysToCamelCase(results))
})

app.patch('/user', authMiddleware, async (c: AuthContext) => {
  const updates = await c.req.json()
  const { sub } = c.get('payload')
  console.log(transformKeysToSnakeCase(updates), sub)
  const user = await c.env.DB.prepare(
    `SELECT * FROM users WHERE id = ?`
  ).bind(sub).first()

  const updateData = transformKeysToSnakeCase(updates)

  const setClauses = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(', ')
  const values = Object.values(updateData)

  try {
    await c.env.DB.prepare(
      `UPDATE users SET ${setClauses} WHERE id = ?`
    ).bind(...values, sub).run()

    const updatedUser = { ...user, ...updateData }
    return c.json(transformKeysToCamelCase(updatedUser))

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return c.json({ error: 'Error al actualizar el usuario' }, 500);
  }
})

app.post('/send-otp', async (c) => {
  const { email } = await c.req.json()
  console.log('email received', email)
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // return c.json({ success: false }, {status: 500});
  return c.json({ success: true, otpId: '123-test-123' })
  try {
    const otpId = await sendOTP({ FASTPASS_GATEWAY_KEY: c.env.FASTPASS_GATEWAY_KEY, FASTPASS_MERCHANT_KEY: c.env.FASTPASS_MERCHANT_KEY }, email)
    return c.json({ success: true, otpId })
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    return c.json({ success: false, error: 'Error al enviar OTP' }, { status: 500 })
  }
})

app.post('/verify-otp', async (c) => {
  const { email, otpId, otp } = await c.req.json()
  console.log('json received', { email, otpId, otp })
  await new Promise((resolve) => setTimeout(resolve, 3000));
  if (otp === '123123') {
    const results = await c.env.DB.prepare(
      "SELECT id, email FROM users WHERE email = ?"
    ).bind(email).first();
    if (!results) return c.json({ success: false, message: "Estudiante no dado de alta" });
    const payload = {
      sub: results.id,
      email: results.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
    }
    console.log('payload -> ', payload)
    const token = await sign(payload, 'mySecretKey')
    c.header('Authorization', `Bearer ${token}`)
    return c.json({ success: true, isValid: true, otpId })
  } else {
    return c.json({ success: false, message: "Codigo OTP Invalido" });
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
