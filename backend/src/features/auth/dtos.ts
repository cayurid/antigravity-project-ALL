export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
    confirmPassword?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            avatar?: string;
        };
        tokens: {
            accessToken: string;
            refreshToken?: string;
        };
    };
    error?: string;
}

export interface JWTPayload {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken?: string;
}
