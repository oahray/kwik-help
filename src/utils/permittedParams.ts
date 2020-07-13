import { pick  } from 'lodash';
export const permittedParams = ( requestBody: Record<string, unknown>, permittedInputParams: readonly string[]): Record<string, unknown> => {
  return pick(requestBody, permittedInputParams);
};
