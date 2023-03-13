import { IUser } from "../models/User";

export interface IQuery {
    q?: string;
    limit?: number | string;
    skip?: number | string;
    page?: number | string;
}

export interface IQueryObj {
    name?: Object
}

export interface IUsersQuery {
    users: IUser[];
    limit: number;
    page: number;
}
