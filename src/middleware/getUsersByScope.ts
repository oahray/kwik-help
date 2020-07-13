import { RequestHandler } from 'express';

import User from '../models/User';

export const setUsersByScope: RequestHandler = async (req, res, next) => {
  const scope = req.query.scope?.toString()?.toLowerCase();
  /**
   * Use a fall-through switch statement so we can check
   * for multiple cases for customer and agent scopes.
   * This would allow users a range of choices that could
   * be singular or plural, if they like.
   */
  switch(scope) {
    case 'admin':
      res.locals.users = await User.find({ admin: true });
      break
    // agent would fall through to agents
    case 'agent':
    case 'agents':
      res.locals.users = await User.find({ agent: true });
      break
    // customer would fall through to customers
    case 'customer':
    case 'customers':
      res.locals.users = await User.find({ admin: false, agent: false });
      break
    default:
      res.locals.users = await User.find();
  }

  next();
}
