import 'dotenv/config';
import * as request from 'supertest';

import app from '../../app';
import { buildCustomer } from '../helpers/factories/user';
import { IUser } from '../../models/User';
import setupDB from '../helpers/setupDB';

let customer: IUser;
const API_BASE = '/api/v1';

setupDB('signin_test');

beforeEach(async () => {
  customer = await buildCustomer();
  await customer.save();
});

describe('Signup route', () => {
  describe('Input validations:', () => {
    describe('Username or Email', () => {
      it('is flagged when both are missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signin');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('username/email');
        expect(res.body.data[0].violation).toBe('username or email must be present');
      });
    });

    describe('Signin details', () => {
      it('is flagged with generic error message when supplied username is not found', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({
            username: 'newuser05',
            password: 'mypassword'
          });
        expect(res.status).toBe(401);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('username/email or password');
        expect(res.body.message).toBe('incorrect signin details');
      });

      it('is flagged with generic error message when supplied email is not found', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({
            email: 'newuser05@',
            password: 'mypassword'
          });
        expect(res.status).toBe(401);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('username/email or password');
        expect(res.body.message).toBe('incorrect signin details');
      });

      it('is flagged with generic error message when incorrect password is supplied with correct username', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({
            username: customer.username,
            password: 'wrongpassword'
          });
        expect(res.status).toBe(401);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('username/email or password');
        expect(res.body.message).toBe('incorrect signin details');
      });

      it('is flagged with generic error message when incorrect password is supplied with correct email', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({
            email: customer.email,
            password: 'wrongpassword'
          });
        expect(res.status).toBe(401);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('username/email or password');
        expect(res.body.message).toBe('incorrect signin details');
      });
    });

    describe('Password', () => {
      it('is flagged when missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({
            username: 'newuser05',
            email: 'newuser05@example.com'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signin');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('password');
      });
    });

    describe('All input violations', () => {
      it('are captured in response', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signin`)
          .send({});
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signin');
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0].scope).toBe('username/email');
        expect(res.body.data[1].scope).toBe('password');
      });
    });
  });

  describe('With correct details', () => {
    it('authenticates user with username', async () => {
      const res = await request(app)
        .post(`${API_BASE}/signin`)
        .send({
          username: customer.username,
          password: 'mypassword'
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined;
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toBeDefined;
      expect(res.body.user.email).toBe(customer.email);
      expect(res.body.user.username).toBe(customer.username);
      expect(res.body.user.password).toBeUndefined;
    });

    it('authenticates user with email', async () => {
      const res = await request(app)
        .post(`${API_BASE}/signin`)
        .send({
          email: customer.email,
          password: 'mypassword'
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined;
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toBeDefined;
      expect(res.body.user.email).toBe(customer.email);
      expect(res.body.user.username).toBe(customer.username);
      expect(res.body.user.password).toBeUndefined;
    });
  });
});
