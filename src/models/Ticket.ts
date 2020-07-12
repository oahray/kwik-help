import { Schema, Document, Model, model } from 'mongoose';

import { IUser } from './User';
import { IComment } from './Comment';
import { serializeTicket } from '../serializers';

const ticketSchema: Schema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'processing', 'closed'],
    default: 'open'
  },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  closedAt: Date,
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true })

export interface ITicket extends Document {
  title: string;
  description: string;
  status: string;
  creator: IUser;
  createdAt: Date;
  processedBy: IUser;
  processedAt: Date;
  closedBy: IUser;
  closedAt: Date;
  comments: IComment[];

  // Ticket document methods
  hasComments(): boolean;
  isClosed(): boolean;
  isOpen(): boolean;
  isProcessing(): boolean;
  close(): ITicket;
  process(): ITicket;
  reset(): ITicket;
  userCanComment(user: IUser): boolean;
}

ticketSchema.methods.hasComments = function() {
  return this.comments?.length > 0
}

ticketSchema.methods.isClosed = function() {
  return this.status === 'closed';
}

ticketSchema.methods.isOpen = function() {
  return this.status === 'open';
}

ticketSchema.methods.isProcessing = function() {
  return this.status === 'processing';
}

ticketSchema.methods.close = async function(user: IUser) {
  this.status = 'closed';
  this.closedBy = user;
  this.closedAt = Date.now();

  return await this.save();
}

ticketSchema.methods.process = async function(user: IUser) {
  this.status = 'processing';
  this.processedBy = user;
  this.processedAt = Date.now();

  return await this.save();
}

ticketSchema.methods.reset = async function() {
  this.status = 'open';
  this.closedBy = undefined;
  this.closedAt = undefined;
  this.processedBy = undefined;
  this.processedAt = undefined;

  return await this.save();
}

ticketSchema.methods.toJSON = function() {
  return serializeTicket(this);
}

ticketSchema.methods.userCanComment = function(user) {
  return (this.hasComments() || user.isAgentOrAdmin());
}

const Ticket: Model<ITicket> = model<ITicket>('Ticket', ticketSchema);

export default Ticket;
