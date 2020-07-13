import * as bcrypt from 'bcrypt';

export const hashString = async (str: string): Promise<string> => {
  return await bcrypt.hash(str, 10);
}

export const compareStringWithHash = async (str: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(str, hash);
}
