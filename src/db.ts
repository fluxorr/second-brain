import { model, Schema, Types } from "mongoose";

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})
export const userModel = model("User", userSchema)

const contentTypes = ['image', 'video', 'article', 'audio'];
const contentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    tags: [{ type: Types.ObjectId, ref: 'Tag' }],
    userId: { type: Types.ObjectId, ref: 'User', required: true },
})
export const ContentModel = model("Content", contentSchema)

const tagSchema = new Schema({
    name: { type: String, required: true, unique: true }
});

export const Tag = model('Tag', tagSchema);


