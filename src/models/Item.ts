import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
const { BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = StatusCodes
import mongoose, { Schema, model, Document, Model } from 'mongoose'
import CustomError from '../errorHandlers/customError'
import { Category, Color, CreateItemBody, GetItemsQuery, GetItemsResults, Group, HandlePriceQuery, PriceQuery, Subcategory, UpdateItemBody } from '../constants/itemconstants'
import { IUser } from './User'

export interface IItem extends Document {
    name: string;
    group: Group;
    category: Category;
    subcategory?: Subcategory;
    price: number;
    description?: string;
    color?: Color;
    tags?: string[],
    images?: string[];
    sold: boolean;
    seller: IUser;
    authorizeAction(user: IUser): void;
    deleteImages(): void;
}

export interface ItemModel extends Model<IItem> {
    createItem(body: CreateItemBody, user: IUser, images?: Express.Multer.File[]): Promise<IItem>;
    getItem(itemId: string): Promise<IItem>;
    updateItem(body: UpdateItemBody, itemId: string, user: IUser, images?: Express.Multer.File[]): Promise<IItem>;
    deleteItem(itemId: string, user: IUser): Promise<void>;
    getItems(query: GetItemsQuery): Promise<GetItemsResults>;
    handlePriceQuery(priceQuery: PriceQuery): HandlePriceQuery;
}

const ItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'You must give your item a name.'],
        min: [1, 'Name must be at least 1 character long.'],
        max: [100, 'Name must be maxmimum 100 characters long.']
    },
    group: {
        type: String,
        enum: Object.values(Group),
        required: [true, 'You must supply a category.']
    },
    category: {
        type: String,
        enum: Object.values(Category),
        required: [true, 'You supply a type.']
    },
    subcategory: {
        type: String,
        enum: Object.values(Subcategory)
    },
    price: {
        type: Number,
        min: [1, 'Minimum price is 1'],
        max: [10000, 'Maximum price is 10000.']
    },
    color: {
        type: String,
        enum: Object.values(Color)
    },
    description: {
        type: String,
        trim: true,
        max: [1000, 'Item description cannot be longer than 1000 words.']
    },
    tags: {
        type: [String],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Item must belong to user.']
    },
    images: {
        type: [String],
    },
    sold: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
})

// hooks
ItemSchema.pre<IItem>('remove', function () {
    this.deleteImages()
})

ItemSchema.pre('deleteMany', async function () {
    const items: IItem[] = await Item.find(this.getQuery())
    for (const item of items) {
        item.deleteImages()
    }
})

// methods
ItemSchema.methods.authorizeAction = function (user: IUser) {
    if (!user || this.seller.id != user.id) throw new CustomError('Only the seller can perform this action.', UNAUTHORIZED)
}

ItemSchema.methods.deleteImages = function () {
    if (this.images.length > 0) {
        for (const imageUrl of this.images) {
            fs.unlink(imageUrl, (err) => {
                if(err) throw new CustomError('Something went wrong while removing your images.', INTERNAL_SERVER_ERROR)
            })
        }
    } 
}

// Static methods
ItemSchema.statics.createItem = async function (body: CreateItemBody, user: IUser, images?: Express.Multer.File[]): Promise<IItem> {
    const { name, group, category, subcategory, price, description, color, tags } = body
    if (!(group in Group)) throw new CustomError('Item group must be a valid value.', BAD_REQUEST)
    if(!(category in Category)) throw new CustomError('Item category must be a valid category.', BAD_REQUEST)
    if (!name || name.length < 2 || name.length > 100) throw new CustomError('Item name must be between 1 and 100 characters.', BAD_REQUEST)
    if (!price || price < 1 || price > 10000) throw new CustomError('You must enter an item price between 1 and 10000.', BAD_REQUEST)
    if (subcategory && !(subcategory in Subcategory)) throw new CustomError('Provided subcategory must be a valid value.', BAD_REQUEST)
    if (description && description.length > 1000) throw new CustomError('Item description cannot be longer than 1000 characters.', BAD_REQUEST)
    if (color && !(color in Color)) throw new CustomError('Item color must be a valid color.', BAD_REQUEST)
    if ((tags && !Array.isArray(tags)) || (Array.isArray(tags) && tags.length === 0)) throw new CustomError('Item tags must be valid values.', BAD_REQUEST)
    if (images && images.length > 10) throw new CustomError('You can only upload 10 images per item.', BAD_REQUEST)
    const itemData: any = {
        name,
        group,
        category,
        price,
        seller: user.id
    }
    if (subcategory) itemData.subcategory = subcategory
    if (description) itemData.description = description
    if (color) itemData.color = color
    if (tags) itemData.tags = tags
    if (images) {
        const imageArray: string[] = []
        for (const image of images) {
            imageArray.push(image.path)
        }
        itemData.images = imageArray
    }
    return Item.create(itemData)  
}

ItemSchema.statics.getItem = async function (itemId: string): Promise<IItem> {
    if (!itemId || !mongoose.isValidObjectId(itemId)) throw new CustomError('You must supply a valid item id.', BAD_REQUEST)
    const item: IItem | null = await Item.findById(itemId)
    if (!item) throw new CustomError('No item found with that id.', BAD_REQUEST)
    if(item.seller) await item.populate('seller')
    return item
}

