import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer'
import { v4 as uuidv4 } from 'uuid'

const fileFilter = (req: Request, file: Express.Multer.File , cb: FileFilterCallback) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
      } else {
        cb(null, false);
      }
}

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
      },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname)
    }
})

const imageUpload = multer({
    storage: fileStorage,
    fileFilter
})

export default imageUpload
