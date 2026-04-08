import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/AuthContext';
import { ApiClient } from '../services/api';
import { DashboardStats, Task, Project } from '../types';

export function DashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const [stats, recent, upcoming] = await Promise.all([
                ApiClient.getDashboardStats(),
                ApiClient.getRecentTasks({ limit: 5 }),
                ApiClient.getUpcomingTasks({ limit: 5 }),
            ]);
            setDashboardStats(stats);
            setRecentTasks(recent.tasks);
            setUpcomingTasks(upcoming.tasks);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleRefresh = () => {
        loadDashboardData();
        toast.success('Dashboard refreshed');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">📋</h1>
                    <p className="text-gray-600">Loading dashboard...</p>
                    <div className="animate-pulse flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📋 Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            🔄 Refresh
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Overview Stats */}
                {dashboardStats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        {/* Total Tasks */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Tasks</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardStats.overview.total}
                                    </p>
                                </div>
                                <div className="text-4xl">📋</div>
                            </div>
                        </div>

                        {/* Done Tasks */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Done</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {dashboardStats.overview.done}
                                    </p>
                                </div>
                                <div className="text-4xl">✅</div>
                            </div>
                        </div>

                        {/* In Progress Tasks */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">In Progress</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {dashboardStats.overview.inProgress}
                                    </p>
                                </div>
                                <div className="text-4xl">⚙️</div>
                            </div>
                        </div>

                        {/* Todo Tasks */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">To Do</p>
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {dashboardStats.overview.todo}
                                    </p>
                                </div>
                                <div className="text-4xl">📝</div>
                            </div>
                        </div>

                        {/* Completion Rate */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Completion</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {dashboardStats.overview.completionRate}%
                                    </p>
                                </div>
                                <div className="text-4xl">📊</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent and Upcoming Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Tasks */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">🕐 Recent Tasks</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {recentTasks.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No recent tasks
                                </div>
                            ) : (
                                recentTasks.map((task) => (
                                    <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {task.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <span
                                                className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${task.status === 'done'
                                                        ? 'bg-green-100 text-green-800'
                                                        : task.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">⏰ Upcoming Tasks</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {upcomingTasks.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No upcoming tasks
                                </div>
                            ) : (
                                upcomingTasks.map((task) => (
                                    <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {task.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <span
                                                className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${task.priority === 'high'
                                                        ? 'bg-red-100 text-red-800'
                                                        : task.priority === 'medium'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
