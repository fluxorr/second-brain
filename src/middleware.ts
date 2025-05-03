import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
const JWT_SECRET = "8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb"

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_SECRET)
    if (decoded) {
        //@ts-ignore
        req.userId = decoded.id;
        //@ts-ignore
        console.log("Decoded token userId:", decoded.userId);
        next();
    } else {
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}