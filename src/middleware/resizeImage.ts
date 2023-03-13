import { NextFunction, Request, Response } from 'express'
import sharp from 'sharp'
import asyncHandler from '../errorHandlers/asyncHandler'
import fs from 'fs'
import CustomError from '../errorHandlers/customError'
import { StatusCodes } from 'http-status-codes'
const { BAD_REQUEST } = StatusCodes

const resizeImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req?.file?.path) {
      fs.readFile(req.file.path, (err, data) => {
        if (err) throw new CustomError('Something went wrong while uploading your image', BAD_REQUEST)
        sharp(data)
          .resize({ width: 100, height: 200 })
          .toFile(`images/${req?.file?.filename}`, (err) => {
            if (err) throw new CustomError('Something went wrong while uploading your image', BAD_REQUEST)
          })
      })
    } 
    next()    
  })

export default resizeImage