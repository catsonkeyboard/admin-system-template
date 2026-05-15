// 桥接文件 — 保持客户端 import 路径兼容
// 客户端通过 import type { AppRouter } from '@/server/routers' 引用此类型
export type { AppRouter } from "../trpc/trpc.router";
