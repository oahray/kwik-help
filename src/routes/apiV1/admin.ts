import { Router } from 'express';
import * as adminController from '../../controllers/adminController'
import {
  authenticate,
  authorizeAdmin,
  setUser,
  excludeAdminTarget,
  setUsersByScope
} from '../../middleware';

const router = Router();

// Admin routes to view and manage customers and agents
router.get('/users', authenticate, authorizeAdmin, setUsersByScope, adminController.getUsers);

router.get('/users/:id', authenticate, authorizeAdmin, setUser, adminController.getUser);

router.patch('/users/:id/promote', authenticate, authorizeAdmin, setUser, excludeAdminTarget, adminController.promoteToAgent);

router.patch('/users/:id/demote', authenticate, authorizeAdmin, setUser, excludeAdminTarget, adminController.demoteAgent);

export default router;
