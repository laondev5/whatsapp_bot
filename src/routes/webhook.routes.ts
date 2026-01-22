import { Router } from 'express';
import { verifyWebhook, handleMessage, handleSendbitWebhook } from '../controllers/webhook.controller';

const router = Router();

router.get('/webhook', verifyWebhook);
router.post('/webhook', handleMessage);
router.post('/sendbit', handleSendbitWebhook);

export default router;
