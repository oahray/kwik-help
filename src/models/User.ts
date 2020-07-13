import { Schema, Document, Model, model } from 'mongoose';
import * as jwt from 'jsonwebtoken';

import { ITicket } from './Ticket';
import { JWT_SECRET } from '../constants';
import { hashString, compareStringWithHash } from '../utils/bcrypt';
import { serializeUser } from '../serializers';

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  agent: { type: Boolean, default: false },
  tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }]
}, { timestamps: true })

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  admin: boolean;
  agent: boolean;
  tickets: ITicket[];
  createdAt: Date;

  // User document methods
  generateJWT(): string;
  isAgentOrAdmin(): boolean;
  isPasswordMatch(password: string): Promise<boolean>;
}


userSchema.pre<IUser>("save", async function(next) {
  if (this.isModified("password")) {
    this.password = await hashString(this.password);
  }
  next();
});

userSchema.methods.isPasswordMatch = async function(password: string) {
  return await compareStringWithHash(password, this.password);
};

userSchema.methods.toJSON = function() {
  return serializeUser(this);
};

userSchema.methods.generateJWT = function() {
  const access = 'auth';
  return jwt.sign({ _id: this._id, access },
    JWT_SECRET, { expiresIn: 24 * 60 * 60 }).toString();
}

userSchema.methods.isAgentOrAdmin = function() {
  return (this.admin === true || this.agent === true);
}

userSchema.methods.grantAgentRole = async function() {
  this.agent = true;
  return await this.save();
}

userSchema.methods.revokeAgentRole = async function() {
  this.agent = false;
  return await this.save();
}

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
