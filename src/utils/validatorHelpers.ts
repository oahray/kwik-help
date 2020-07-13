import validator from 'validator';

const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 24;

const inputEmpty = (str: string): boolean => !str

const inputIsWhiteSpace = (str: string): boolean => str.trim().length < 1;

const inputTooShort = (str: string, min: number): boolean => str && str.trim().length < min;

const inputTooLong = (str: string, max: number): boolean => str && str.trim().length > max;

export const validatePresence = (str: string, scope: string): Record<string, unknown> => {
  if (inputEmpty(str) || inputIsWhiteSpace(str)) {
    return { error: `${scope} must be present` }
  }

  return;
}

export const validateUsername = (str: string): Record<string,unknown> => {
  const missing = validatePresence(str, 'username');

  if (missing) {
    return missing;
  }

  if (inputTooShort(str, MIN_USERNAME_LENGTH)) {
    return { error: `username must not be shorter than ${MIN_USERNAME_LENGTH} characters` }
  }

  if (inputTooLong(str, MAX_USERNAME_LENGTH)) {
    return { error: `username must not be longer than ${MAX_USERNAME_LENGTH} characters` }
  }

  return {};
}

export const validateSignupEmail = (str: string): Record<string, unknown> => {
  const missing = validatePresence(str, 'email');
  if (missing) {
    return missing;
  }

  if (!validator.isEmail(str)) {
    return { error: 'email is invalid'}
  }
  return {};
}

export const validateSignupPassword = (str: string): Record<string, unknown> => {
  const missing = validatePresence(str, 'password');

  if (missing) {
    return missing;
  }

  if (str.length < MIN_PASSWORD_LENGTH) {
    return { error: `password must not be less than ${MIN_PASSWORD_LENGTH} characters` }
  }

  return {};
}

export const validateTicketTitle = (str: string): Record<string, unknown> => {
  return validatePresence(str, 'ticket title') || {};
}

export const validateTicketDescription = (str: string): Record<string, unknown> => {
  return validatePresence(str, 'ticket description') || {};
}

export const validateComment = (str: string): Record<string, unknown> => {
  return validatePresence(str, 'comment body') || {};
}
