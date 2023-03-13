const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { app } = require('../src/app/app.ts')
const { connectToDB } = require('../src/db/connectToDB')
const { User } = require('../src/models/User')
const { Item } = require('../src/models/Item')
const { Transaction } = require('../src/models/Transaction')
const PORT = process.env.PORT || 8000
const server = app.listen(PORT)

const userOneID = new mongoose.Types.ObjectId()
const userOneToken = jwt.sign(
    { userId: userOneID },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
)

const userOne = {
    _id: userOneID,
    email: process.env.USERONE_EMAIL,
    name: process.env.USERONE_NAME,
    password: process.env.USERONE_PASSWORD
}

const userTwoID = new mongoose.Types.ObjectId()
const userTwoToken = jwt.sign(
    { userId: userTwoID },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
)

const userTwo = {
    _id: userTwoID,
    email: process.env.USERTWO_EMAIL,
    name: process.env.USERTWO_NAME,
    password: process.env.USERTWO_PASSWORD
}

const userThreeID = new mongoose.Types.ObjectId()
const userThreeToken = jwt.sign(
    { userId: userThreeID },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
)
const userThree = {
    _id: userThreeID,
    email: process.env.USERTHREE_EMAIL,
    name: process.env.USERTHREE_NAME,
    password: process.env.USERTWO_PASSWORD
}

const itemOneID = new mongoose.Types.ObjectId()
const itemOne = {
    _id: itemOneID,
    name: 'one',
    group: 'men',
    category: 'shoes',
    price: 50,
    seller: userOneID,
    subcategory: 'boots',
    description: 'description',
    color: 'white',
    tags: ['winter', 'sale'],

}

const itemTwoID = new mongoose.Types.ObjectId()
const itemTwo = {
    _id: itemTwoID,
    name: 'two',
    group: 'women',
    category: 'clothes',
    price: 250,
    seller: userOneID,
    subcategory: 'dress',
    color: 'black',
    tags: ['summer', 'spring'],
}

const itemThreeID = new mongoose.Types.ObjectId()
const itemThree = {
    _id: itemThreeID,
    name: 'three',
    group: 'women',
    category: 'clothes',
    price: 500,
    color: 'pink',
    seller: userTwoID
}

const itemFourID = new mongoose.Types.ObjectId()
const itemFour = {
    _id: itemFourID,
    name: 'four',
    group: 'men',
    price: 150,
    color: 'blue',
    category: 'clothes',
    seller: userTwoID
}

const itemSoldID = new mongoose.Types.ObjectId()
const itemSold = {
    _id: itemSoldID,
    name: 'sold',
    group: 'men',
    category: 'shoes',
    price: 99,
    seller: userOneID,
    sold: true
}

const transactionOneID = new mongoose.Types.ObjectId()
const transactionOne = {
    _id: transactionOneID,
    seller: userOneID,
    buyer: userTwoID,
    name: 'transactionOne',
    item: itemOne,
    price: 50
}

const transactionTwoID = new mongoose.Types.ObjectId()
const transactionTwo = {
    _id: transactionTwoID,
    seller: userTwoID,
    buyer: userOneID,
    name: 'transactionTwo',
    item: itemTwo,
    price: 100
}

const fakeID = new mongoose.Types.ObjectId()

const setupDatabase = async () => {
    try {
        await connectToDB(process.env.MONGO_TEST_URI)
        await User.deleteMany()
        await Item.deleteMany()
        await Transaction.deleteMany()
        await User.create(userOne)
        await User.create(userTwo)
        await User.create(userThree)
        await Item.create(itemOne)
        await Item.create(itemTwo)
        await Item.create(itemThree)
        await Item.create(itemFour)
        await Item.create(itemSold)
        await Transaction.create(transactionOne)
        await Transaction.create(transactionTwo)
    } catch (e) {
        console.log(e)
    }
}

const tearDown = async () => {
    try {
        await mongoose.connection.close()
        server.close()
    } catch (e) {
        console.log(e)
    }   
}

module.exports = {
    server,
    setupDatabase,
    tearDown,
    userOne,
    userOneID,
    userOneToken,
    userTwo,
    userThree,
    userTwoID,
    userTwoToken,
    userThreeToken,
    userThreeID,
    itemOne,
    itemOneID,
    itemTwo,
    itemTwoID,
    itemThree,
    itemThreeID,
    itemFour,
    itemFourID,
    itemSold,
    itemSoldID,
    transactionOne,
    transactionOneID,
    transactionTwo,
    transactionTwoID,
    fakeID
}