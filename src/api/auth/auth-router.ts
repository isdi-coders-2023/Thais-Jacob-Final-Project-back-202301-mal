import express from 'express';
import { validate } from 'express-validation';
import {
  loginUserController,
  registerUserController,
} from './auth-controllers.js';
import { authValidation } from './auth-validation.js';

const authRouter = express.Router();

authRouter.use(validate(authValidation));

authRouter.route('/register').post(registerUserController);
authRouter.route('/login').post(loginUserController);

export default authRouter;
