import { UserLocalsAuthInfo } from '../../types/models.js';
import { Tour, TourModel } from './tour-schema.js';
import { TourRequest } from '../../types/models.js';
import { UserModel } from '../users/user-schema.js';
import { supabase, TOURS_BUCKET_NAME } from '../../database/supabase.js';
import log from '../../logger.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { RequestHandler } from 'express';

export const createTourController: RequestHandler<
  unknown,
  Tour,
  TourRequest,
  unknown,
  UserLocalsAuthInfo
> = async (req, res, next) => {
  const { email } = res.locals;

  log.info('email ', email);

  const creatorUser = await UserModel.findOne(
    { email },
    { password: 0, __v: 0 },
  ).exec();

  log.info('creatorUser: ', creatorUser);

  if (creatorUser === null) {
    return next(new CustomHTTPError(404, 'User is not found'));
  }

  const newTour: Tour = { ...req.body, assistants: [], creator: creatorUser };

  const fileBuffer = req.file?.buffer;

  const fileName = `TourImage-${email}-${Date.now()}-${req.file?.originalname}`;

  if (fileBuffer !== undefined) {
    const { error } = await supabase.storage
      .from(TOURS_BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        upsert: true,
      });

    if (error === null) {
      const { data } = supabase.storage
        .from(TOURS_BUCKET_NAME)
        .getPublicUrl(fileName);
      newTour.image = data.publicUrl;

      log.info('Public URL generated', data.publicUrl);
    }
  }

  const dbRes = await TourModel.create(newTour);

  log.info('Tour successfully created');

  if (dbRes !== null) {
    res.sendStatus(201);
  }
};
