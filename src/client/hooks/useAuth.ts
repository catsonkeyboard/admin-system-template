import { useUserStore } from '@/client/stores/userStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function useAuth() {
  const navigate = useNavigate()
  const { user, token } = useUserStore()

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  return { user, isAuthenticated: !!token }
}
