import setupDB from '../helpers/setupDB';
import { IUser } from '../../models/User';
import { ITicket } from '../../models/Ticket'

import { buildOpenTicketWithComment } from '../helpers/factories/ticket';
import { buildAgent, buildCustomer } from '../helpers/factories/user';

setupDB('comment-model-test');

let customer: IUser, agent: IUser, openTicketWithComment: ITicket;

beforeAll(async () => {
  customer = await buildCustomer();
  agent = await buildAgent();
  openTicketWithComment = await buildOpenTicketWithComment(customer, agent)
});

describe('Comment', () => {
  describe('#toJSON', () => {
    it('returns a serialized ticket with object set to "ticket"', () => {
      const comment = openTicketWithComment.comments[0];
      const serializedComment = comment.toJSON();

      expect(serializedComment.object).toBe('comment');
    });
  });
});
