require('dotenv').config()
const { Item } = require('../../src/models/Item')
const { StatusCodes } = require('http-status-codes')
const request = require('supertest')
const { server, setupDatabase, tearDown, userOneToken, userTwoToken, fakeID, itemOneID, itemSoldID, itemOne, itemFour } = require('../setup')
const { CREATED, OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes

const createItem = {
    name: 'item',
    group: 'men',
    category: 'shoes',
    price: 50,
}

const additionalData = {
    tags: ['x', 'Y'],
    subcategory: 'shorts',
    description: 'abcdefgh',
    color : 'black'
}

beforeEach(setupDatabase)
afterEach(tearDown)

describe('items feature test', () => {
    describe('if create items request is correct', () => {
        it('should create an item', async () => {
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send(createItem)
                .expect(CREATED)
            const item = await Item.findOne(createItem)
            expect(item).not.toBeNull()
        })

        it('should be able to upload several images', async () => {
            await request(server).post('/api/items')
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${userOneToken}`)
                .field('name', createItem.name)
                .field('group', createItem.group)
                .field('category', createItem.category)
                .field('price', createItem.price)
                .attach('images', 'tests/testimages/testimage2.png')
                .attach('images', 'tests/testimages/testimage3.png')
                .expect(CREATED)
            const item = await Item.findOne(createItem)
            expect(item).not.toBeNull()
            expect(item.images.length).toBe(2)
        })

        it('should be able to provide optional data aswell', async () => {
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    ...additionalData
                })
                .expect(CREATED)
            const item = await Item.findOne(createItem)
            expect(item).not.toBeNull()
            expect(item.tags).toEqual(additionalData.tags)
            expect(item.subcategory).toBe(additionalData.subcategory)
            expect(item.description).toBe(additionalData.description)
            expect(item.color).toBe(additionalData.color)
        })
    })

    describe('if create items request is not correct', () => {
        it('should not create item without authorized user', async () => {
            await request(server).post('/api/items')
                .send(createItem)
                .expect(UNAUTHORIZED)
        })

        it('should not create item without necessary data', async () => {
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    name: ''
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    group: ''
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    category: ''
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    price: ''
                })
                .expect(BAD_REQUEST)
        })

        it('should not create item with incorrect data', async () => {
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    group: 'group'
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    category: 'category'
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    subcategory: 'subcategory'
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    name: 'a'
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    category: 'a'.repeat(101)
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    price: 0.99
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    price: 10001
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    description: 'a'.repeat(1001)
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    color: 'bl4ck'
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    tags: []
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    ...createItem,
                    tags: 'tags'
                })
                .expect(BAD_REQUEST)
        })
    })
    describe('if update item request is correct', () => {
            it('should update an item', async () => {
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        name: 'update'
                    })
                    .expect(OK)
                const item = await Item.findOne({ name: 'update' })
                expect(item).not.toBeNull()
            })
    })

    describe('if update item request is not correct', () => {
            it('should not update if user is not the seller', async () => {
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userTwoToken}`)
                    .send({
                        name: 'update'
                    })
                    .expect(UNAUTHORIZED)
            })

            it('should not be able to update if item is already sold', async () => {
                await request(server).patch(`/api/items/${itemSoldID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        name: 'update'
                    })
                    .expect(UNAUTHORIZED)
            })

            it('should not update if no item exists', async () => {
                await request(server).patch(`/api/items/${fakeID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        name: 'update'
                    })
                    .expect(BAD_REQUEST)
            })

            it('should not update without any data', async () => {
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send()
                    .expect(OK)
            })

            it('should not update with invalid data', async () => {
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        name: 'a'.repeat(101)
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        description: 'a'.repeat(1001)
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        group: 'group'
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        category: 'category'
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        subcategory: 'subcategory'
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        color: 'color'
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        price: 10001
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        price: -1
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        price: 10001
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        tags: 'tags'
                    })
                    .expect(BAD_REQUEST)
                
                await request(server).patch(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send({
                        tags: []
                    })
                    .expect(BAD_REQUEST)
            })
    })

    describe('if delete item request is correct', () => {
            it('should delete item', async () => {
                await request(server).delete(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send()
                    .expect(OK)
                const item = await Item.findById(itemOneID)
                expect(item).toBeNull()
            })
    })

    describe('if delete item request is not correct', () => {
            it('should note delete if user is not the seller', async () => {
                await request(server).delete(`/api/items/${itemOneID}`)
                    .set('Authorization', `Bearer ${userTwoToken}`)
                    .send()
                    .expect(UNAUTHORIZED)
            })

            it('should not delete if item is already sold', async () => {
                await request(server).delete(`/api/items/${itemSoldID}`)
                    .set('Authorization', `Bearer ${userTwoToken}`)
                    .send()
                    .expect(BAD_REQUEST)
            })

            it('should not delete with an incorrect id', async () => {
                await request(server).delete(`/api/items/${fakeID}`)
                    .set('Authorization', `Bearer ${userTwoToken}`)
                    .send()
                    .expect(BAD_REQUEST)
            })
    })
    
    describe('if get item request is correct', () => {
        it('should return an item', async () => {
            const res = await request(server).get(`/api/items/${itemOneID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.item.name).toEqual(itemOne.name)
        })
    })

    describe('if get item request is not correct', () => {
        it('should not return item without autenticated user', async () => {
            await request(server).get(`/api/items/${itemOneID}`)
                .send()
                .expect(UNAUTHORIZED)
        })
        it('should nothing if no item exists with that id', async () => {
            await request(server).get(`/api/items/${fakeID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if get items request is correct', () => {
        it('should return items, page and limit', async () => {
            const res = await request(server).get('/api/items')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items, page, limit } = res.body
            expect(items.length).toBe(4)
            expect(page).toBe(1)
            expect(limit).toBe(5)
        })

        it('should be able to set page and limit', async () => {
            const res = await request(server).get('/api/items?limit=2&page=2')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items, page, limit } = res.body
            expect(items.length).toBe(2)
            expect(page).toBe(2)
            expect(limit).toBe(2)
        })

        it('should be able to search on group', async () => {
            const res = await request(server).get('/api/items?group=men')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items } = res.body
            expect(items.length).toBe(2)
        })

        it('should be able to search on category', async () => {
            const res = await request(server).get('/api/items?category=shoes')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items } = res.body
            expect(items.length).toBe(1)
        })

        it('should be able to search on subcategory', async () => {
            const res = await request(server).get('/api/items?subcategory=boots')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items } = res.body
            expect(items.length).toBe(1)
        })


        it('should be able to search on colors', async () => {
            const res = await request(server).get('/api/items?colors=black&colors=white')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items } = res.body
            expect(items.length).toBe(2)
        })

        it('should be able to query on name, description and tags', async () => {
            const one = await request(server).get('/api/items?q=one')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items: itemsOne } = one.body
            expect(itemsOne.length).toBe(1)

            const two = await request(server).get('/api/items?q=description')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items: itemsTwo } = two.body
            expect(itemsTwo.length).toBe(1)

            const three = await request(server).get('/api/items?q=summer')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items: itemsThree } = three.body
            expect(itemsThree.length).toBe(1)
        })

        it('should be able to query on price', async () => {
            const res = await request(server).get('/api/items?price[gt]=200')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { items } = res.body
            expect(items.length).toBe(2)
        })

        it('should be able to sort on price and name and to switch direction', async () => {
            const asc = await request(server).get('/api/items?sortBy=price')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(asc.body.items[0].price).toBe(50)

            const desc = await request(server).get('/api/items?sortBy=price&direction=desc')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(desc.body.items[0].price).toBe(500)

            const res = await request(server).get('/api/items?sortBy=name')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.items[0].name).toBe(itemFour.name)
        })

        it('should be able to combine query parameters', async () => {
            const res = await request(server).get(`/api/items?group=${itemOne.group}&category=${itemOne.category}&price[gte]=${itemOne.price}&q=${itemOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.items.length).toBe(1)
            expect(res.body.items[0].name).toBe(itemOne.name)
        })
    })

    describe('if get items request is not correct', () => {
        it('should not return items without authorized user', async () => {
            await request(server).get('/api/items')
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should not be allowed to search on incorrect request', async () => {
            await request(server).get('/api/items?group=group')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            await request(server).get('/api/items?category=category')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            await request(server).get('/api/items?subcategory=subcategory')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            await request(server).get('/api/items?colors=colors')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            await request(server).get('/api/items?colors=color&colors=colors')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('should reset incorrect page and limit requests', async () => {
            const res = await request(server).get('/api/items?page=-1&limit=-1')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
            const { limit, page } = res.body
            expect(limit).toBe(5)
            expect(page).toBe(1)

            const resTwo = await request(server).get('/api/items?page=100&limit=2')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
            const { page: pageTwo } = resTwo.body
            expect(pageTwo).toBe(2)
        })

        it('should not be able search on invalid price values', async () => {
            await request(server).get('/api/items?price[gt]=-1')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                
            await request(server).get('/api/items?price[gt]=10001')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            await request(server).get('/api/items?price[QDFD]=-1')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })
})