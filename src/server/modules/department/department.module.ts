import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { DepartmentService } from './department.service'
import { DepartmentController } from './department.controller'

@Module({
  imports: [DatabaseModule],
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
