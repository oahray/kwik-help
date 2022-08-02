import { RequestHandler } from 'express';
import * as moment from 'moment';

import Ticket from '../models/Ticket';

export const setReportTickets: RequestHandler = async (req, res, next) => {

  res.locals.reportTickets = await Ticket.find({
    status: 'closed',
    closedAt: { $gte: moment().subtract(30, 'days').toDate() }

  }).populate('creator');

  next();
}
