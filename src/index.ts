import express, { Request, Response } from "express";
import mongoose from 'mongoose';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ContentModel, userModel, Tag, LinkModel } from "./db";
import { userSchema } from "./zodSchemas";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";

import { JWT_PASSWORD } from "./config";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

mongoose.connect('mongodb+srv://admin:Rahul%230552@cluster0.ykigmhz.mongodb.net/', {
  dbName: 'second-brain',
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


app.post('/v1/signup', async (req: Request, res: Response): Promise<any> => {
  const parsedUserData = userSchema.safeParse(req.body);
  if (!parsedUserData.success) {
    return res.status(411).json({ errors: parsedUserData.error.errors });
  }

  const { username, password } = parsedUserData.data;

  const userExists = await userModel.findOne({ username });
  if (userExists) {
    return res.status(403).json({ message: 'Username already taken' });
  }

  const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 4096,
    timeCost: 3,
    parallelism: 1
  });
  await userModel.create({ username, password: hashedPassword });

  res.status(201).json({ message: 'User created successfully' });
});


app.post('/v1/signin', async (req: Request, res: Response): Promise<any> => {
  const parsedUserData = userSchema.safeParse(req.body);
  if (!parsedUserData.success) {
    return res.status(411).json({ errors: parsedUserData.error.errors });
  }

  const { username, password } = parsedUserData.data;
  const user = await userModel.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  try {
    if (await argon2.verify(user.password, password)) {
      const token = jwt.sign(
        { username: user.username, id: user._id },
        JWT_PASSWORD
      );
      return res.status(200).json({ message: "Login successful", token });

    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An internal server error occurred" });

  }
})

app.post('/v1/addContent', userMiddleware, async (req: Request, res: Response): Promise<any> => {
  const type = req.body.type;
  const title = req.body.title;
  const link = req.body.link;
  const tagNames = req.body.tags;

  const tagPromises = tagNames.map(async (name: string) => {
    let tag = await Tag.findOne({ name });
    if (!tag) tag = await Tag.create({ name });
    return tag.name;
  });

  const tagIds = await Promise.all(tagPromises);

  if (!type || !title || !link) {
    return res.status(401).json({ message: "Please check your inputs" })
  } else {
    ContentModel.create({
      type: type,
      link: link,
      title: title,
      tags: tagIds,
      //@ts-ignore
      userId: req.userId
    })
    return res.status(200).json({ message: "Content added succesfully" })
  }
})

app.get('/v1/content', userMiddleware, async (req: Request, res: Response,) => {

  //@ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId
  }).populate("userId", "username")

  res.json({
    content
  })

})

app.delete('/v1/delete', userMiddleware, async (req: Request, res: Response): Promise<any> => {
  const contentId = req.body.contentId;

  if (!contentId) {
    return res.status(400).json({ message: "contentId is required" });
  }

  try {
    const result = await ContentModel.deleteOne({
      _id: contentId,
      //@ts-ignore
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Content not found or not authorized" });
    }

    return res.status(200).json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});




app.post("/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;
  if (share) {
    const existingLink = await LinkModel.findOne({
      userId: req.userId
    });

    if (existingLink) {
      res.json({
        hash: existingLink.hash
      })
      return;
    }
    const hash = random(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash
    })

    res.json({
      hash
    })
  } else {
    await LinkModel.deleteOne({
      userId: req.userId
    });

    res.json({
      message: "Removed link"
    })
  }
})

app.get("/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input"
    })
    return;
  }
  // userId
  const content = await ContentModel.find({
    userId: link.userId
  })

  console.log(link);
  const user = await userModel.findOne({
    _id: link.userId
  })

  if (!user) {
    res.status(411).json({
      message: "user not found"
    })
    return;
  }

  res.json({
    username: user.username,
    content: content
  })

})



app.listen(PORT, () => {
  console.log(`running http://localhost:${PORT}`);
});





