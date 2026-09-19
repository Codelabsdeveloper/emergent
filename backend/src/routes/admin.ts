import { Router } from 'express';
import { requireAdmin, requirePasswordChanged } from '../middleware/auth';
import {
  exportRegistrationsCsv,
  getDashboardStats,
  getRegistrationById,
  listRegistrations,
} from '../services/registrationService';
import { registrationsQuerySchema } from '../validators/schemas';

const router = Router();

router.use(requireAdmin, requirePasswordChanged);

router.get('/dashboard/stats', async (_req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/registrations/export', async (req, res, next) => {
  try {
    const query = registrationsQuerySchema.parse(req.query);
    const csv = await exportRegistrationsCsv(query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get('/registrations', async (req, res, next) => {
  try {
    const query = registrationsQuerySchema.parse(req.query);
    const result = await listRegistrations(query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/registrations/:id', async (req, res, next) => {
  try {
    const registration = await getRegistrationById(req.params.id);
    res.json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
});

export default router;
