import { Request, Response } from 'express';
import { config } from '../config/env';

export const verifyWebhook = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.webhookVerifyToken) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

import { BotService } from '../services/bot.service';

export const handleMessage = async (req: Request, res: Response) => {
    const body = req.body;

    // Check if this is an event from a WhatsApp API subscription
    if (body.object) {
        console.log('Incoming webhook:', JSON.stringify(body, null, 2));

        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from;

            // Process message asynchronously so we don't block the 200 OK response
            BotService.handleIncomingMessage(from, message).catch(err =>
                console.error('Error handling message:', err)
            );
        }

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

import { verifySendBitWebhook } from '../utils/sendbit.utils';

export const handleSendbitWebhook = async (req: Request, res: Response) => {
    // Verify signature
    if (!config.sendbitClientSecret) {
        console.error('Sendbit Client Secret not configured');
        res.status(500).send('Server Configuration Error');
        return;
    }

    const isValid = verifySendBitWebhook(req, res, config.sendbitClientSecret);
    if (!isValid) return; // verifySendBitWebhook handles the error response

    console.log('Received valid Sendbit Webhook:', JSON.stringify(req.body, null, 2));

    // TODO: Handle specific events from Sendbit (Deposit, etc.)

    res.status(200).send('Event Received');
};
