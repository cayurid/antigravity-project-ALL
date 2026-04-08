export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        email: string;
        name: string;
        role: 'user' | 'admin';
        accessToken: string;
        refreshToken: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string | null;
    completedAt?: string | null;
    projectId?: string;
    userId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    project?: Project;
    tags?: Tag[];
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    projectId?: string;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    projectId?: string;
}

export interface UpdateTaskStatusRequest {
    status: 'todo' | 'in_progress' | 'done' | 'cancelled';
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    status: 'active' | 'archived';
    ownerId: string;
    archivedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    tasks?: Task[];
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    tasks?: Task[];
}

export interface CreateTagRequest {
    name: string;
    color?: string;
}

export interface UpdateTagRequest {
    name?: string;
    color?: string;
}

export interface DashboardOverview {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    cancelled: number;
    completionRate: number;
}

export interface DashboardStats {
    overview: DashboardOverview;
    byStatus: Array<{ status: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    projects: Array<{
        id: string;
        name: string;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        completionRate: number;
    }>;
}

export interface SearchFilters {
    query?: string;
    status?: string;
    priority?: string;
    projectId?: string;
    tagIds?: string[];
    startDate?: string;
    endDate?: string;
    completed?: boolean;
    overdue?: boolean;
    sort?: 'date' | 'title' | 'priority' | 'dueDate';
    sortOrder?: 'ASC' | 'DESC';
    skip?: number;
    take?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        skip: number;
        take: number;
        pages: number;
    };
}
