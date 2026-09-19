import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { authenticateAdmin, changeAdminPassword, getAdminById } from '../services/authService';
import { changePasswordSchema, loginSchema } from '../validators/schemas';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const admin = await authenticateAdmin(data);

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    req.session.adminId = admin.id;
    req.session.username = admin.username;
    req.session.mustChangePassword = admin.mustChangePassword;

    res.json({
      success: true,
      data: {
        username: admin.username,
        mustChangePassword: admin.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('emergent.sid');
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  });
});

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session?.adminId) {
      return res.json({ success: true, data: { authenticated: false } });
    }

    const admin = await getAdminById(req.session.adminId);
    if (!admin) {
      req.session.destroy(() => undefined);
      return res.json({ success: true, data: { authenticated: false } });
    }

    req.session.mustChangePassword = admin.mustChangePassword;

    return res.json({
      success: true,
      data: {
        authenticated: true,
        username: admin.username,
        mustChangePassword: admin.mustChangePassword,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/change-password', requireAdmin, async (req, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const result = await changeAdminPassword(req.session.adminId!, data);
    req.session.mustChangePassword = false;
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
