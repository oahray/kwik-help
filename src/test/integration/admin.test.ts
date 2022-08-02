import 'dotenv/config';
import * as request from 'supertest';

import app from '../../app';
import { IUser } from '../../models/User';
import { buildCustomer, buildAgent, buildAdmin } from '../helpers/factories/user';
import setupDB from '../helpers/setupDB';

const API_BASE = '/api/v1/admin';
let customer: IUser, agent: IUser, admin: IUser;
let customerToken: string, agentToken: string, adminToken: string;

setupDB('admin_test');

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

describe('Admin:', () => {
  describe('Get Users:', () => {
    it('is not accessible to customers', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is not accessible to agents', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('returns a list of all users if no scope is specified', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].object).toBe('user');
    });

    it('returns a list of all admin users if scope is admin', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users?scope=admin`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].object).toBe('user');
      expect(res.body[0].isAdmin).toBe(true);
      expect(res.body[0].isAgent).toBe(false);
    });

    it('returns a list of all agents if scope is agent', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users?scope=agent`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].object).toBe('user');
      expect(res.body[0].isAdmin).toBe(false);
      expect(res.body[0].isAgent).toBe(true);
    });

    it('returns a list of all agents if scope is agents', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users?scope=agents`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].object).toBe('user');
      expect(res.body[0].isAdmin).toBe(false);
      expect(res.body[0].isAgent).toBe(true);
    });

    it('returns a list of all customers if scope is customer', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users?scope=customer`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].object).toBe('user');
    });

    it('returns a list of all customers if scope is customers', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users?scope=customers`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].object).toBe('user');
    });
  });

  describe('Get User:', () => {
    it('is not accessible to customers', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users/${customer._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is not accessible to agents', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users/${customer._id}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('allows admin view details of a user', async () => {
      const res = await request(app)
        .get(`${API_BASE}/users/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('user');
      expect(res.body.id).toBe(customer._id.toString());
    });
  });

  describe('Promote User:', () => {
    it('is not accessible to customers', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${customer._id}/promote`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is not accessible to agents', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${customer._id}/promote`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is returns an error if the user is already an agent', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${agent._id}/promote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('specified user is already an agent');
    });

    it('is returns an error if specified user is an admin', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${admin._id}/promote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('specified user is an admin');
    });

    it('allows admin grant a customer agent status', async () => {
      expect(customer.agent).toBe(false);

      const res = await request(app)
        .patch(`${API_BASE}/users/${customer._id}/promote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('user');
      expect(res.body.id).toBe(customer._id.toString());
      expect(res.body.isAgent).toBe(true);
    });
  });

  describe('Demote User:', () => {
    it('is not accessible to customers', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${customer._id}/demote`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is not accessible to agents', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${customer._id}/demote`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('insufficient permissions to perform this action');
    });

    it('is returns an error if the specified user is not an agent', async () => {
      const res = await request(app)
        .patch(`${API_BASE}/users/${customer._id}/demote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('specified user is not an agent');
    });

    it('is returns an error if the specified user is an admin', async () => {

      const res = await request(app)
        .patch(`${API_BASE}/users/${admin._id}/demote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.object).toBe('error');
      expect(res.body.message).toBe('specified user is an admin');
    });

    it("allows admin revoke a user's agent status", async () => {
      expect(agent.agent).toBe(true);

      const res = await request(app)
        .patch(`${API_BASE}/users/${agent._id}/demote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.object).toBe('user');
      expect(res.body.id).toBe(agent._id.toString());
      expect(res.body.isAgent).toBe(false);
    });
  });
});
