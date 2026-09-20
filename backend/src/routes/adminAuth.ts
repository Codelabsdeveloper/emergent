import { Router } from 'express';
import { authenticateAdmin, getAdminById } from '../services/authService';
import { loginSchema } from '../validators/schemas';

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

    res.json({
      success: true,
      data: {
        username: admin.username,
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

    return res.json({
      success: true,
      data: {
        authenticated: true,
        username: admin.username,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
