import * as moment from 'moment';

import { IUser } from '../../../models/User';
import Ticket, { ITicket } from '../../../models/Ticket';
import Comment from '../../../models/Comment';

const ticketBase = (creator: IUser) => ({
  title: 'Open ticket',
  description: `Open ticket created by ${creator.username}`,
  status: 'open',
  creator,
  processedAt: undefined,
  closedAt: undefined
});

const createTicket = async (ticketDetails, creator: IUser): Promise<ITicket> => {
  const ticket = new Ticket(ticketDetails);
  creator.tickets.push(ticket);

  return ticket;
}

export const buildOpenTicket = async (creator: IUser): Promise<ITicket> => {
  const ticketDetails = ticketBase(creator);

  return await createTicket(ticketDetails, creator);
};

export const buildOpenTicketWithComment = async (creator: IUser, agent: IUser): Promise<ITicket> => {
  const ticketDetails = ticketBase(creator);
  const ticket =  await createTicket(ticketDetails, creator);

  const commentDetails = {
    body: `Some comment by ${agent.username}`,
    ticket,
    createdBy: agent
  }
  const comment = new Comment(commentDetails);
  await comment.save();

  ticket.comments.push(comment);
  await ticket.save();

  return ticket;
};

export const buildProcessingTicket = async (creator: IUser): Promise<ITicket> => {
  const ticketDetails = ticketBase(creator);
  ticketDetails.title = 'Processing ticket';
  ticketDetails.description = `Processing ticket created by ${creator.username}`;
  ticketDetails.status = 'processing';
  ticketDetails.processedAt = Date.now();

  return await createTicket(ticketDetails, creator);
};

export const buildClosedTicket = async (creator: IUser, closedDaysAgo?: number): Promise<ITicket> => {
  const ticketDetails = ticketBase(creator);
  ticketDetails.title = 'Closed ticket';
  ticketDetails.description = `Open ticket created by ${creator.username}`;
  ticketDetails.status = 'closed';

  // if number of days ago was not supplied, we assume it was closed today
  const since = closedDaysAgo || 0;
  ticketDetails.closedAt = moment().subtract(since, 'days').toDate();

  return await createTicket(ticketDetails, creator);
}
