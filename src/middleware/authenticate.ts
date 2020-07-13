import { Request, Response, NextFunction} from 'express';
import * as jwt from 'jsonwebtoken';

import User from '../models/User'
import { JWT_SECRET } from '../constants'

export default (req: Request, res: Response, next: NextFunction): unknown => {
  const bearerHeader = req.headers['authorization'];
  const token = bearerHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).send({
      object: 'error',
      message: 'You need to signup or login first'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: Record<string, unknown>) => {
    if (err) {
      return res.status(401).send({
        object: 'error',
        message: 'Invalid authentication. Please signin or signup'
      });
    }

    User.findById(decoded._id).then((user) => {
      if (!user) {
        return res.status(401).send({
          object: 'error',
          message: 'You could not be verifed. Signup or login first'
        });
      }
      res.locals.currentUser = user;
      next();
    });
  });
}
