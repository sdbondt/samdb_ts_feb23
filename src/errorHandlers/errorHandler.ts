import { Response, Request, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import CustomError, { CustomErrorType } from './customError'
const { INTERNAL_SERVER_ERROR } = StatusCodes

export type IError = Error | CustomErrorType

export const errorHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) return res.status(err.statusCode).json({ message: err.message })
  return res.status(INTERNAL_SERVER_ERROR).json({ message: "Server Error" })
}