import { RequestHandler } from 'express';

import User from '../models/User';
import { permittedParams } from '../utils/permittedParams';
import {
  PERMITTED_AUTH_PARAMS
} from '../constants/permittedParams'


export const signup: RequestHandler = async (req, res) => {
  const signupParams = permittedParams(req.body, PERMITTED_AUTH_PARAMS);

  if (await User.findOne({ email: signupParams.email })) {
    res.status(409).send({
      object: 'error',
      scope: 'email',
      message: 'email is already taken'
    });
  } else if (await User.findOne({ username: signupParams.username })) {
    res.status(409).send({
      object: 'error',
      scope: 'username',
      message: 'username is already taken'
    });
  } else {
    const user = await new User(signupParams).save();
    const token = user.generateJWT();
    res.status(201).send({ token, user });
  }
}

export const login: RequestHandler = async (req, res) => {
  const loginDetails = req.body;

  const user = await User.findOne({$or: [
    { email: req.body.email },
    { username: req.body.username }
  ]})

  if (user) {
    if (await user.isPasswordMatch(loginDetails.password)) {
      const token = user.generateJWT();
      res.status(200).send({ token, user });
    } else {
      res.status(401).send({
        object: 'error',
        scope: 'username/email or password',
        message: 'incorrect signin details'
      })
    }
  } else {
    res.status(401).send({
      object: 'error',
      scope: 'username/email or password',
      message: 'incorrect signin details'
    })
  }
}
