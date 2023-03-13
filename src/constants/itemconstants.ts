import { IItem } from "../models/Item";

export enum Subcategory {
    shorts = 'shorts',
    trousers = 'trousers',
    skirt = 'skirt',
    shirts = 'shirts',
    costume = 'costume',
    socks = 'socks',
    underwear = 'underwear',
    sports = 'sports',
    boys = 'boys',
    girls = 'girls',
    sweaters = 'sweaters',
    dress = 'dress',
    jeans = 'jeans',
    sneakers = 'sneakers',
    sandals = 'sandals',
    boots = 'boots',
}

export enum Color {
    red = 'red',
    blue = 'blue',
    green = 'green',
    yellow = 'yellow',
    black = 'black',
    orange = 'orange',
    white = 'white',
    purple = 'purple',
    pink = 'pink'
}
  
export enum Group {
    men = 'men',
    women = 'women',
    kids = 'kids'
}

export enum Category {
    clothes = 'clothes',
    shoes = 'shoes'
}

export interface CreateItemBody {
    name: string;
    group: Group;
    category: Category;
    subcategory?: Subcategory;
    color?: Color;
    price: number;
    description?: string;
    tags?: string[];
}

export interface UpdateItemBody {
    name?: string;
    group?: Group;
    category?: Category;
    subcategory?: Subcategory;
    color?: Color;
    price?: number;
    description?: string;
    tags?: string[];
}

export interface PriceQuery {
    [key: string]: string | number;
}
export interface HandlePriceQuery {
    [key: string]: number;
}

export interface GetItemsQuery {
    q?: string;
    group?: Group;
    category?: Category;
    subcategory?: Subcategory;
    colors?: string | string[];
    price?: PriceQuery;
    direction?: string;
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
}

export interface GetItemsResults {
    items: IItem[];
    limit: number;
    page: number;
    totalItems: number;
}