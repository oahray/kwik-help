import { RequestHandler } from 'express';

import {
  validateUsername,
  validateSignupEmail,
  validateSignupPassword,
  validateTicketTitle,
  validateTicketDescription,
  validateComment
} from '../utils/validatorHelpers';

export const signupInputValidation: RequestHandler = (req, res, next) => {
  const { email, username, password } = req.body;
  const errors = [];
  const checkEmail = validateSignupEmail(email);
  const checkPassword = validateSignupPassword(password);
  const checkName = validateUsername(username);

  if (checkEmail.error) {
    errors.push({
      scope: 'email',
      violation: checkEmail.error
    })
  }

  if (checkName.error) {
    errors.push({
      scope: 'username',
      violation: checkName.error
    })
  }

  if (checkPassword.error) {
    errors.push({
      scope: 'password',
      violation: checkPassword.error
    })
  }

  if (errors.length > 0) {
    return res.status(400).send({
      object: 'error',
      scope: 'signup',
      message: 'there are errors with your request',
      data: errors
    })
  }

  next();
};

export const loginInputValidation: RequestHandler = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username?.trim() && !email?.trim()) {
    errors.push({
      scope: 'username/email',
      violation: "username or email must be present"
    })
  }

  if (!password) {
    errors.push({
      scope: 'password',
      violation: 'Password must be present'
    })
  }

  if (errors.length > 0) {
    return res.status(400).send({

      object: 'error',
      scope: 'signin',
      message: 'there are errors with your request',
      data: errors
    })
  }

  next();
};

export const createTicketInputValidation: RequestHandler = (req, res, next) => {
  const { title, description } = req.body
  const titleViolation = validateTicketTitle(title).error;
  const descriptionViolation = validateTicketDescription(description).error
  const errors = [];

  if (titleViolation) {
    errors.push({
      scope: 'title',
      violation: titleViolation
    })
  }

  if (descriptionViolation) {
    errors.push({
      scope: 'description',
      violation: descriptionViolation
    })
  }

  if (errors.length > 0) {
    return res.status(400).send({
      object: 'error',
      scope: 'ticket',
      message: 'there are errors with your request',
      data: errors
    })
  }

  next();
}

export const createCommentInputValidation: RequestHandler = (req, res, next) => {
  const { body } = req.body
  const commentBodyViolation = validateComment(body)?.error;
  const errors = [];

  if (commentBodyViolation) {
    errors.push({
      scope: 'body',
      violation: commentBodyViolation
    })
  }

  if (errors.length > 0) {
    return res.status(400).send({
      object: 'error',
      scope: 'comment',
      message: 'there are errors with your request',
      data: errors
    })
  }

  next();
}
