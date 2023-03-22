import { Tour } from '../api/tours/tour-schema.js';
import { User } from '../api/users/user-schema.js';

export interface UserLocalsAuthInfo {
  email: string;
}
export interface LoginResponse {
  accessToken: string;
}

export type LoginRequest = Pick<User, 'email' | 'password'>;

export type RegisterRequest = Pick<User, 'name' | 'email' | 'password'>;

export type TourRequest = Omit<Tour, 'assistants' | 'creator'>;
