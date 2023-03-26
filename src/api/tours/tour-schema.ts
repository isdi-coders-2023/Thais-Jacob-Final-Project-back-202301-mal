import mongoose, { Schema } from 'mongoose';
import { User } from '../users/user-schema';

export interface Tour {
  title: string;
  summary: string;
  description: string;
  video: string;
  image: string;
  meetingPoint: string;
  price: number;
  date: Date;
  category: string;
  assistants: User[];
  creator: User;
}

const tourSchema = new Schema<Tour>({
  title: String,
  summary: String,
  description: String,
  video: String,
  image: String,
  meetingPoint: String,
  price: Number,
  date: Date,
  category: String,
  assistants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const TourModel = mongoose.model<Tour>('Tour', tourSchema, 'tours');
