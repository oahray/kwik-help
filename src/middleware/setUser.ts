import { RequestHandler } from 'express';

import User from '../models/User';

export const setUser: RequestHandler = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).send({
      object: 'error',
      message: 'user not found'
    });
  }

  res.locals.requestedUser = user;
  next()
}
