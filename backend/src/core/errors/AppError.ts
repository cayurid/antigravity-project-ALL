import { HTTP_STATUS, ERROR_CODES } from '@/config/constants'

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        public code: string = ERROR_CODES.INTERNAL_ERROR,
        public details?: Record<string, any>
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(
            message,
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR,
            details
        )
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Unauthorized', details?: Record<string, any>) {
        super(
            message,
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED,
            details
        )
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Forbidden', details?: Record<string, any>) {
        super(
            message,
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.UNAUTHORIZED,
            details
        )
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(
            `${resource} not found`,
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.NOT_FOUND
        )
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(
            message,
            HTTP_STATUS.CONFLICT,
            ERROR_CODES.DUPLICATE_ENTRY,
            details
        )
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(
            message,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.DATABASE_ERROR,
            details
        )
    }
}

export class CacheError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(
            message,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.CACHE_ERROR,
            details
        )
    }
}

export const isAppError = (error: unknown): error is AppError => {
    return error instanceof AppError
}
