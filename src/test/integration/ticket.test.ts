import 'dotenv/config';
import * as request from 'supertest';

import app from '../../app';
import { IUser } from '../../models/User';
import {
  buildOpenTicket,
  buildProcessingTicket,
  buildClosedTicket,
  buildOpenTicketWithComment
} from '../helpers/factories/ticket'
import { buildCustomer, buildAgent, buildAdmin } from '../helpers/factories/user';
import setupDB from '../helpers/setupDB';
import Ticket from '../../models/Ticket';

const baseTitle = 'Please help';
const baseDescription = 'I need some help getting so and so to work';
const API_BASE = '/api/v1';
let customer: IUser, agent: IUser, admin: IUser;
let customerToken: string, agentToken: string, adminToken: string;

setupDB('tickets_test');

beforeEach(async () => {
  customer = await buildCustomer();
  agent = await buildAgent();
  admin = await buildAdmin();

  await customer.save();
  await agent.save();
  await admin.save();

  customerToken = customer.generateJWT();
  agentToken = agent.generateJWT();
  adminToken = admin.generateJWT();
});

describe('Ticket:', () => {
  describe('Input validations:', () => {
    describe('Title', () => {
      it('is flagged when missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/tickets`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            description: baseDescription
          });

        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('ticket');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('title');
        expect(res.body.data[0].violation).toBe('ticket title must be present');
      });
    });

    describe('Description', () => {
      it('is flagged when missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/tickets`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            title: baseTitle
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('ticket');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('description');
        expect(res.body.data[0].violation).toBe('ticket description must be present');
      });
    });
  });


  describe('Create Ticket:', () => {
    it('creates ticket with the supplied title and description', async () => {
      const res = await request(app)
        .post(`${API_BASE}/tickets`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: baseTitle,
          description: baseDescription
        });
      expect(res.status).toBe(201);
      expect(res.body.object).toBe('ticket');
      expect(res.body.title).toBe(baseTitle);
      expect(res.body.description).toBe(baseDescription);
      expect(res.body.creator.id).toBe(customer._id.toString());
    });
  });

  describe('Get Tickets:', () => {
    it("returns a customer's own tickets for them", async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .get(`${API_BASE}/tickets`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].object).toBe('ticket');
      expect(res.body[0].id).toBe(ticket._id.toString());
      expect(res.body[0].creator.id).toBe(customer._id.toString());
    });
  });

  describe('Get Ticket:', () => {
    it("returns a user's ticket", async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .get(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());
      expect(res.body.creator.id).toBe(customer._id.toString());
    });

    it("does not return another customer's ticket", async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const secondCustomer = await buildCustomer();
      await secondCustomer.save()

      customerToken = secondCustomer.generateJWT();

      const res = await request(app)
        .get(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.object).toBe('ticket');
      expect(res.body.message).toBe('ticket not found');
    });

    it("allows helpdesk agents view any ticket ticket", async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      agentToken = agent.generateJWT();

      const res = await request(app)
        .get(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());
      expect(res.body.creator.id).toBe(customer._id.toString());
    });

    it("allows admin users view any ticket ticket", async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      adminToken = admin.generateJWT();

      const res = await request(app)
        .get(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());
      expect(res.body.creator.id).toBe(customer._id.toString());
    });
  });

  describe('Process ticket', () => {
    it('is not accessible to customers', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/process`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('returns an error if ticket is already processing', async () => {
      const ticket = await buildProcessingTicket(customer);
      await ticket.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/process`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('ticket is already processing');
    });

    it('returns an error if ticket is already closed', async () => {
      const ticket = await buildClosedTicket(customer);
      await ticket.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/process`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('you cannot process a closed ticket');
    });

    it('changes the status of an open ticket to processing', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();
      await agent.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/process`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());
      expect(res.body.status).toBe('processing');
      expect(res.body.processedBy.id).toBe(agent._id.toString());
    });
  });

  describe('Close ticket', () => {
    it('is not accessible to customers', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/close`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('returns an error if ticket is open', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();
      await agent.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/close`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('ticket must be processed first before being closed');
    });

    it('returns an error if ticket is already closed', async () => {
      const ticket = await buildClosedTicket(customer);
      await ticket.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/close`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('ticket is already closed');
    });

    it('changes the status of a processing ticket to closed', async () => {
      const ticket = await buildProcessingTicket(customer);
      await ticket.save();
      await agent.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/close`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());
      expect(res.body.status).toBe('closed');
      expect(res.body.closedBy.id).toBe(agent._id.toString());
    });
  });

  describe('Reset ticket', () => {
    it('is not accessible to customers', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/reset`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('returns an error if ticket is open', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();
      await agent.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/reset`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('ticket is still open');
    });

    it('changes the status of a closed ticket to open', async () => {
      const ticket = await buildClosedTicket(customer);
      await ticket.save();
      await agent.save();

      const res = await request(app)
        .patch(`${API_BASE}/tickets/${ticket._id}/reset`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());
      expect(res.body.status).toBe('open');
      expect(res.body.closedBy).toBeUndefined;
    });
  });

  describe('Delete ticket', () => {
    it('is not accessible to customers', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .delete(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is not accessible to agents', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .delete(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('lets an admin user delete a ticket', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .delete(`${API_BASE}/tickets/${ticket._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('ticket');
      expect(res.body.id).toBe(ticket._id.toString());

      expect(await Ticket.findById(ticket._id)).toBeUndefined;
    });
  });

  describe('Create comment', () => {
    it('flags an empty comment body', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .post(`${API_BASE}/tickets/${ticket._id}/comments`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          body: '       '
        });

      expect(res.status).toBe(400);
      expect(res.body.object).toBe('error');
      expect(res.body.data[0].scope).toBe('body');
      expect(res.body.data[0].violation).toBe('comment body must be present');

      expect(await Ticket.findById(ticket._id)).toBeUndefined;
    });

    it('prevents a customer from commenting on a ticket until an agent or admin has commented', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .post(`${API_BASE}/tickets/${ticket._id}/comments`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          body: 'Hi. Please respond'
        });

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('you cannot comment on this ticket until an agent first comments');
    });

    it('allows a customer comment on a ticket if an agent or admin has already commented', async () => {
      const ticket = await buildOpenTicketWithComment(customer, agent);
      await ticket.save();

      const res = await request(app)
        .post(`${API_BASE}/tickets/${ticket._id}/comments`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          body: 'Hi. Thanks for the response. So...'
        });

      expect(res.status).toBe(201);
      expect(res.body.object).toBe('comment');
      expect(res.body.createdBy).toBe(customer._id.toString());
    });

    it('allows an agent comment on a ticket without comments', async () => {
      const ticket = await buildOpenTicket(customer);
      await ticket.save();

      const res = await request(app)
        .post(`${API_BASE}/tickets/${ticket._id}/comments`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          body: 'Hi. Not sure I understand your request.'
        });

      expect(res.status).toBe(201);
      expect(res.body.object).toBe('comment');
      expect(res.body.createdBy).toBe(agent._id.toString());
    });
  });

  describe('Get comments', () => {
    it('returns a list of comments on the ticket', async () => {
      const ticket = await buildOpenTicketWithComment(customer, agent);
      await ticket.save();

      const res = await request(app)
        .get(`${API_BASE}/tickets/${ticket._id}/comments`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      // expect it to have just one comment
      expect(res.body.length).toBe(1);
      expect(res.body[0].object).toBe('comment');
      expect(res.body[0].createdBy).toBe(agent._id.toString());
    });
  });

  describe('Get Report', () => {
    it('is not accessible to customers', async () => {
      const res = await request(app)
        .get(`${API_BASE}/report`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('does not include tickets closed more than 30 days ago', async () => {
      // We want a ticket closed 35 days ago
      const ticket = await buildClosedTicket(customer, 35)
      await ticket.save()

      const res = await request(app)
        .get(`${API_BASE}/report`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('does not include tickets closed more than 30 days ago', async () => {
      // We want a recently closed ticket
      const ticket = await buildClosedTicket(customer, 5);
      await ticket.save();

      const res = await request(app)
        .get(`${API_BASE}/report`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].object).toBe('ticket');
      expect(res.body[0].id).toBe(ticket._id.toString());
    });
  });

  describe('Download Report', () => {
    it('is not accessible to customers', async () => {
      const res = await request(app)
        .get(`${API_BASE}/report/download`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('returns error message if there are no tickets', async () => {
      const res = await request(app)
        .get(`${API_BASE}/report/download`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('no ticket data to download')
    });

    it('allows agents download a csv report', async () => {
      const ticket = await buildClosedTicket(customer, 5);
      await ticket.save()

      const res = await request(app)
        .get(`${API_BASE}/report/download`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.type).toBe('text/csv');
    });

    it('allows admin users download a csv report', async () => {
      const ticket = await buildClosedTicket(customer, 5);
      await ticket.save()

      const res = await request(app)
        .get(`${API_BASE}/report/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.type).toBe('text/csv');
    });
  });
});
