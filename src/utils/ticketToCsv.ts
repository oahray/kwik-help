import { parseAsync } from 'json2csv';
import { ITicket } from '../models/Ticket';
import { IUser } from 'models/User';

export const ticketsToCsv = async (tickets: ITicket[], user: IUser): Promise<unknown> => {
  const fields = ticketFields(user);
  const csvData = ticketCsvData(tickets, user);

  return await parseAsync(csvData, { fields});
}

const ticketFields = (user) => {
  if (user.admin) {
    return adminTicketFields();
  } else {
    return baseTicketFields;
  }
}

const baseTicketFields = [
  {
    label: 'Date',
    value: 'date'
  },
  {
    label: 'Title',
    value: 'title'
  },
  {
   label: 'Description',
    value: 'description'
  },
  {
   label: 'Creator',
    value: 'creator'
  },
  {
   label: 'Status',
    value: 'status'
  },
  {
   label: 'Comments',
    value: 'description'
  }
];

const adminTicketFields = () => {
  return [
    ...baseTicketFields,
    {
      label: 'Processed By',
      value: 'processedBy'
    }, {
      label: 'Processed At',
      value: 'processedBy'
    }, {
      label: 'Closed By',
      value: 'closedBy'
    }, {
      label: 'Closed At',
      value: 'closedBy'
    }
  ]
}

const ticketCsvData = (tickets, user) => {
  if (user.admin) {
    return tickets.map((ticket) => adminTicketValues(ticket));
  } else {
    return tickets.map((ticket) => adminTicketValues(ticket));
  }
};

const baseTicketValues = (ticket) => {
  return {
    date: ticket.createdAt,
    title: ticket.title,
    description: ticket.description,
    creator: ticket.creator.email,
    status: ticket.status,
    comments: ticket.comments?.length || 0
  }
}

const adminTicketValues = (ticket) => {
  return {
    ...baseTicketValues(ticket),
    processedBy: ticket.processedBy?.email,
    processedAt: ticket.processedAt || null,
    closedBy: ticket.closedBy?.email,
    closedAt: ticket.closedAt,
  }
}


