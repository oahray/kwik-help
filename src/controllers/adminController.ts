import { RequestHandler } from 'express';

export const getUsers: RequestHandler = async (req, res) => {
  const users = res.locals.users;

  res.status(200).send(users);
}

export const getUser: RequestHandler = async (req, res) => {
  const user = res.locals.requestedUser;

  res.send(user);
}

export const promoteToAgent: RequestHandler = async (req, res) => {
  const user = res.locals.requestedUser;

  if (user.agent) {
    return res.status(409).send({
      object: 'error',
      message: 'specified user is already an agent'
    });
  } else {
    const promotedUser = await user.grantAgentRole();
    res.send(promotedUser);
  }
}

export const demoteAgent: RequestHandler = async (req, res) => {
  const user = res.locals.requestedUser;

  if (!user.agent) {
    return res.status(409).send({
      object: 'error',
      message: 'specified user is not an agent'
    });
  } else {
    const demotedUser = await user.revokeAgentRole();
    return res.status(200).send(demotedUser);
  }
}
