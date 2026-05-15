import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { TrpcModule } from './trpc/trpc.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TrpcModule, // TrpcModule 已经导入了所有业务模块
  ],
  providers: [
    // 全局 JWT 守卫 — REST 接口默认需要认证，用 @Public() 标记公开接口
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
