// Core Types
export interface IUser {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'editor' | 'viewer';
    createdAt: Date;
    updatedAt: Date;
}

export interface ITask {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    projectId: string;
    assignedTo?: string;
    dueDate?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProject {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    members: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITeam {
    id: string;
    name: string;
    description?: string;
    members: {
        userId: string;
        role: 'admin' | 'member';
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IDashboardStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
}

export interface IAuditLog {
    id: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

// API Response Types
export interface IApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export interface IApiError {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
}