ItemSchema.statics.updateItem = async function (body: UpdateItemBody, itemId: string, user: IUser, images?: Express.Multer.File[]) {
    const { name, group, category, subcategory, price, description, color, tags } = body
    const item = await Item.getItem(itemId)
    if (item.sold) throw new CustomError('That item has already been sold.', UNAUTHORIZED)
    item.authorizeAction(user)
    if (!name && !group && !category && !subcategory && !price
        && !description && !color && tags?.length == 0 && images?.length == 0) throw new CustomError('No data to update your item.', BAD_REQUEST)
    if (group && !(group in Group)) throw new CustomError('Item group must be a valid value.', BAD_REQUEST)
    if (category && !(category in Category)) throw new CustomError('Item category must be a valid category.', BAD_REQUEST)
    if (name && (name.length < 1 || name.length > 100)) throw new CustomError('Item name must be between 1 and 100 characters.', BAD_REQUEST)
    if (price && (price < 1 || price > 10000)) throw new CustomError('You must enter an item price between 1 and 10000.', BAD_REQUEST)
    if (subcategory && !(subcategory in Subcategory)) throw new CustomError('Provided subcategory must be a valid value.', BAD_REQUEST)
    if (description && description.length > 1000) throw new CustomError('Item description cannot be longer than 1000 characters.', BAD_REQUEST)
    if (color && !(color in Color)) throw new CustomError('Item color must be a valid color.', BAD_REQUEST)
    if ((tags && !Array.isArray(tags)) || (Array.isArray(tags) && tags.length === 0)) throw new CustomError('Item tags must be valid values.', BAD_REQUEST)
    if (images && images.length > 10) throw new CustomError('You can only upload 10 images per item.', BAD_REQUEST)
    if (name) item.name = name
    if (group) item.group = group
    if (category) item.category = category
    if (subcategory) item.subcategory = subcategory
    if (price) item.price = price
    if (description) item.description = description
    if (color) item.color = color
    if (tags) item.tags = tags
    if (images) {
        item.deleteImages()
        const imageArray: string[] = []
        for (const image of images) {
            imageArray.push(image.path)
        }
        item.images = imageArray
    }
    return item.save()
}

ItemSchema.statics.deleteItem = async function (itemId: string, user: IUser) {
    const item = await Item.getItem(itemId)
    if (item.sold) throw new CustomError('You cannot delete an item that has already been sold.', BAD_REQUEST)
    item.authorizeAction(user)
    await item.remove()
}

ItemSchema.statics.getItems = async function (query: GetItemsQuery): Promise<GetItemsResults> {
    let { q, sortBy, limit, direction, page, category, subcategory, group, colors, price } = query
    if (group && !(group in Group)) throw new CustomError('Item group must be a valid value.', BAD_REQUEST)
    if (category && !(category in Category)) throw new CustomError('Item category must be a valid category.', BAD_REQUEST)
    if (subcategory && !(subcategory in Subcategory)) throw new CustomError('Provided subcategory must be a valid value.', BAD_REQUEST)
    if (colors && typeof colors == 'string' && !(colors in Color)) throw new CustomError('Must supply a valid color.', BAD_REQUEST)
    if (Array.isArray(colors) && !colors.every((color) => color in Color)) throw new CustomError('Must supply valid colors.', BAD_REQUEST)
    sortBy = sortBy == 'name' ? 'name': sortBy == 'price' ? 'price': 'updated_at'
    direction = direction == 'desc' ? '-' : ''
    sortBy = `${direction}${sortBy}`
    page = Number(page) || 1
    limit = Number(limit) || 5
    if (page < 1 || isNaN(page)) page = 1
    if( limit < 1 || isNaN(limit)) limit = 5
    let queryObj: any = {
        $and: [
            { sold: false }
        ]
    }
    if (q) queryObj.$and.push({
        $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { tags: { $in: [q] } }
        ]
    })
    if (category) queryObj.$and.push({ category })
    if (subcategory) queryObj.$and.push({ subcategory })
    if (group) queryObj.$and.push({ group })
    if (colors) queryObj.$and.push({ color: { $in: colors } })
    if (price) {
        const priceQuery = Item.handlePriceQuery(price)
        queryObj.$and.push({ price: priceQuery })
    }
    const totalItems = await Item.countDocuments(queryObj)
    const maxPage = Math.ceil(totalItems / limit)
    if (maxPage > 0 && page > maxPage) page = maxPage
    const skip = (page - 1) * limit
    const items = await Item.find(queryObj).sort(sortBy).skip(skip).limit(limit)
    return {
        items,
        limit,
        page,
        totalItems
    }
}

ItemSchema.statics.handlePriceQuery = function (priceQuery: PriceQuery): HandlePriceQuery {
    if(typeof priceQuery !== 'object') throw new CustomError('Incorrect price request.', BAD_REQUEST)
    const allowedKeys = ["gt", "gte", "lt", "lte", "in"]
    const key = Object.keys(priceQuery)[0]
    if (!key || !allowedKeys.includes(key)) throw new CustomError('Incorrect price request.', BAD_REQUEST)
    const value = Number(priceQuery[key])
    if (isNaN(value)) throw new CustomError('Incorrect price request.', BAD_REQUEST)
    if(value <1 || value > 10000) throw new CustomError('Incorrect price request.', BAD_REQUEST)
    return { [`$${key}`]: value}
  }

export const Item = model<IItem, ItemModel>('Item', ItemSchema)