import { Hono } from 'hono'
import { authMiddleware } from '../authMiddleware'
import { AuthContext } from '../types'
import { transformKeysToCamelCase } from '../tools'

export const efsrtRoutes = new Hono()

efsrtRoutes.get('/', async (c: AuthContext) => {
    // await new Promise((resolve) => setTimeout(resolve, 6000));
    const sub = '04937660-6e77-42e2-81f7-cc5c76bf68bd'
    // const { sub } = c.get('payload')

    const result = await c.env.DB.prepare(`
        SELECT 
          module_active,
          module_1_procedure_uuid,
          module_2_procedure_uuid,
          module_3_procedure_uuid,
          progress_percentage
        FROM
          efsrt
        WHERE
          user_uuid = ?
      `).bind(sub).first();

    if (result) {
        return c.json(transformKeysToCamelCase(result))
    } else {
        return c.json({ success: false, message: 'Aun no tienes Modulos Activos' })
    }

})


efsrtRoutes.get('/module', async (c: AuthContext) => {
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    const moduleNumber = c.req.query('number');

    const result = await c.env.DB.prepare(`
          SELECT 
            placeOfExecution, 
            startDate, 
            endDate, 
            supervisor
          FROM 
            efsrt_modules
          WHERE 
            module_id = ?
  
        `).bind(moduleNumber).first();


    return c.json(transformKeysToCamelCase(result))
})