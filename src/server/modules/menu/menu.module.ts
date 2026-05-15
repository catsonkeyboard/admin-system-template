import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { MenuService } from './menu.service'
import { MenuController } from './menu.controller'

@Module({
  imports: [DatabaseModule],
  providers: [MenuService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}
