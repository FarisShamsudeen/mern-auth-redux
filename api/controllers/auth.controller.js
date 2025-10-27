import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const createTokenAndRespond = (res, userDoc) => {
  const token = jwt.sign(
    { id: userDoc._id, isAdmin: userDoc.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const { password, ...rest } = userDoc;
  const expiryDate = new Date(Date.now() + 3600000); // 1 hour
  res.cookie('access_token', token, {
    httpOnly: true,
    expires: expiryDate,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }).status(200).json(rest);
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return next(errorHandler(400, "All fields are required"));

    if (!username.trim() || /\s/.test(username))
      return next(errorHandler(400, "Username cannot contain spaces"));

    if (!password.trim() || /\s/.test(password))
      return next(errorHandler(400, "Password cannot contain spaces"));

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return next(errorHandler(409, "Email already in use"));

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return next(errorHandler(409, "Username already in use"));

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(errorHandler(400, "Email and password required"));

    if (!password.trim() || /\s/.test(password))
      return next(errorHandler(400, "Password cannot contain spaces"));

    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Invalid credentials"));

    createTokenAndRespond(res, validUser._doc);
  } catch (err) {
    next(err);
  }
};

export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;
    if (!email) return next(errorHandler(400, "Email required"));

    let user = await User.findOne({ email });
    if (user) {
      createTokenAndRespond(res, user._doc);
      return;
    }

    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
    const username = (name || email.split('@')[0]).split(" ").join("").toLowerCase() + Math.floor(Math.random() * 10000).toString();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture: photo || ''
    });
    await newUser.save();

    createTokenAndRespond(res, newUser._doc);
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json({ message: 'Signout success!' });
};

