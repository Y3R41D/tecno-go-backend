import { Hono } from 'hono'
import { authMiddleware } from '../authMiddleware'
import { transformKeysToCamelCase, transformKeysToSnakeCase } from '../tools';
import { AuthContext } from '../types'

export const userRoutes = new Hono()

userRoutes.get('/', authMiddleware, async (c: AuthContext) => {

    const { sub } = c.get('payload')
    const results = await c.env.DB.prepare(`
        SELECT
            users.*,
            professional_careers.name AS professional_career
        FROM 
            users
        JOIN 
            professional_careers
        ON 
            professional_careers.id = users.professional_career
        WHERE
            uuid = ?`
    ).bind(sub).first();

    return c.json(transformKeysToCamelCase(results))
})


userRoutes.patch('/', authMiddleware, async (c: AuthContext) => {
    const updates = await c.req.json()
    const { sub } = c.get('payload')
    console.log(transformKeysToSnakeCase(updates), sub)
    const user = await c.env.DB.prepare(
        `SELECT * FROM users WHERE uuid = ?`
    ).bind(sub).first()

    const updateData = transformKeysToSnakeCase(updates)

    const setClauses = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(', ')
    const values = Object.values(updateData)

    try {
        await c.env.DB.prepare(
            `UPDATE users SET ${setClauses} WHERE uuid = ?`
        ).bind(...values, sub).run()

        const updatedUser = { ...user, ...updateData }
        return c.json(transformKeysToCamelCase(updatedUser))

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        return c.json({ error: 'Error al actualizar el usuario' }, 500);
    }
})