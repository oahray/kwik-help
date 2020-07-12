import 'dotenv/config';
import * as request from 'supertest';

import app from '../../app';
import { buildCustomer } from '../helpers/factories/user';
import { IUser } from '../../models/User';
import setupDB from '../helpers/setupDB';

let customer: IUser;
const API_BASE = '/api/v1';

setupDB('signup_test');

beforeEach(async () => {
  customer = await buildCustomer();
  await customer.save();
});

describe('Signup route', () => {
  describe('Input validations:', () => {
    describe('Username', () => {
      it('is flagged when missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            email: 'newuser05@example.com',
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signup');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('username');
        expect(res.body.data[0].violation).toBe('username must be present');
      });

      it('is flagged when it is just whitespace', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            email: 'newuser05@example.com',
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('username');
        expect(res.body.data[0].violation).toBe('username must be present');
      });

      it('is flagged when it is too short', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'a',
            email: 'newuser05@example.com',
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('username');
        expect(res.body.data[0].violation).toBe('username must not be shorter than 3 characters');
      });

      it('is flagged when it is too long', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'So this is an extremely long username that I chose to use for the sake of this test.',
            email: 'newuser05@example.com',
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('username');
        expect(res.body.data[0].violation).toBe('username must not be longer than 24 characters');
      });

      it('is flagged when it already exists in the database', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: customer.username,
            email: 'somefreshusername@example.com',
            password: 'mypassword'
          });
        expect(res.status).toBe(409);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('username');
        expect(res.body.message).toBe('username is already taken');
      });
    });

    describe('Email', () => {
      it('is flagged when missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'newuser05',
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signup');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('email');
        expect(res.body.data[0].violation).toBe('email must be present');
      });

      it('is flagged when invalid', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'newuser05',
            email: 'someinvalidemail',
            password: 'mypassword'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signup');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('email');
        expect(res.body.data[0].violation).toBe('email is invalid');
      });

      it('is flagged when it already exists in the database', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'user05',
            email: customer.email,
            password: 'mypassword'
          });
        expect(res.status).toBe(409);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('email');
        expect(res.body.message).toBe('email is already taken');
      });
    });

    describe('Password', () => {
      it('is flagged when missing', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'newuser05',
            email: 'newuser05@example.com'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signup');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('password');
        expect(res.body.data[0].violation).toBe('password must be present');
      });

      it('is flagged when it is too short', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({
            username: 'newuser05',
            email: 'newuser05@example.com',
            password: 'this'
          });
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signup');
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].scope).toBe('password');
        expect(res.body.data[0].violation).toBe('password must not be less than 6 characters');

      });
    });

    describe('All input violations', () => {
      it('are captured in response', async () => {
        const res = await request(app)
          .post(`${API_BASE}/signup`)
          .send({});
        expect(res.status).toBe(400);
        expect(res.body.object).toBe('error');
        expect(res.body.scope).toBe('signup');
        expect(res.body.data.length).toBe(3);
        expect(res.body.data[0].scope).toBe('email');
        expect(res.body.data[1].scope).toBe('username');
        expect(res.body.data[2].scope).toBe('password');
      });
    });
  });

  describe('With valid details', () => {
    it('authenticates user with username', async () => {
      const userDetails = {
        email: 'user05@example.com',
        username: 'user05',
        password: 'mypassword'
      }

      const res = await request(app)
        .post(`${API_BASE}/signup`)
        .send(userDetails);
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined;
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toBeDefined;
      expect(res.body.user.email).toBe(userDetails.email);
      expect(res.body.user.username).toBe(userDetails.username);
      expect(res.body.user.password).toBeUndefined;
    });
  });
});
