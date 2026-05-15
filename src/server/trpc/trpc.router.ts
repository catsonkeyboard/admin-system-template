import { Injectable } from '@nestjs/common'
import { TrpcService } from './trpc.service'
import { AuthService } from '../modules/auth/auth.service'
import { UserService } from '../modules/user/user.service'
import { DepartmentService } from '../modules/department/department.service'
import { MenuService } from '../modules/menu/menu.service'
import { PermissionService } from '../modules/permission/permission.service'
import { RoleService } from '../modules/role/role.service'
import { createAuthRouter } from '../modules/auth/auth.router'
import { createUserRouter } from '../modules/user/user.router'
import { createDepartmentRouter } from '../modules/department/department.router'
import { createMenuRouter } from '../modules/menu/menu.router'
import { createPermissionRouter } from '../modules/permission/permission.router'
import { createRoleRouter } from '../modules/role/role.router'

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly menuService: MenuService,
    private readonly permissionService: PermissionService,
    private readonly roleService: RoleService,
  ) {}

  get appRouter() {
    return this.trpc.router({
      auth: createAuthRouter(this.trpc, this.authService),
      user: createUserRouter(this.trpc, this.userService),
      department: createDepartmentRouter(this.trpc, this.departmentService),
      menu: createMenuRouter(this.trpc, this.menuService),
      permission: createPermissionRouter(this.trpc, this.permissionService),
      role: createRoleRouter(this.trpc, this.roleService),
    })
  }
}

// 用于类型导出 — 客户端需要这个类型
export type AppRouter = TrpcRouter['appRouter']
