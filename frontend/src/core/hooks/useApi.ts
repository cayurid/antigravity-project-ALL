import { useCallback, useState } from 'react'

export const useApi = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const request = useCallback(
        async (url: string, options: RequestInit = {}) => {
            try {
                setIsLoading(true)
                setError(null)

                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    ...options,
                })

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error?.message || 'API Error')
                }

                return await response.json()
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error'
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        []
    )

    return { request, isLoading, error }
}
