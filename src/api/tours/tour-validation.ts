import { Joi } from 'express-validation';

const tourValidation = {
  body: Joi.object({
    title: Joi.string(),
    summary: Joi.string(),
    description: Joi.string(),
    video: Joi.string(),
    image: Joi.string(),
    meetingPoint: Joi.string(),
    price: Joi.number(),
    date: Joi.date(),
    category: Joi.string(),
    assistants: Joi.array(),
    creator: Joi.string(),
  }),
};

export default tourValidation;
