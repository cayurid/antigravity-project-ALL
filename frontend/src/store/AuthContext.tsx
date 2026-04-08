import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import ApiClient from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize auth on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    async function initializeAuth() {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                ApiClient.setToken(token);
                const response = await ApiClient.getCurrentUser();
                if (response.data) {
                    setUser(response.data);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('authToken');
                    setIsAuthenticated(false);
                }
            }
        } catch (err) {
            console.error('Auth initialization failed:', err);
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        try {
            setError(null);
            setIsLoading(true);

            const response: AuthResponse = await ApiClient.login({ email, password });

            if (response.data) {
                ApiClient.setToken(response.data.accessToken);
                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.name,
                    role: response.data.role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                setIsAuthenticated(true);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    async function register(email: string, password: string, name: string) {
        try {
            setError(null);
            setIsLoading(true);

            const response: AuthResponse = await ApiClient.register({
                email,
                password,
                name,
            });

            if (response.data) {
                ApiClient.setToken(response.data.accessToken);
                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.name,
                    role: response.data.role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                setIsAuthenticated(true);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        try {
            setError(null);
            await ApiClient.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            ApiClient.setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    }

    function clearError() {
        setError(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
