import { RequestHandler } from 'express';
import { AuthRequest, LoginResponse } from '../../types/auth-types.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { UserModel } from '../users/user-schema.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const loginUserController: RequestHandler<
  unknown,
  LoginResponse | { message: string },
  AuthRequest
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
