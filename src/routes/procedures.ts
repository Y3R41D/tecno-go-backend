import { Hono } from 'hono'
import { authMiddleware } from '../authMiddleware'
import { AuthContext } from '../types'
import { transformKeysToCamelCase } from '../tools'

type Procedure = {
  uuid: string;
  procedure_type: string;
  submission_date: number;
  is_completed: boolean;
  additional_data: string | null
  procedure_name: string;
};

export const proceduresRoutes = new Hono()

proceduresRoutes.get('/', authMiddleware, async (c: AuthContext) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM procedure_types').all()
  // await new Promise((resolve) => setTimeout(resolve, 6000));

  return c.json(results)
})


proceduresRoutes.post('/initiate', authMiddleware, async (c: AuthContext) => {
  const { procedureType, additionalData } = await c.req.json()
  const additionalDataString =
    additionalData && Object.keys(additionalData).length > 0
      ? JSON.stringify(additionalData)
      : null;
  console.log('additionalDataString', additionalDataString)
  const { sub } = c.get('payload')
  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO procedures (uuid, user_uuid, procedure_type, submission_date, additional_data) VALUES (?, ?, ?, ?, ?)`
    )
      .bind(crypto.randomUUID(), sub, procedureType, Date.now(), additionalDataString)
      .run();

    if (result.success) {
      return c.json({ success: true, message: 'Tramite iniciado correctamente' });
    } else {
      return c.json({ success: false, message: 'Fallo al iniciar el tramite' }, 500);
    }
  } catch (error) {
    console.error('Error inserting procedure:', error);
    return c.json({ success: false, message: 'Database error', error: error }, 500);
  }
})


proceduresRoutes.get('/progress', authMiddleware, async (c: AuthContext) => {
  const sub = '04937660-6e77-42e2-81f7-cc5c76bf68bd'
  // const { sub } = c.get('payload')

  const { results }: { results: Procedure[] } = await c.env.DB.prepare(`
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
    if (arr[index].additional_data) {
      console.log(arr[index].additional_data)
      arr[index].additional_data = JSON.parse(arr[index].additional_data)
    }
    arr[index] = transformKeysToCamelCase(value)
  })
  return c.json(results)
})


proceduresRoutes.get('/response', authMiddleware, async (c: AuthContext) => {
  const { sub } = c.get('payload')

  const { results }: { results: Procedure[] } = await c.env.DB.prepare(`
        SELECT 
          procedures_completed.uuid, 
          procedures_completed.procedure_type, 
          procedures_completed.submission_date, 
          procedures_completed.completed_date, 
          procedures_completed.download_base_url,
          procedures_completed.additional_data,
          procedures_completed.file_extension,
          procedure_types.name AS procedure_name
        FROM 
          procedures_completed
        JOIN 
          procedure_types 
        ON 
          procedures_completed.procedure_type = procedure_types.id
        WHERE 
          procedures_completed.user_uuid = ?
        ORDER BY 
          procedures_completed.completed_date DESC
      `).bind(sub).all();

  results.forEach((value, index, arr) => {
    if (arr[index].additional_data) {
      console.log(arr[index].additional_data)
      arr[index].additional_data = JSON.parse(arr[index].additional_data)
    }
    arr[index] = transformKeysToCamelCase(value)
  })
  return c.json(results)
})