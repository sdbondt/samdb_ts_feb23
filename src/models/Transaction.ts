import { StatusCodes } from 'http-status-codes'
const { BAD_REQUEST, UNAUTHORIZED } = StatusCodes
import mongoose, { Schema, model, Document, Model } from 'mongoose'
import CustomError from '../errorHandlers/customError'
import { IUser } from './User'
import { Item } from './Item'
import { GetTransactionsQuery } from '../constants/transactionConstants'

export interface ITransaction extends Document {
    item: string;
    seller: string;
    buyer: string;
    price: number;
}

export interface TransactionModel extends Model<ITransaction> {
    createTransaction(itemId: string, user: IUser): Promise<ITransaction>;
    getTransaction(transactionId: string, user: IUser): Promise<ITransaction>;
    getTransactions(user: IUser, query: GetTransactionsQuery): Promise<ITransaction>;
}

const TransactionSchema = new Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: [true, 'Transaction must belong to a product.']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must have a seller.']
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must have a buyer.']
    },
    price: {
        type: Number,
        required: [true, 'Transaction must have a price.']
    },
    name: {
        type: String,
        required: [true, 'Transaction item must have a name.']
    }
})


// statics
TransactionSchema.statics.createTransaction = async function (itemId, user): Promise<ITransaction> {
    const item = await Item.getItem(itemId)
    if (item.sold) throw new CustomError('Item is no longer for sale.', BAD_REQUEST)
    const transaction = await Transaction.create({
        item: itemId,
        seller: item.seller,
        buyer: user,
        price: item.price,
        name: item.name
    })
    item.sold = true
    await item.save()
    return transaction
}

TransactionSchema.statics.getTransaction = async function (transactionId, user): Promise<ITransaction> {
    if(!transactionId || !mongoose.isValidObjectId(transactionId)) throw new CustomError('No transaction found.', BAD_REQUEST)
    const transaction = await Transaction.findById(transactionId)
    if (!transaction) throw new CustomError('No transaction found.', BAD_REQUEST)
    if (user.id != transaction.seller && user.id != transaction.buyer) throw new CustomError('Unauthorized.', UNAUTHORIZED)
    return transaction
}

TransactionSchema.statics.getTransactions = async function (user: IUser, query: GetTransactionsQuery): Promise<ITransaction[]> {
    const { type } = query
    await user.populate(['purchases', 'sales'])
    if (type && type == 'sales') return user.sales
    if (type && type == 'purchases') return user.purchases
    return [...user.sales, ...user.purchases]
}

export const Transaction = model<ITransaction, TransactionModel>('Transaction', TransactionSchema)