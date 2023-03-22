import { UserModel } from '../../users/user-schema.js';
import { Request, Response } from 'express';
import {
  loginUserController,
  registerUserController,
} from '../auth-controllers.js';
import dotenv from 'dotenv';
dotenv.config();

import { encryptPassword, generateJWTToken } from '../auth-utils.js';

import { CustomHTTPError } from '../../../utils/custom-http-error.js';

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

describe('Given a registerUserController', () => {
  const request = {
    body: {
      name: 'Test name',
      email: 'testregister@gmail.com',
      password: 'test1234',
    },
  } as Partial<Request>;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  } as Partial<Response>;

  const newUser = { ...request.body, password: encryptPassword('test1234') };

  describe('When a user wants to register with a correct data', () => {
    test('Then the user will be registered', async () => {
      UserModel.create = jest.fn();
      UserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await registerUserController(
        request as Request,
        response as Response,
        jest.fn(),
      );

      expect(response.status).toHaveBeenCalledWith(201);
      expect(UserModel.create).toHaveBeenCalledWith(newUser);
    });
  });

  describe('When the user already exists', () => {
    test('Then you should receive a 409 error', async () => {
      UserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(1),
      }));
      const next = jest.fn();
      await registerUserController(
        request as Request,
        response as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new CustomHTTPError(
          409,
          'A user with this email address is already registered',
        ),
      );
    });
  });
});
