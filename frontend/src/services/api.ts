import {
    User,
    Task,
    Project,
    Tag,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    CreateTaskRequest,
    UpdateTaskRequest,
    UpdateTaskStatusRequest,
    CreateProjectRequest,
    UpdateProjectRequest,
    CreateTagRequest,
    UpdateTagRequest,
    SearchFilters,
    ApiResponse,
    PaginatedResponse,
    DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiClient {
    private static token: string | null = null;

    static setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    static getToken(): string | null {
        return this.token || localStorage.getItem('authToken');
    }

    private static getHeaders(contentType = 'application/json'): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': contentType,
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private static async request<T>(
        method: string,
        endpoint: string,
        data?: unknown
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method,
                headers: this.getHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error: ${endpoint}`, error);
            throw error;
        }
    }

    // Auth Endpoints
    static async register(payload: RegisterRequest): Promise<AuthResponse> {
        return this.request('POST', '/api/auth/register', payload);
    }

    static async login(payload: LoginRequest): Promise<AuthResponse> {
        return this.request('POST', '/api/auth/login', payload);
    }

    static async getCurrentUser(): Promise<ApiResponse<User>> {
        return this.request('GET', '/api/auth/me');
    }

    static async refresh(): Promise<ApiResponse<{ accessToken: string }>> {
        return this.request('POST', '/api/auth/refresh');
    }

    static async logout(): Promise<ApiResponse<void>> {
        return this.request('POST', '/api/auth/logout');
    }

    // Tasks Endpoints
    static async getTasks(filters?: {
        status?: string;
        priority?: string;
        projectId?: string;
    }): Promise<ApiResponse<Task[]>> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.projectId) params.append('projectId', filters.projectId);

        const queryString = params.toString();
        return this.request('GET', `/api/tasks${queryString ? `?${queryString}` : ''}`);
    }

    static async createTask(payload: CreateTaskRequest): Promise<ApiResponse<Task>> {
        return this.request('POST', '/api/tasks', payload);
    }

    static async getTask(id: string): Promise<ApiResponse<Task>> {
        return this.request('GET', `/api/tasks/${id}`);
    }

    static async updateTask(id: string, payload: UpdateTaskRequest): Promise<ApiResponse<Task>> {
        return this.request('PUT', `/api/tasks/${id}`, payload);
    }

    static async updateTaskStatus(
        id: string,
        payload: UpdateTaskStatusRequest
    ): Promise<ApiResponse<Task>> {
        return this.request('PATCH', `/api/tasks/${id}/status`, payload);
    }

    static async deleteTask(id: string): Promise<ApiResponse<void>> {
        return this.request('DELETE', `/api/tasks/${id}`);
    }

    // Projects Endpoints
    static async getProjects(status?: string): Promise<ApiResponse<Project[]>> {
        const params = status ? `?status=${status}` : '';
        return this.request('GET', `/api/projects${params}`);
    }

    static async createProject(payload: CreateProjectRequest): Promise<ApiResponse<Project>> {
        return this.request('POST', '/api/projects', payload);
    }

    static async getProject(id: string): Promise<ApiResponse<Project>> {
        return this.request('GET', `/api/projects/${id}`);
    }

    static async updateProject(
        id: string,
        payload: UpdateProjectRequest
    ): Promise<ApiResponse<Project>> {
        return this.request('PUT', `/api/projects/${id}`, payload);
    }

    static async deleteProject(id: string): Promise<ApiResponse<void>> {
        return this.request('DELETE', `/api/projects/${id}`);
    }

    // Tags Endpoints
    static async getTags(): Promise<ApiResponse<Tag[]>> {
        return this.request('GET', '/api/tags');
    }

    static async createTag(payload: CreateTagRequest): Promise<ApiResponse<Tag>> {
        return this.request('POST', '/api/tags', payload);
    }

    static async getTag(id: string): Promise<ApiResponse<Tag>> {
        return this.request('GET', `/api/tags/${id}`);
    }

    static async updateTag(id: string, payload: UpdateTagRequest): Promise<ApiResponse<Tag>> {
        return this.request('PUT', `/api/tags/${id}`, payload);
    }

    static async deleteTag(id: string): Promise<ApiResponse<void>> {
        return this.request('DELETE', `/api/tags/${id}`);
    }

    static async addTagToTask(tagId: string, taskId: string): Promise<ApiResponse<Task>> {
        return this.request('POST', `/api/tags/${tagId}/tasks/${taskId}`);
    }

    static async removeTagFromTask(tagId: string, taskId: string): Promise<ApiResponse<Task>> {
        return this.request('DELETE', `/api/tags/${tagId}/tasks/${taskId}`);
    }

    static async getTasksByTag(tagId: string): Promise<ApiResponse<Task[]>> {
        return this.request('GET', `/api/tags/${tagId}/tasks`);
    }

    // Dashboard Endpoints
    static async getDashboardOverview(): Promise<ApiResponse<DashboardStats>> {
        return this.request('GET', '/api/dashboard/overview');
    }

    static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
        return this.request('GET', '/api/dashboard/stats');
    }

    static async getRecentTasks(limit = 5): Promise<ApiResponse<Task[]>> {
        return this.request('GET', `/api/dashboard/recent?limit=${limit}`);
    }

    static async getUpcomingTasks(limit = 5): Promise<ApiResponse<Task[]>> {
        return this.request('GET', `/api/dashboard/upcoming?limit=${limit}`);
    }

    static async getOverdueTasks(): Promise<ApiResponse<Task[]>> {
        return this.request('GET', '/api/dashboard/overdue');
    }

    static async getProjectStats(): Promise<ApiResponse<any[]>> {
        return this.request('GET', '/api/dashboard/projects');
    }

    // Search Endpoints
    static async search(filters: SearchFilters): Promise<PaginatedResponse<Task>> {
        const params = new URLSearchParams();

        if (filters.query) params.append('query', filters.query);
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.completed !== undefined) params.append('completed', String(filters.completed));
        if (filters.overdue !== undefined) params.append('overdue', String(filters.overdue));
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters.skip !== undefined) params.append('skip', String(filters.skip));
        if (filters.take !== undefined) params.append('take', String(filters.take));

        const queryString = params.toString();
        return this.request('GET', `/api/search${queryString ? `?${queryString}` : ''}`);
    }

    static async quickSearch(query: string, limit = 5): Promise<ApiResponse<Task[]>> {
        return this.request('GET', `/api/search/quick?q=${encodeURIComponent(query)}&limit=${limit}`);
    }

    static async getSuggestions(prefix: string, limit = 5): Promise<ApiResponse<string[]>> {
        return this.request('GET', `/api/search/suggestions?prefix=${encodeURIComponent(prefix)}&limit=${limit}`);
    }

    static async searchByCriteria(criteria: {
        statuses?: string[];
        priorities?: string[];
        projectIds?: string[];
        tagIds?: string[];
    }): Promise<ApiResponse<Task[]>> {
        const params = new URLSearchParams();
        if (criteria.statuses) params.append('statuses', criteria.statuses.join(','));
        if (criteria.priorities) params.append('priorities', criteria.priorities.join(','));
        if (criteria.projectIds) params.append('projectIds', criteria.projectIds.join(','));
        if (criteria.tagIds) params.append('tagIds', criteria.tagIds.join(','));

        const queryString = params.toString();
        return this.request('GET', `/api/search/criteria${queryString ? `?${queryString}` : ''}`);
    }
}

export default ApiClient;
