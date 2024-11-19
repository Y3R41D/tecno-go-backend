import { Hono } from 'hono'
import { authMiddleware } from '../authMiddleware'
import { AuthContext } from '../types'
import { transformKeysToCamelCase } from '../tools'

export const proceduresRoutes = new Hono()

proceduresRoutes.get('/', authMiddleware, async (c: AuthContext) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM procedure_types').all()

  return c.json(results)
})


proceduresRoutes.post('/initiate', authMiddleware, async (c: AuthContext) => {
  const { procedureType, additionalData } = await c.req.json()
  const { sub } = c.get('payload')
  const uuid = crypto.randomUUID()
  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO procedures (uuid, user_uuid, procedure_type, submission_date, additional_data) VALUES (?, ?, ?, ?, ?)`
    )
      .bind(uuid, sub, procedureType, Date.now(), JSON.stringify(additionalData) || null)
      .run();

    if (result.success) {
      return c.json({ success: true, message: 'Tramite iniciado correctamente', uuid });
    } else {
      return c.json({ success: false, message: 'Fallo al iniciar el tramite' }, 500);
    }
  } catch (error) {
    console.error('Error inserting procedure:', error);
    return c.json({ success: false, message: 'Database error', error: error }, 500);
  }
})


proceduresRoutes.get('/progress', async (c: AuthContext) => {
  const sub = '04937660-6e77-42e2-81f7-cc5c76bf68bd'
  // const { sub } = c.get('payload')
  const { results } = await c.env.DB.prepare(`
        SELECT 
          procedures.uuid, 
          procedures.procedure_type, 
          procedures.submission_date, 
          procedures.is_completed, 
          procedures.additional_data,
          procedure_types.name AS procedure_name
        FROM 
          procedures
        JOIN 
          procedure_types 
        ON 
          procedures.procedure_type = procedure_types.id
        WHERE 
          procedures.user_uuid = ?
        ORDER BY 
          procedures.submission_date DESC
      `).bind(sub).all();

  results.forEach((value, index, arr) => {
    arr[index] = transformKeysToCamelCase(value)
  })
  return c.json(results)
})

