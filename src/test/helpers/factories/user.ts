import User, { IUser } from '../../../models/User';

this.adminCount = 0;
this.agentCount = 0;
this.userCount = 0;

const userBase = (username: string) => ({
  username,
  email: `${username}@example.com`,
  password: 'mypassword',
  admin: false,
  agent: false
});

const buildUser = async (userDetails: Record<string, unknown>) => {
  const user = new User(userDetails);
  // await user.save();

  return user;
}

export const buildAdmin = async function (): Promise<IUser> {
  this.adminCount += 1;
  const name = `admin${this.adminCount}`;
  const userDetails = userBase(name);
  userDetails.admin = true;

  return await buildUser(userDetails);
}

export const buildAgent = async function(): Promise<IUser> {
  this.agentCount += 1;
  const name = `agent${this.agentCount}`
  const userDetails = userBase(name);
  userDetails.agent = true;

  return await buildUser(userDetails);
}

export const buildCustomer = async function(): Promise<IUser> {
  this.userCount += 1;
  const name = `user${this.userCount}`
  const userDetails = userBase(name);

  return await buildUser(userDetails);
}
