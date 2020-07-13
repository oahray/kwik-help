import { Schema, Document, Model, model} from 'mongoose';

import { IUser } from './User';
import { ITicket } from './Ticket'
import { serializeComment } from '../serializers';

const commentSchema: Schema = new Schema({
  body: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true},
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true},
}, { timestamps: true })

export interface IComment extends Document {
  body: string;
  createdBy: IUser;
  ticket: ITicket;
  createdAt: Date;
}

commentSchema.methods.toJSON = function() {
  return serializeComment(this);
}

const Comment: Model<IComment> = model<IComment>('Comment', commentSchema);

export default Comment;
