import { Router, Request, Response } from 'express';

import * as MainController from '../../controllers/authController'
import * as ticketsController from '../../controllers/ticketController';
import ticketRouter from './ticket';
import adminRouter from './admin';
import {
  authenticate,
  authorizeAgent,
  signupInputValidation,
  loginInputValidation,
  setReportTickets
} from  '../../middleware'

const router = Router();

router.post('/signup', signupInputValidation, MainController.signup);
router.post('/login', loginInputValidation, MainController.login);
router.post('/signin', loginInputValidation, MainController.login);

// admin routes
router.use('/admin', adminRouter);

// ticket routes
router.use('/tickets', ticketRouter);

// manage reports
router.get('/report', authenticate, authorizeAgent, setReportTickets, ticketsController.getReport)
router.get('/report/download', authenticate, authorizeAgent, setReportTickets, ticketsController.downloadReport);

// base API route
router.get('/', (req: Request, res: Response) => res.status(200).send({
  message: 'Welcome to the Kwik-Help API!',
}));

export default router;
