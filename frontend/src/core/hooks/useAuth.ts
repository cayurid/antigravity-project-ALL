import { useCallback } from 'react'
import { useAuthStore } from '@/store'

export const useAuth = () => {
    const { user, token, logout, setUser, setToken } = useAuthStore()

    const login = useCallback(
        async (email: string, password: string) => {
            // TODO: Implement login API call
            console.log('Login:', { email, password })
        },
        []
    )

    const signup = useCallback(
        async (email: string, password: string, name: string) => {
            // TODO: Implement signup API call
            console.log('Signup:', { email, password, name })
        },
        []
    )

    const isAuthenticated = !!token && !!user

    return {
        user,
        token,
        isAuthenticated,
        login,
        signup,
        logout,
    }
}
