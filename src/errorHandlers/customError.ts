export interface CustomErrorType extends Error {
    message: string;
    statusCode: number;
}

class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }
}

export default CustomError