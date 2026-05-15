import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { PermissionService } from './permission.service'
import { PermissionController } from './permission.controller'

@Module({
  imports: [DatabaseModule],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class PermissionModule {}
