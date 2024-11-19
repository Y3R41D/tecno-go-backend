import { Context, Hono } from 'hono'
import { authMiddleware } from '../authMiddleware'

export const efsrtRoutes = new Hono()

efsrtRoutes.get('/', (c) => {
    return c.text('-> /')
})



