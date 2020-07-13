import { IUser } from '../models/User';

export default (user: IUser): Record<string, unknown> => {
  return {
    object: 'user',
    id: user._id,
    username: user.username,
    email: user.email,
    registeredAt: user.createdAt,
    isAdmin: user.admin,
    isAgent: user.agent
  }
}
