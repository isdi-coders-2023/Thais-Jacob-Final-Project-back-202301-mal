import { RequestHandler } from 'express';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../../types/models.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { User, UserModel } from '../users/user-schema.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const loginUserController: RequestHandler<
  unknown,
  LoginResponse | { message: string },
  LoginRequest
> = async (req, res, next) => {
  const { email, password } = req.body;
  const filterUser = {
    email,
    password: encryptPassword(password),
  };

  const existingUser = await UserModel.findOne(filterUser).exec();

  if (existingUser === null) {
    return next(new CustomHTTPError(404, 'User or password does not exists'));
  }

  const tokenJWT = generateJWTToken(email);
  res.status(201).json({
    accessToken: tokenJWT,
  });
};

export const registerUserController: RequestHandler<
  unknown,
  unknown,
  RegisterRequest
> = async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email }).exec();

  if (existingUser !== null) {
    return next(
      new CustomHTTPError(
        409,
        'A user with this email address is already registered',
      ),
    );
  }

  const newUser: User = {
    name,
    email,
    password: encryptPassword(password),
  };

  await UserModel.create(newUser);

  res.status(201).json({ msg: 'New user successfully created!' });
};
