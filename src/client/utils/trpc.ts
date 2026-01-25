import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/routers'
import i18n from '@/client/i18n'

export const trpc = createTRPCReact<AppRouter>()

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/trpc',
        headers() {
          const token = localStorage.getItem('token')
          return {
            authorization: token ? `Bearer ${token}` : '',
            'accept-language': i18n.language,
          }
        },
      }),
    ],
  })
}
