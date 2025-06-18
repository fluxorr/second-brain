"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.Tag = exports.ContentModel = exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
exports.userModel = (0, mongoose_1.model)("User", userSchema);
const contentTypes = ['image', 'video', 'article', 'audio'];
const contentSchema = new mongoose_1.Schema({
    link: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    tags: [{ type: mongoose_1.Types.ObjectId, ref: 'Tag' }],
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
});
exports.ContentModel = (0, mongoose_1.model)("Content", contentSchema);
const tagSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true }
});
exports.Tag = (0, mongoose_1.model)('Tag', tagSchema);
const LinkSchema = new mongoose_1.Schema({
    hash: String,
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, unique: true },
});
exports.LinkModel = (0, mongoose_1.model)("Links", LinkSchema);
