import { UserModel } from '../users/user-schema.js';
import { Request, Response } from 'express';
import { loginUserController } from './auth-controllers.js';
import dotenv from 'dotenv';
dotenv.config();
import { generateJWTToken } from './auth-utils.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';

describe('Given a loginUserController', () => {
  const request = {
    body: {
      email: 'test@gmail.com',
      password: 'test1234',
    },
  } as Partial<Request>;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as Partial<Response>;

  const next = jest.fn();

  const tokenJWT = {
    accessToken: generateJWTToken(request.body.email),
  };

  test('When the user tries to login and the response is successful, a token is returned', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    await loginUserController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(tokenJWT);
  });

  test('When the user tries to login and the user is not found, a 404 is returned', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    await loginUserController(request as Request, response as Response, next);
    expect(next).toHaveBeenCalledWith(
      new CustomHTTPError(404, 'User or password does not exists'),
    );
  });
});
