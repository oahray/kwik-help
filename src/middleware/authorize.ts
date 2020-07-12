import { RequestHandler } from 'express';

export const authorizeAdmin: RequestHandler = (req, res, next) => {
  const user = res.locals.currentUser;

  if (!user.admin) {
    return res.status(403).send({
      object: 'error',
      message: 'insufficient permissions to perform this action'
    })
  }

  next();
}

export const authorizeAgent: RequestHandler = (req, res, next) => {
  const user = res.locals.currentUser;

  if (!user.isAgentOrAdmin()) {
    return res.status(403).send({
      object: 'error',
      message: 'insufficient permissions to perform this action'
    })
  }

  next();
}

export const excludeAdminTarget: RequestHandler = (req, res, next) => {
  const user = res.locals.requestedUser;

  if (user.admin) {
    return res.status(409).send({
      object: 'error',
      message: 'specified user is an admin'
    });
  }

  next();
}

