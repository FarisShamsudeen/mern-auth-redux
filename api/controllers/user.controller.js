import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';

export const test = (req, res) => {
  res.json({
    message: "API is perfect! (From controller)",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return next(errorHandler(401, 'You can update only your account!'));
  }

  try {
    const updateFields = {};

    if (req.body.username && (!req.body.username.trim() || /\s/.test(req.body.username)))
      return next(errorHandler(400, "Username cannot contain spaces"));

    if (req.body.password && (!req.body.password.trim() || /\s/.test(req.body.password)))
      return next(errorHandler(400, "Password cannot contain spaces"));

    if (req.body.username) updateFields.username = req.body.username;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.profilePicture) updateFields.profilePicture = req.body.profilePicture;
    if (req.body.password) updateFields.password = bcryptjs.hashSync(req.body.password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) return next(errorHandler(404, "User not found"));

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return next(errorHandler(401, 'You can only delete your account!'));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User has been deleted...' });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const filter = q
      ? {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }
      : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, isAdmin = false, profilePicture = '' } = req.body;
    if (!username || !email || !password) return next(errorHandler(400, "username, email and password required"));

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return next(errorHandler(409, "User with same email or username exists"));

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, isAdmin, profilePicture });
    await newUser.save();
    const { password: pw, ...rest } = newUser._doc;
    res.status(201).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(errorHandler(404, "User not found"));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

