import { buildAdmin, buildAgent, buildCustomer } from '../helpers/factories/user';
import {
  buildOpenTicket,
  buildProcessingTicket,
  buildClosedTicket,
  buildOpenTicketWithComment
} from '../helpers/factories/ticket';
import setupDB from '../helpers/setupDB';

setupDB('ticket_model_test')

let adminUser, agentUser, customer, openTicket,
  processingTicket ,closedTicket, openTicketWithComment

beforeEach(async () => {
  adminUser = await buildAdmin();
  agentUser = await buildAgent();
  customer = await buildCustomer();

  openTicket = await buildOpenTicket(customer);
  processingTicket = await buildProcessingTicket(customer);
  closedTicket = await buildClosedTicket(customer);
  openTicketWithComment = await buildOpenTicketWithComment(customer, agentUser);
});

describe('Ticket', () => {
  describe('#toJSON', () => {
    it('returns a serialized ticket with object set to "ticket"', () => {
      const serializedTicket = openTicketWithComment.toJSON();

      expect(serializedTicket.object).toBe('ticket');
    });
  });

  describe('#hasComments', () => {
    it('returns false for ticket without comments', () => {
      expect(openTicket.hasComments()).toBe(false);
    });

    it('returns true for ticket with comments', () => {
      expect(openTicketWithComment.hasComments()).toBe(true);
    });
  });

  describe('#isClosed', () => {
    it('returns true for closed tickets', () => {
      expect(closedTicket.isClosed()).toBe(true);
    });

    it('returns false for processing tickets', () => {
      expect(processingTicket.isClosed()).toBe(false);
    });

    it('returns false for open tickets', () => {
      expect(openTicket.isClosed()).toBe(false);
    });
  });

  describe('#isOpen', () => {
    it('returns true for open tickets', () => {
      expect(openTicket.isOpen()).toBe(true);
    });

    it('returns false for processing tickets', () => {
      expect(processingTicket.isOpen()).toBe(false);
    });

    it('returns false for closed tickets', () => {
      expect(closedTicket.isOpen()).toBe(false);
    });
  });

  describe('#isProcessing', () => {
    it('returns true for processing tickets', () => {
      expect(processingTicket.isProcessing()).toBe(true);
    });

    it('returns false for open tickets', () => {
      expect(openTicket.isProcessing()).toBe(false);
    });

    it('returns false for closed tickets', () => {
      expect(closedTicket.isProcessing()).toBe(false);
    });
  });

  describe('#close', () => {
    it('changes ticket status to closed', async () => {
      expect(openTicket.status).toBe('open');
      expect(processingTicket.status).toBe('processing');

      await openTicket.close();
      await processingTicket.close();

      expect(openTicket.status).toBe('closed');
      expect(processingTicket.status).toBe('closed');
    });
  });

  describe('#process', () => {
    it('changes ticket status to processing', async () => {
      expect(openTicket.status).toBe('open');
      expect(closedTicket.status).toBe('closed');

      await openTicket.process();
      await closedTicket.process();

      expect(openTicket.status).toBe('processing');
      expect(closedTicket.status).toBe('processing');
    });
  });

  describe('#reset', () => {
    it('changes ticket status to open', async () => {
      expect(closedTicket.status).toBe('closed');
      expect(processingTicket.status).toBe('processing');

      await closedTicket.reset();
      await processingTicket.reset();

      expect(openTicket.status).toBe('open');
      expect(processingTicket.status).toBe('open');
    });
  });

  describe('#userCanComment', () => {
    describe('when user is a customer', () => {
      it('returns false if there are no previous comments', () => {
        expect(openTicket.userCanComment(customer)).toBe(false);
      });

      it('returns true if there are previous comments', () => {
        expect(openTicketWithComment.userCanComment(customer)).toBe(true);
      });
    });


    describe('when user is a helpdesk agent', () => {
      it('returns true whether ticket has comments or not', () => {
        expect(openTicket.userCanComment(agentUser)).toBe(true);
        expect(openTicketWithComment.userCanComment(agentUser)).toBe(true);
      });
    })

    describe('when user is an admin', () => {
      it('returns true whether ticket has comments or not', () => {
        expect(openTicket.userCanComment(adminUser)).toBe(true);
        expect(openTicketWithComment.userCanComment(adminUser)).toBe(true);
      });
    })
  });
});
