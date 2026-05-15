import { Module, Global } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { TrpcService } from './trpc.service'
import { TrpcRouter } from './trpc.router'
import { AuthModule } from '../modules/auth/auth.module'
import { UserModule } from '../modules/user/user.module'
import { DepartmentModule } from '../modules/department/department.module'
import { MenuModule } from '../modules/menu/menu.module'
import { PermissionModule } from '../modules/permission/permission.module'
import { RoleModule } from '../modules/role/role.module'

@Global()
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    DepartmentModule,
    MenuModule,
    PermissionModule,
    RoleModule,
  ],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {}
