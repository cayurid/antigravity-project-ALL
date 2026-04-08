import { create } from 'zustand'
import { User, Task, Project } from '@/core/types'

interface AuthStore {
    user: User | null
    token: string | null
    isLoading: boolean
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setIsLoading: (loading: boolean) => void
    logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token)
        } else {
            localStorage.removeItem('token')
        }
        set({ token })
    },
    setIsLoading: (isLoading) => set({ isLoading }),
    logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
    },
}))

interface TaskStore {
    tasks: Task[]
    isLoading: boolean
    setTasks: (tasks: Task[]) => void
    addTask: (task: Task) => void
    updateTask: (task: Task) => void
    deleteTask: (id: string) => void
    setIsLoading: (loading: boolean) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    isLoading: false,
    setTasks: (tasks) => set({ tasks }),
    addTask: (task) =>
        set((state) => ({
            tasks: [...state.tasks, task],
        })),
    updateTask: (task) =>
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        })),
    deleteTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        })),
    setIsLoading: (isLoading) => set({ isLoading }),
}))

interface ProjectStore {
    projects: Project[]
    currentProject: Project | null
    isLoading: boolean
    setProjects: (projects: Project[]) => void
    setCurrentProject: (project: Project | null) => void
    addProject: (project: Project) => void
    updateProject: (project: Project) => void
    deleteProject: (id: string) => void
    setIsLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    setProjects: (projects) => set({ projects }),
    setCurrentProject: (currentProject) => set({ currentProject }),
    addProject: (project) =>
        set((state) => ({
            projects: [...state.projects, project],
        })),
    updateProject: (project) =>
        set((state) => ({
            projects: state.projects.map((p) => (p.id === project.id ? project : p)),
        })),
    deleteProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
        })),
    setIsLoading: (isLoading) => set({ isLoading }),
}))

interface UIStore {
    showSidebar: boolean
    theme: 'light' | 'dark'
    toggleSidebar: () => void
    setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIStore>((set) => ({
    showSidebar: true,
    theme: 'light',
    toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
    setTheme: (theme) => set({ theme }),
}))
