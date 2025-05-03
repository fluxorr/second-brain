"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb";
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    const decoded = jsonwebtoken_1.default.verify(header, JWT_SECRET);
    if (decoded) {
        //@ts-ignore
        req.userId = decoded.id;
        //@ts-ignore
        console.log("Decoded token userId:", decoded.userId);
        next();
    }
    else {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
};
exports.userMiddleware = userMiddleware;
