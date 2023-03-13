require('dotenv').config()
const { Item } = require('../../src/models/Item')
const { User } = require('../../src/models/User')
const { setupDatabase, tearDown, itemOneID, userOneID, itemOne } = require('../setup')

const createItem = {
    name: 'createItem',
    group: 'men',
    category: 'shoes',
    price: 200
}

beforeEach(setupDatabase)
afterEach(tearDown)

describe('item unit tests', () => {
    it('should be able to create an item', async () => {
        const user = await User.getUser(userOneID)
        await Item.createItem(createItem, user)
        const item = await Item.findOne({ name: createItem.name })
        expect(item).not.toBeNull()
    })

    it('should be able to update an item', async () => {
        const user = await User.getUser(userOneID)
        await Item.updateItem({name: 'update'}, itemOneID, user)
        const item = await Item.findOne({ name: 'update' })
        expect(item).not.toBeNull()
    })

    it('should be able to delete an item', async () => {
        const user = await User.getUser(userOneID)
        await Item.deleteItem(itemOneID, user)
        const item = await Item.findById(itemOneID)
        expect(item).toBeNull()
    })

    it('should be able to fetch an item', async () => {
        const item = await Item.getItem(itemOneID)
        expect(item.name).toBe(itemOne.name)
    })

    it('should be able to fetch items', async () => {
        const { items, page, limit, totalItems } = await Item.getItems({})
        expect(items.length).toBe(4)
        expect(totalItems).toBe(4)
        expect(page).toBe(1)
        expect(limit).toBe(5)
    })

    it('should be able to query for items', async () => {
        const { items } = await Item.getItems({
            q: itemOne.name,
            category: itemOne.category,
            group: itemOne.group,
            price: { gte: itemOne.price }
        })
        expect(items[0].name).toBe(itemOne.name)
    })

    it('belongs to a seller', async () => {
        const item = await Item.getItem(itemOneID)
        expect(item.seller instanceof User).toBe(true)
    })
})