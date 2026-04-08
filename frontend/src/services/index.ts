import { API_BASE_URL, ENDPOINTS } from '@/config/api'
import { AuthResponse, User, PaginatedResponse, Task } from '@/core/types'

const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password }),
        })
        if (!response.ok) throw new Error('Login failed')
        return response.json()
    },

    signup: async (
        email: string,
        password: string,
        name: string
    ): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.SIGNUP}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password, name }),
        })
        if (!response.ok) throw new Error('Signup failed')
        return response.json()
    },

    getMe: async (): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.ME}`, {
            headers: getHeaders(),
        })
        if (!response.ok) throw new Error('Failed to get user')
        return response.json()
    },
}

export const taskService = {
    getTasks: async (
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<Task>> => {
        const response = await fetch(
            `${API_BASE_URL}${ENDPOINTS.TASKS.LIST}?page=${page}&limit=${limit}`,
            {
                headers: getHeaders(),
            }
        )
        if (!response.ok) throw new Error('Failed to fetch tasks')
        return response.json()
    },

    createTask: async (data: Partial<Task>): Promise<Task> => {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TASKS.CREATE}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to create task')
        return response.json()
    },

    updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
        const response = await fetch(
            `${API_BASE_URL}${ENDPOINTS.TASKS.UPDATE(id)}`,
            {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
            }
        )
        if (!response.ok) throw new Error('Failed to update task')
        return response.json()
    },

    deleteTask: async (id: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE_URL}${ENDPOINTS.TASKS.DELETE(id)}`,
            {
                method: 'DELETE',
                headers: getHeaders(),
            }
        )
        if (!response.ok) throw new Error('Failed to delete task')
    },
}
