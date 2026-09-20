import { Router } from 'express';
import { createRegistration } from '../services/registrationService';
import { registrationSchema } from '../validators/schemas';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const data = registrationSchema.parse(req.body);
    const registration = await createRegistration(data);

    res.status(201).json({
      success: true,
      data: {
        registrationId: registration.id,
        name: registration.name,
        message: 'Registration successful!',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
