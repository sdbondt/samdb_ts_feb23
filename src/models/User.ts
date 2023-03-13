import fs from 'fs'
import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
const { BAD_REQUEST } = StatusCodes
import jwt from 'jsonwebtoken'
import mongoose, { Schema, model, Document, Model } from 'mongoose'
import { emailRegex, passwordRegex } from '../constants/constants'
import { IQuery, IQueryObj, IUsersQuery } from '../constants/userConstants'
import CustomError from '../errorHandlers/customError'
import { ITransaction } from './Transaction'

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    imageUrl: string;
    getJWT(): string;
    sales: ITransaction[],
    purchases: ITransaction[];
    comparePassword(): Promise<boolean>;
    removeImage(): void   
}

interface UserModel extends Model<IUser> {
    signup(email: string, name: string, password: string, confirmPassword: string, imageUrl: string | null): Promise<string>;
    login(email: string, password: string): Promise<string>;
    deleteProfile(user: IUser): Promise<void>;
    updateProfile(user: IUser , obj: IUserUpdate): Promise<IUser>;
    getProfile(user: IUser): Promise<IUser>;
    getUser(userID: string): Promise<IUser>;
    getUsers(query: IQuery): Promise<IUsersQuery>;
}

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a name."],
        maxlength: [50, "Name cannot be more than 50 characters."],
        minlength: [2, "Name must be at least 2 characters."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        match: [emailRegex, "Please provide a valid email."],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 charachters long."],
        maxlength: [100, "Password cannot be longer than 100 characters."],
        match: [passwordRegex, "Password must be 6 characters long, contain a lower and uppercase letter and a number"]
    },
    imageUrl: String
})

// hooks
UserSchema.pre("save", async function () {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
})

UserSchema.pre<IUser>('remove', async function() {
    try {
        this.removeImage()
        await mongoose.model('Item').deleteMany({ seller: this.id, sold: false })
    } catch (e) {
        console.log(e)
    }
})

UserSchema.pre('deleteMany', async function (next) {
    try {
        const users: IUser[] = await this.model.find(this.getQuery())
        for (const user of users) {
            user.removeImage()
        }
    } catch (e: any) {
        next(e)
    }
})
  

// methods
UserSchema.methods.getJWT = function (): string {
    return jwt.sign(
        { userId: this._id },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "30d",
        }
    )
}

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
}

UserSchema.methods.removeImage = function () {
    if (this.imageUrl) {
        fs.unlink(this.imageUrl, (err) => {
            if (err) throw new CustomError('Something went wrong deleting the users image.', BAD_REQUEST) 
        })
    }
}
// static methods
UserSchema.statics.signup = async function (email: string, name: string, password: string, confirmPassword: string, imageUrl: string | null): Promise<string> {
    if (password !== confirmPassword) throw new CustomError('Invalid request: passwords don\'t match.', BAD_REQUEST)
    if (!email || !name || !password || !confirmPassword) throw new CustomError('Invalid request, must supply a name, an email and a password.', BAD_REQUEST)
    if (!emailRegex.test(email)) throw new CustomError('Must submit a valid email address.', BAD_REQUEST)   
    if (!passwordRegex.test(password)) throw new CustomError('Passwords must contain at least 6 characters and should contain an uppercase, lowercase and numeric value.', BAD_REQUEST)
    if(name.length <2 || name.length >50) throw new CustomError('Name must be at least 2 and maximum 50 characters long.', BAD_REQUEST)
    const emailExists = await this.findOne({ email })
    if (emailExists) throw new CustomError('Email address is already in use.', BAD_REQUEST)
    const user = await this.create({
        email,
        name,
        password,
        imageUrl
    })
    return user.getJWT() 
}

UserSchema.statics.login = async function (email: string, password: string): Promise<string> {
    if (!email || !password) throw new CustomError('Please provide an email and password.', BAD_REQUEST)
    const user = await this.findOne({ email })
    if (!user) throw new CustomError('Invalid credentials.', BAD_REQUEST)
    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw new CustomError('Invalid credentials.', BAD_REQUEST)
    return user.getJWT()
}
interface IUserUpdate {
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
    imageUrl?: string
}

UserSchema.statics.updateProfile = async function (user: IUser, obj: IUserUpdate): Promise<IUser> {
    const { email, name, password, confirmPassword, imageUrl } = obj
    if (!email && !name && !password && !imageUrl) throw new CustomError('Nothing to update your profile.', BAD_REQUEST)
    if (email && !emailRegex.test(email)) throw new CustomError('Must submit a valid email address.', BAD_REQUEST) 
    if (name && (name.length < 2 || name.length > 50)) throw new CustomError('Name must be at least 2 and maximum 50 characters long.', BAD_REQUEST)
    if (password && password !== confirmPassword) throw new CustomError('Passwords should match.', BAD_REQUEST)
    if (password && !passwordRegex.test(password)) throw new CustomError('Passwords must contain at least 6 characters and should contain an uppercase, lowercase and numeric value.', BAD_REQUEST)
    const emailExists = await User.findOne({ email })
    if (email && emailExists) throw new CustomError('Email already in use.', BAD_REQUEST)
    if (email) user.email = email
    if (password) user.password = password
    if (imageUrl) user.imageUrl = imageUrl
    if (name) user.name = name
    return user.save({ validateBeforeSave: false })
}

UserSchema.statics.deleteProfile = async function (user: IUser): Promise<void> {
    await user.remove()
}

UserSchema.statics.getProfile = async function (user: IUser): Promise<IUser> {
    return user
}

UserSchema.statics.getUser = async function (userID: string): Promise<IUser> {
    if(!userID || !mongoose.isValidObjectId(userID)) throw new CustomError('You must supply a valid user id.', BAD_REQUEST)
    const user = await User.findById(userID)
    if (!user) throw new CustomError('No user found with that id.', BAD_REQUEST)
    return user    
}



UserSchema.statics.getUsers = async function (query: IQuery): Promise<IUsersQuery> {
    let q = query?.q || ''
    let page = Number(query?.page) || 1
    let limit = Number(query?.limit) || 5
    let queryObj: IQueryObj = {}
    if (q) queryObj.name = { $regex: q, $options: 'i' } 
    if (page < 1 || isNaN(page) || !Number.isInteger(page)) page = 1
    if (limit < 1 || isNaN(limit) || !Number.isInteger(limit)) limit = 5
    const skip = (page - 1) * limit
    const users = await User.find(queryObj).skip(skip).limit(limit)
    return {
        users,
        limit,
        page,
    }
}

// virtuals
UserSchema.virtual('items', {
    ref: 'Item',
    localField: '_id',
    foreignField: 'seller',
    justOne: false
})

UserSchema.virtual('sales', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'seller',
    justOne: false
})

UserSchema.virtual('purchases', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'buyer',
    justOne: false
})

export const User = model<IUser, UserModel>('User', UserSchema)
