import { Context, Next} from 'hono'

// Middleware para verificar el token Bearer
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader !== 'Bearer test-999-test') {
    return c.json({ error: 'No autorizado' }, 401)
  }
  
  console.log('Access Granted', authHeader)
  await next()
}
