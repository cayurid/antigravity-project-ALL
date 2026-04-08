// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    TASKS: {
        LIST: '/tasks',
        CREATE: '/tasks',
        GET: (id: string) => `/tasks/${id}`,
        UPDATE: (id: string) => `/tasks/${id}`,
        DELETE: (id: string) => `/tasks/${id}`,
    },
    PROJECTS: {
        LIST: '/projects',
        CREATE: '/projects',
        GET: (id: string) => `/projects/${id}`,
        UPDATE: (id: string) => `/projects/${id}`,
        DELETE: (id: string) => `/projects/${id}`,
    },
    DASHBOARD: {
        STATS: '/dashboard/stats',
        CHARTS: '/dashboard/charts',
    },
}

export const API_TIMEOUT = 30000 // 30 seconds

export const OAUTH_CONFIG = {
    GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    GITHUB_CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
}
