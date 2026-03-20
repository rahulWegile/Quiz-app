import express from 'express'
import { payment,stripeWebhook,confirmPayment } from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router= express.Router();

router.post("/payment",verifyToken,payment)
router.post('/payment/confirm', verifyToken, confirmPayment)
router.post("/payment/webhook", express.raw({ type: 'application/json' }), stripeWebhook)

export default router