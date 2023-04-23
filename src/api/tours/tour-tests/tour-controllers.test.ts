import { Request, Response } from 'express';
import { Tour, TourModel } from '../tour-schema';
import { TourRequest, UserLocalsAuthInfo } from '../../../types/models';
import {
  createTourController,
  deleteTourController,
  getTourByIdController,
  getToursController,
} from '../tour-controllers';
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

const next = jest.fn();

describe('Given a createTourController to create an tour', () => {
  const mockDate = new Date('2020-01-01');

  const validMockRequest = {
    body: {
      title: 'Test Tour',
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

  const tour = {
    title: 'Test Tour',
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

describe('Given a getToursController to create an tour', () => {
  const request = {};
  const response = {
    json: jest.fn(),
    sendStatus: jest.fn().mockReturnThis(),
  } as Partial<Response>;

  const tour = [
    {
      _id: 'random id test',
      title: 'title test',
      summary: 'Summary test.',
      video: 'https://www.youtube.com/test',
      image: 'https://gezblnovnlcdlfebhteu.supabase.co/test.jpg',
      meetingPoint: 'C. Test, s/n',
      price: 10,
      date: '1977-11-07T00:00:00.000Z',
      category: 'test',
      assistants: [],
      creator: 'random id creator',
    },
  ];

  test('when the database response is successfull it, then it should respond with a list of tours', async () => {
    TourModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(tour),
    }));
    await getToursController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.json).toHaveBeenCalledWith({
      tours: tour,
      msg: 'Tours successfully found',
    });
  });

  test('when the database throws an error then it should respond with status 500', async () => {
    TourModel.find = jest.fn();

    await getToursController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('Given a getTourByIdController', () => {
  const mockRequest = {
    params: { _id: 'mockId' },
  } as Partial<Request>;

  const mockResponse = {
    sendStatus: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const tour = [
    {
      _id: 'random id test',
      title: 'title test',
      summary: 'Summary test.',
      video: 'https://www.youtube.com/test',
      image: 'https://gezblnovnlcdlfebhteu.supabase.co/test.jpg',
      meetingPoint: 'C. Test, s/n',
      price: 10,
      date: '1977-11-07T00:00:00.000Z',
      category: 'test',
      assistants: [],
      creator: 'random id creator',
    },
  ];

  test('When the tour does not exist, then it should pass on an error 404', async () => {
    TourModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await getTourByIdController(
      mockRequest as Request<{ _id: string }, Tour | { message: string }>,
      mockResponse as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When an error is throw searching for id, then it should be passed on to be handled', async () => {
    TourModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(null),
    });

    await getTourByIdController(
      mockRequest as Request<{ _id: string }, Tour | { message: string }>,
      mockResponse as Response,
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  test('When the tour exist, then the server should respond with it', async () => {
    TourModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(tour),
    });

    await getTourByIdController(
      mockRequest as Request<{ _id: string }, Tour | { message: string }>,
      mockResponse as Response,
      next,
    );

    expect(mockResponse.json).toHaveBeenCalledWith(tour);
  });
});

describe('Testing deleteTourController to an tour', () => {
  const mockRequest = {
    locals: { email: 'thais@gmail.com', id: '64186d711077a06023a724d9' },
    params: { _id: '64186d711077a06023a724d9' },
  } as Partial<Request | any>;

  const mockResponse = {
    json: jest.fn(),
    locals: { email: 'thais@gmail.com', id: '64186d711077a06023a724d9' },
  } as Partial<Response>;

  const next = jest.fn();

  const mockTour = {
    name: 'mockName',
    surname: 'mockSurname',
    breed: 'mockBreed',
    email: 'mockEmail',
    phone: '611000000',
    city: 'mockCity',
    image: 'https://example.com/photo.webp',
  };
  UserModel.findOne = jest.fn().mockReturnValue(() => ({
    exec: jest.fn().mockResolvedValue(1),
  }));
  test('When the tour does not exist, then it should pass on an error 404', async () => {
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await deleteTourController(
      mockRequest as Request<
        any,
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<Tour | { message: string }, UserLocalsAuthInfo>,
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When an error is throw searching for id, then it should be passed on to be handled', async () => {
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(null),
    });

    await deleteTourController(
      mockRequest as Request<
        { _id: string },
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<Tour | { message: string }, UserLocalsAuthInfo>,
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  test('When the tour exist, then the server should respond with its all ok and delete the tour', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTour),
    });

    await deleteTourController(
      mockRequest as Request<
        { _id: string },
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<any, UserLocalsAuthInfo>,
      next,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(mockTour);
  });
  test('When the tour exist, an tour is found but could not be deleted', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await deleteTourController(
      mockRequest as Request<
        { _id: string },
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<any, UserLocalsAuthInfo>,
      next,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(mockTour);
  });
  test('When the tour exist, then an error is thrown while trying to delete an existing tour', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(null),
    });

    await deleteTourController(
      mockRequest as Request<
        { _id: string },
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<any, UserLocalsAuthInfo>,
      next,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(mockTour);
  });
  test('When the tour exist, but the user is not found then the tour is not deleted', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTour),
    });

    await deleteTourController(
      mockRequest as Request<
        { _id: string },
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<any, UserLocalsAuthInfo>,
      next,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(mockTour);
  });
  test('When the user is not found, then the tour cannot be deleted', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    TourModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    TourModel.findOneAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTour),
    });

    await deleteTourController(
      mockRequest as Request<
        { _id: string },
        Tour,
        TourRequest,
        unknown,
        UserLocalsAuthInfo
      >,
      mockResponse as Response<any, UserLocalsAuthInfo>,
      next,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(mockTour);
  });
});
