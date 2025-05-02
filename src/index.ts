import express, {Request, Response, NextFunction, raw} from "express";
import mongoose from 'mongoose';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { userModel } from "./db";
import { userSchema } from "./zodSchemas";



const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect('mongodb+srv://admin:Rahul%230552@cluster0.ykigmhz.mongodb.net/', {
  dbName: 'second-brain',
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


app.post('/v1/signup', async (req: Request,res: Response): Promise<any> => {
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


app.post('/v1/signin', async(req: Request, res: Response): Promise<any> => {
  const parsedUserData = userSchema.safeParse(req.body);
  if (!parsedUserData.success) {
    return res.status(411).json({ errors: parsedUserData.error.errors });
  }

  const { username, password } = parsedUserData.data;
  const user = await userModel.findOne({username});
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  try {
    if (await argon2.verify( user.password , password)) {
      const token = jwt.sign(
        { username: user.username, id: user._id },
        "8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb"
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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




