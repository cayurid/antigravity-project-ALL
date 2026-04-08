import { Request, Response, NextFunction } from 'express'
import { AppError, isAppError } from '@/core/errors'
import { HTTP_STATUS } from '@/config/constants'

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('[ERROR]', {
        name: err.name,
        message: err.message,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    })

    if (isAppError(err)) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: process.env.NODE_ENV === 'development' ? err.details : undefined,
            },
        })
    }

    // Unknown error
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        },
    })
}

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
