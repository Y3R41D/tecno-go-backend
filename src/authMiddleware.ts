import { Context, Next } from 'hono'
import { decode, sign, verify } from 'hono/jwt'
import { JwtTokenExpired } from 'hono/utils/jwt/types'

// Middleware para verificar el token Bearer
export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace("Bearer ", "")
  console.log(token)
  if (!token) return c.json({ error: 'No autorizado' }, 401)
  try {
    const decodedPayload = await verify(token, 'mySecretKey')
    console.log('Payload Decoded', decodedPayload)
    c.set('payload', decodedPayload);
    await next()
  } catch (error) {
    if (error instanceof JwtTokenExpired) {
      const { payload } = decode(token);
      console.log(payload, 'oldPayload sub:', payload.sub);
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
      }
      const newToken = await sign(newPayload, 'mySecretKey')
      c.header('Authorization', `Bearer ${newToken}`)
      console.log('[JWT Expired] -> NewToken Created')
      c.set('payload', newPayload);
      await next()
    }
    return c.json({ error: 'Error de autenticación' }, 401)
  }
}
