import { RequestHandler } from 'express';

import Ticket from '../models/Ticket';
import Comment from '../models/Comment';
import { permittedParams } from '../utils/permittedParams';
import { ticketsToCsv } from '../utils/ticketToCsv'
import {
  PERMITTED_TICKET_PARAMS,
  PERMITTED_COMMENT_PARAMS
} from '../constants/permittedParams'


export const createTicket: RequestHandler = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const ticketParams = permittedParams(req.body, PERMITTED_TICKET_PARAMS);

  ticketParams.creator = currentUser._id;
  const ticket = await new Ticket(ticketParams).save();

  currentUser.tickets.push({ _id: ticket._id });
  await currentUser.save()

  res.status(201).send(ticket);
}

export const getUserTickets: RequestHandler = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const tickets = await Ticket.find({ creator: currentUser._id});

  res.status(200).send(tickets);
}

export const getTicket: RequestHandler = async (req, res) => {
  const ticket = res.locals.ticket;

  res.send(ticket);
}

export const processTicket: RequestHandler = async (req, res) => {
  const { ticket, currentUser } = res.locals;

  if (ticket.isClosed()) {
    res.status(400).send({
      object: 'error',
      message: 'you cannot process a closed ticket'
    })
  } else if (ticket.isProcessing()) {
    res.status(400).send({
      object: 'error',
      message: 'ticket is already processing'
    })
  } else {
    const pendingTicket = await ticket.process(currentUser);
    res.status(200).send(pendingTicket);
  }
}

export const closeTicket: RequestHandler = async (req, res) => {
  const { ticket, currentUser } = res.locals;

  if (ticket.isClosed()) {
    res.status(400).send({
      object: 'error',
      message: 'ticket is already closed'
    })
  } else if (ticket.isOpen()) {
    res.status(400).send({
      object: 'error',
      message: 'ticket must be processed first before being closed'
    })
  } else {
    const closedTicket = await ticket.close(currentUser);
    res.status(200).send(closedTicket);
  }
}

export const resetTicket: RequestHandler = async (req, res) => {
  const ticket = res.locals.ticket;

  if (ticket.isOpen()) {
    res.status(400).send({
      object: 'error',
      message: 'ticket is still open'
    })
  } else {
    const pendingTicket = await ticket.reset();
    res.status(200).send(pendingTicket)
  }
}

export const deleteTicket: RequestHandler = async (req, res) => {
  const ticket = res.locals.ticket;

  const result = await Ticket.findByIdAndDelete(ticket.id)

  res.status(200).send(result);
}

export const createComment: RequestHandler = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const ticket = res.locals.ticket;

  if (!ticket.userCanComment(currentUser)) {
    return res.status(403).send({
      object: 'error',
      message: 'you cannot comment on this ticket until an agent first comments'
    })
  }

  const commentParams = permittedParams(req.body, PERMITTED_COMMENT_PARAMS);
  commentParams.ticket = ticket._id;
  commentParams.createdBy = currentUser._id;

  const comment = await new Comment(commentParams).save();
  ticket.comments.push(comment);
  await ticket.save();

  res.status(201).send(comment);
}

export const getComments: RequestHandler = async (req, res) => {
  const ticket = res.locals.ticket;
  const comments = ticket.comments;

  res.status(200).send(comments)
}

export const getReport: RequestHandler = async (req, res) => {
  const tickets = res.locals.reportTickets;
  res.send(tickets);
}

export const downloadReport: RequestHandler = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const tickets = res.locals.reportTickets;

  if (tickets.length < 1) {
    return res.status(404).send({
      object: 'error',
      message: 'no ticket data to download'
    })
  }

  const csv = await ticketsToCsv(tickets, currentUser);
  const title = 'Report-' + Date.now().toString() + '.csv';

  res.header('Content-Type', 'text/csv')
    .attachment(title)
    .send(csv);
}
