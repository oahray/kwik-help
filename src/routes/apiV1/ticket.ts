import { Router } from 'express';
import * as ticketsController from '../../controllers/ticketController'
import {
  authenticate,
  authorizeAdmin,
  authorizeAgent,
  setTicket,
  createTicketInputValidation,
  createCommentInputValidation
} from '../../middleware';

const router = Router();

router.post('/', authenticate, createTicketInputValidation, ticketsController.createTicket);

router.get('/', authenticate, ticketsController.getUserTickets )

router.get('/:id', authenticate, setTicket, ticketsController.getTicket);

// Comment routes
router.post('/:id/comments', authenticate, setTicket, createCommentInputValidation, ticketsController.createComment);

router.get('/:id/comments', authenticate, setTicket, ticketsController.getComments);

// Other agent routes to process tickets
router.patch('/:id/process', authenticate, authorizeAgent, setTicket, ticketsController.processTicket);

router.patch('/:id/close', authenticate, authorizeAgent, setTicket, ticketsController.closeTicket);

router.patch('/:id/reset', authenticate, authorizeAgent, setTicket, ticketsController.resetTicket);

// Admin-only ticket route
router.delete('/:id', authenticate, authorizeAdmin, setTicket, ticketsController.deleteTicket);

export default router;
