import { IComment } from '../models/Comment'

export default (comment: IComment): Record<string, unknown> => {
  return {
    object: 'comment',
    id: comment._id,
    body: comment.body,
    ticket: comment.ticket._id,
    createdBy: comment.createdBy._id,
    createdAt: comment.createdAt
  }
}
