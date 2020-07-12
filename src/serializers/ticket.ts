import { ITicket } from '../models/Ticket';
import { IUser } from '../models/User';
import serializeUser from './user';

export default (ticket: ITicket): Record<string, unknown> => {
  return {
    object: 'ticket',
    id: ticket._id,
    title: ticket.title,
    description: ticket.description,
    creator: serializeUserIfPresent(ticket.creator),
    status: ticket.status,
    createdAt: ticket.createdAt,
    processedBy: serializeUserIfPresent(ticket.processedBy),
    processedAt: ticket.processedAt || null,
    closedBy: serializeUserIfPresent(ticket.closedBy),
    closedAt: ticket.closedAt || null,
    comments: ticket.comments || []
  }
}

const serializeUserIfPresent = (user: IUser) => {
  if (user) {
    return serializeUser(user)
  } else {
    return null
  }
}
