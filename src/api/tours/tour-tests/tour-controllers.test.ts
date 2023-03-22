import { Request, Response } from 'express';
import { Tour, TourModel } from '../tour-schema';
import { TourRequest, UserLocalsAuthInfo } from '../../../types/models';
import { createTourController } from '../tour-controllers';
import { UserModel } from '../../users/user-schema';
import { CustomHTTPError } from '../../../utils/custom-http-error';

jest.mock('@supabase/supabase-js', () => {
  const data = {
    publicUrl: 'https://example.com/photo.webp',
  };
  return {
    createClient: jest.fn().mockImplementation(() => ({
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            error: null,
            data: {
              ...data,
            },
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            error: null,
            data: {
              ...data,
            },
          }),
        }),
      },
    })),
  };
});

describe('Given a createTourController to create an tour', () => {
  const mockDate = new Date('2020-01-01');

  const validMockRequest = {
    body: {
      tittle: 'Test Tour',
      description: 'This is a test tour',
      summary: 'Summary test',
      video: 'http video test',
      meetingPoint: 'meeting test',
      date: mockDate,
      image: 'image test',
      price: 100,
      category: 'category test',
    },
    file: {
      buffer: Buffer.from('mockBuffer'),
      originalname: 'mockOriginalname',
    },
  } as Partial<Request>;

  const mockResponse = {
    json: jest.fn(),
    sendStatus: jest.fn().mockReturnThis(),
    locals: { email: 'thais@gmail.com' },
  } as Partial<Response<Tour | { message: string }, UserLocalsAuthInfo>>;

  const next = jest.fn();

  const tour = {
    tittle: 'Test Tour',
    description: 'This is a test tour',
    summary: 'Summary test',
    video: 'http video test',
    meetingPoint: 'meeting test',
    date: mockDate,
    image: 'image test',
    price: 100,
    category: 'category test',
  };

  TourModel.create = jest.fn().mockResolvedValue(tour);
  UserModel.findOne = jest.fn().mockResolvedValue(tour);

  test('when the user tries to create an tour with an image, it should return a 201 status', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));

    await createTourController(
      validMockRequest as Request<
        unknown,
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<Tour | { message: string }, UserLocalsAuthInfo>,
      next,
    );
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(201);
  });

  test('when it tries to search for a creator user and does not find one, then it gives a 404 error', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    await createTourController(
      validMockRequest as Request<
        unknown,
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<Tour | { message: string }, UserLocalsAuthInfo>,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new CustomHTTPError(404, 'User is not found'),
    );
  });
});