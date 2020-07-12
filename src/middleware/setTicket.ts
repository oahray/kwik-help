import { RequestHandler } from 'express';

import Ticket from '../models/Ticket';

export const setTicket: RequestHandler = async (req, res, next) => {
  const currentUser = res.locals.currentUser;
  const ticketConstraints: Record<string, unknown> = {
    _id: req.params.id
  }

  if (!currentUser.isAgentOrAdmin()) {
    ticketConstraints.creator = currentUser._id;
  }

  const ticket = await Ticket.findOne(ticketConstraints)
    .populate('comments');

  if (!ticket) {
    return res.status(404).send({
      object: 'ticket',
      message: 'ticket not found'
    })
  }

  res.locals.ticket = ticket;
  next();
};
