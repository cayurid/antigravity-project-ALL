// Type definitions for API and Frontend

export interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'editor' | 'viewer'
    avatar?: string
    createdAt: string
}

export interface Task {
    id: string
    title: string
    description?: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    projectId: string
    assignedTo?: string
    dueDate?: string
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface Project {
    id: string
    name: string
    description?: string
    ownerId: string
    members: string[]
    createdAt: string
    updatedAt: string
}

export interface DashboardStats {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    overdueTasks: number
    tasksByStatus: Record<string, number>
    tasksByPriority: Record<string, number>
}

export interface AuthResponse {
    token: string
    refreshToken: string
    user: User
}

export interface PaginatedResponse<T> {
    data: T[]
    page: number
    limit: number
    total: number
    totalPages: number
}
