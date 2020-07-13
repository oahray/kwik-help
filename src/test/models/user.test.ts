import * as jwt from 'jsonwebtoken';
import 'dotenv/config';

import User from '../../models/User';
import app from '../../app';
import { buildAdmin, buildAgent, buildCustomer } from '../helpers/factories/user';
import setupDB from '../helpers/setupDB';

app;
let adminUser;
let agentUser;
let customer;

setupDB('user_model_test');

beforeEach(async () => {
  adminUser = await buildAdmin();
  agentUser = await buildAgent();
  customer = await buildCustomer();
});

describe('User', () => {
  describe('#toJSON', () => {
    it('returns a serialized object that excludes password', () => {
      expect(customer.password).toBeDefined

      expect(customer.toJSON().email).toBe(customer.email);
      expect(customer.toJSON().password).toBeUndefined;
    });
  });

  describe('isPasswordMatch', () => {
    it('returns false for incorrect password', async () => {
      await customer.save();
      const matching = await customer.isPasswordMatch('somepassword');
      expect(matching).toBe(false);
    });

    it('returns true for correct password', async () => {
      await customer.save();
      const matching = await customer.isPasswordMatch('mypassword')
      expect(matching).toBe(true);
    });
  });

  describe('#generateJWT', () => {
    it('generates jwt with user id ', () => {
      const token = adminUser.generateJWT();

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        expect(decoded.access).toBe('auth');
        expect(decoded._id).toMatch(adminUser._id.toString());
      });
    });
  });

  describe('#isAgentOrAdmin', () => {
    it('returns false for customers', () => {
      expect(customer.isAgentOrAdmin()).toBe(false);
    });

    it('returns true for helpdesk agents', () => {
      expect(agentUser.isAgentOrAdmin()).toBe(true);
    });

    it('returns true for admin users', () => {
      expect(adminUser.isAgentOrAdmin()).toBe(true);
    });
  });

  describe('#grantAgentRole', () => {
    it('grants agent role to customers', async (done) => {
      expect(customer.agent).toBe(false);

      await customer.grantAgentRole();
      const user = await User.findById(customer._id);

      expect(user.agent).toBe(true);
      done();
    });
  });


  describe('#revokeAgentRole', () => {
    it('revokes agent role from agents', async (done) => {
      expect(agentUser.agent).toBe(true);

      await agentUser.revokeAgentRole();
      const user = await User.findById(agentUser._id)

      expect(user.agent).toBe(false);
      done()
    });
  });
});
