import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { departmentRouter } from './department'
import { menuRouter } from './menu'
import { permissionRouter } from './permission'
import { roleRouter } from './role'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  department: departmentRouter,
  menu: menuRouter,
  permission: permissionRouter,
  role: roleRouter,
})

export type AppRouter = typeof appRouter
