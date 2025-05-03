"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const zodSchemas_1 = require("./zodSchemas");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
mongoose_1.default.connect('mongodb+srv://admin:Rahul%230552@cluster0.ykigmhz.mongodb.net/', {
    dbName: 'second-brain',
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
app.post('/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedUserData = zodSchemas_1.userSchema.safeParse(req.body);
    if (!parsedUserData.success) {
        return res.status(411).json({ errors: parsedUserData.error.errors });
    }
    const { username, password } = parsedUserData.data;
    const userExists = yield db_1.userModel.findOne({ username });
    if (userExists) {
        return res.status(403).json({ message: 'Username already taken' });
    }
    const hashedPassword = yield argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id,
        memoryCost: 4096,
        timeCost: 3,
        parallelism: 1
    });
    yield db_1.userModel.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully' });
}));
app.post('/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedUserData = zodSchemas_1.userSchema.safeParse(req.body);
    if (!parsedUserData.success) {
        return res.status(411).json({ errors: parsedUserData.error.errors });
    }
    const { username, password } = parsedUserData.data;
    const user = yield db_1.userModel.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    try {
        if (yield argon2_1.default.verify(user.password, password)) {
            const token = jsonwebtoken_1.default.sign({ username: user.username, id: user._id }, "8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb");
            return res.status(200).json({ message: "Login successful", token });
        }
        else {
            return res.status(401).json({ message: "Invalid username or password" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
}));
app.post('/v1/addContent', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const title = req.body.title;
    const link = req.body.link;
    const tagNames = req.body.tags;
    const tagPromises = tagNames.map((name) => __awaiter(void 0, void 0, void 0, function* () {
        let tag = yield db_1.Tag.findOne({ name });
        if (!tag)
            tag = yield db_1.Tag.create({ name });
        return tag.name;
    }));
    const tagIds = yield Promise.all(tagPromises);
    if (!type || !title || !link) {
        return res.status(401).json({ message: "Please check your inputs" });
    }
    else {
        db_1.ContentModel.create({
            type: type,
            link: link,
            title: title,
            tags: tagIds,
            //@ts-ignore
            userId: req.userId
        });
        return res.status(200).json({ message: "Content added succesfully" });
    }
}));
app.get('/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    });
}));
app.delete('/v1/delete', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    if (!contentId) {
        return res.status(400).json({ message: "contentId is required" });
    }
    try {
        const result = yield db_1.ContentModel.deleteOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId
        });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Content not found or not authorized" });
        }
        return res.status(200).json({ message: "Deleted Successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
app.listen(PORT, () => {
    console.log(`running http://localhost:${PORT}`);
});
