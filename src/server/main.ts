import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { AppModule } from './app.module'
import { TrpcService } from './trpc/trpc.service'
import { TrpcRouter } from './trpc/trpc.router'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS
  app.enableCors()

  // Swagger / OpenAPI 配置
  const config = new DocumentBuilder()
    .setTitle('Admin System API')
    .setDescription('企业级管理系统 REST API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证', '登录、获取当前用户')
    .addTag('用户管理', '用户 CRUD')
    .addTag('部门管理', '部门 CRUD + 树形结构')
    .addTag('菜单管理', '菜单 CRUD + 树形结构')
    .addTag('权限管理', '权限码 CRUD')
    .addTag('角色管理', '角色 CRUD + 权限分配')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  // 挂载 tRPC middleware
  const trpcService = app.get(TrpcService)
  const trpcRouter = app.get(TrpcRouter)

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: (opts: CreateExpressContextOptions) => trpcService.createContext(opts),
    })
  )

  const PORT = process.env.PORT || 3002

  await app.listen(PORT)
  console.log(`🚀 NestJS server running on http://localhost:${PORT}`)
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`)
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`)
}

bootstrap()
